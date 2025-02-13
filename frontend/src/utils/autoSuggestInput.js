import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import styles from "../styles/AutoSuggestInput.module.css";

// Helper function to highlight the matched text in an option's label.
const highlightMatch = (label, query) => {
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
};

const AutoSuggestInput = ({
  name,
  control,
  options,
  onAddNew,
  placeholder = "",
  ...rest
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Filter options based on input value.
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render suggestion list item
  const renderSuggestion = (option, onSelect) => (
    <li
      key={option.value}
      onClick={() => onSelect(option)}
      className="autosuggest-option"
    >
      {highlightMatch(option.label, inputValue)}
    </li>
  );

  // Render "Add New" option if input doesn't match any options.
  const renderAddNewOption = (onSelect) => (
    <li
      onClick={() =>
        onSelect({ label: inputValue, value: inputValue, isNew: true })
      }
      className="autosuggest-option add-new"
    >
      {`Add new "${inputValue}"`}
    </li>
  );

  // Main render using Controller from React Hook Form
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field: { onChange, value } }) => (
        <div className={styles.inputWrapper} ref={wrapperRef}>
          <input
            type="text"
            className={styles.inputField}
            value={inputValue || value || ""}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(""); // Clear selection until user picks one.
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
          />
          {showSuggestions && (
            <ul className={styles.suggestionsList}>
              {filteredOptions.length > 0
                ? filteredOptions.map((option) => (
                    <li
                      key={option.value}
                      className={styles.suggestionItem}
                      onClick={() => {
                        setInputValue(option.label);
                        onChange(option.value);
                        setShowSuggestions(false);
                      }}
                    >
                      {highlightMatch(option.label, inputValue)}
                    </li>
                  ))
                : inputValue.trim() && (
                    <li
                      className={`${styles.suggestionItem} ${styles.addNewOption}`}
                      onClick={() => {
                        onAddNew(inputValue)
                          .then((newOption) => {
                            setInputValue(newOption.label);
                            onChange(newOption.value);
                          })
                          .catch((err) =>
                            console.error("Error adding new option:", err)
                          );
                        setShowSuggestions(false);
                      }}
                    >
                      Add new "{inputValue}"
                    </li>
                  )}
            </ul>
          )}
        </div>
      )}
    />
  );
};

AutoSuggestInput.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
    })
  ).isRequired,
  onAddNew: PropTypes.func.isRequired, // Should return a Promise that resolves to a new option object
  placeholder: PropTypes.string,
};

export default AutoSuggestInput;
