// autoSuggestInput.js
import React from "react";
import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import styles from "../styles/AutoSuggestInput.module.css";

import Button from "../components/Button";

// -- Sub-component #1: For React Hook Form usage --
function AutoSuggestInputRHF({
  name,
  control,
  options,
  onAddNew,
  placeholder,
  ...rest
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [filteredOptions, setFilteredOptions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(options);
    } else {
      const lower = inputValue.toLowerCase();
      setFilteredOptions(
        options.filter((o) => o.label.toLowerCase().includes(lower))
      );
    }
  }, [inputValue, options]);

  React.useEffect(() => {
    const handleClickOutside = (evt) => {
      if (wrapperRef.current && !wrapperRef.current.contains(evt.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field: { onChange: rhfOnChange, value: rhfValue } }) => (
        <div
          className={`${styles.inputWrapper} ${
            inputValue ? styles.hasValue : ""
          }`}
          ref={wrapperRef}
          {...rest}
        >
          <input
            type="text"
            className={styles.inputField}
            value={inputValue || rhfValue || ""}
            onChange={(e) => {
              setInputValue(e.target.value);
              rhfOnChange("");
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
          />

          <Button
            variant="danger"
            size="small"
            className={styles.clearButton}
            onClick={(e) => {
              e.stopPropagation();
              setInputValue("");
              rhfOnChange("");
            }}
            aria-label="Clear input"
          >
            x
          </Button>

          {showSuggestions && (
            <ul className={styles.suggestionsList}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <li
                    key={opt.value}
                    className={styles.suggestionItem}
                    onClick={() => {
                      setInputValue(opt.label);
                      rhfOnChange(opt.value); // store ID in RHF
                      setShowSuggestions(false);
                    }}
                  >
                    {highlightMatch(opt.label, inputValue)}
                  </li>
                ))
              ) : inputValue.trim() ? (
                <li
                  className={`${styles.suggestionItem} ${styles.addNewOption}`}
                  onClick={() => {
                    if (onAddNew) {
                      onAddNew(inputValue)
                        .then((newOpt) => {
                          setInputValue(newOpt.label);
                          rhfOnChange(newOpt.value);
                        })
                        .catch((err) =>
                          console.error("Error adding new option:", err)
                        );
                      setShowSuggestions(false);
                    }
                  }}
                >
                  Add new "{inputValue}"
                </li>
              ) : null}
            </ul>
          )}
        </div>
      )}
    />
  );
}

// -- Sub-component #2: For controlled usage (no `control`) --
function AutoSuggestInputControlled({
  options,
  onAddNew,
  placeholder,
  value,
  onChange,
  ...rest
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [filteredOptions, setFilteredOptions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const wrapperRef = React.useRef(null);

  // Filter as user types
  React.useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(options);
    } else {
      const lower = inputValue.toLowerCase();
      setFilteredOptions(
        options.filter((o) => o.label.toLowerCase().includes(lower))
      );
    }
  }, [inputValue, options]);

  // Close if clicked outside
  React.useEffect(() => {
    const handleClickOutside = (evt) => {
      if (wrapperRef.current && !wrapperRef.current.contains(evt.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync inputValue if parent changes `value`
  React.useEffect(() => {
    if (!value) {
      setInputValue("");
    } else {
      const match = options.find((o) => o.value === value);
      setInputValue(match ? match.label : "");
    }
  }, [value, options]);

  const handleSelectOption = (opt) => {
    if (opt.isNew) {
      if (onAddNew) {
        onAddNew(opt.label)
          .then((newOpt) => {
            setInputValue(newOpt.label);
            onChange?.(newOpt.value);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
          })
          .catch((err) => console.error("Error adding new option:", err));
      }
    } else {
      setInputValue(opt.label);
      onChange?.(opt.value);
    }
    setShowSuggestions(false);
  };

  return (
    <div
      className={`${styles.inputWrapper} ${inputValue ? styles.hasValue : ""}`}
      ref={wrapperRef}
      {...rest}
    >
      <input
        type="text"
        className={`${styles.inputField} ${
          showSuccess ? styles.successHighlight : ""
        }`}
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => setShowSuggestions(true)}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
      />

      <Button
        variant="danger"
        size="small"
        className={styles.clearButton}
        onClick={(e) => {
          e.stopPropagation();
          setInputValue("");
          onChange("");
          setShowSuggestions(false);
        }}
        aria-label="Clear input"
      >
        x
      </Button>

      {showSuggestions && (
        <ul className={styles.suggestionsList}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((o) => (
              <li
                key={o.value}
                className={styles.suggestionItem}
                onClick={() => handleSelectOption(o)}
              >
                {highlightMatch(o.label, inputValue)}
              </li>
            ))
          ) : typeof inputValue === "string" &&
            inputValue.trim() &&
            onAddNew ? (
            <li
              className={`${styles.suggestionItem} ${styles.addNewOption}`}
              onClick={() =>
                handleSelectOption({
                  label: inputValue,
                  value: inputValue,
                  isNew: true,
                })
              }
            >
              Add new "{inputValue}"
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

// -- The single exported component, picks which sub-component to use. --
function AutoSuggestInput(props) {
  // If 'props.control' is provided => use the React Hook Form sub-component
  if (props.control) {
    return <AutoSuggestInputRHF {...props} />;
  }
  // Otherwise => use the controlled sub-component
  return <AutoSuggestInputControlled {...props} />;
}

// Utility function for highlighting matches.
function highlightMatch(label, query) {
  if (!query) return label;
  const regex = new RegExp(`(${query})`, "gi");
  const parts = label.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <strong key={index} style={{ fontWeight: "bold" }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

AutoSuggestInput.propTypes = {
  // For React Hook Form usage:
  name: PropTypes.string,
  control: PropTypes.object,
  // For controlled usage:
  value: PropTypes.any,
  onChange: PropTypes.func,
  // Common props:
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
    })
  ).isRequired,
  onAddNew: PropTypes.func,
  placeholder: PropTypes.string,
};

AutoSuggestInput.defaultProps = {
  name: "",
  control: null,
  value: "",
  onChange: null,
  onAddNew: null,
  placeholder: "",
};

export default AutoSuggestInput;
