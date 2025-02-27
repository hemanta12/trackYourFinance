import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createIncome } from "../../redux/incomeSlice";
import { addSourceThunk, fetchSources } from "../../redux/listSlice";
import styles from "../../styles/components/forms/IncomeForm.module.css";
import AutoSuggestInput from "../../utils/autoSuggestInput";
import { NumericFormat } from "react-number-format";
import Button from "../common/Button";

const IncomeForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      date: new Date().toISOString().split("T")[0],
      source_id: "",
      notes: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const sources = useSelector((state) => state.lists.sources);

  useEffect(() => {
    dispatch(fetchSources());
  }, [dispatch]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        createIncome({
          amount: Number(data.amount),
          source_id: Number(data.source_id),
          date: data.date,
          notes: data.notes,
        })
      ).unwrap();
      setIsSuccess(true);
      setTimeout(() => {
        reset();
        setFormKey((prev) => prev + 1);
        if (onClose && typeof onClose === "function") {
          onClose();
        }
        setIsSubmitting(false);
        setIsSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to add income:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Add Income</h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.cardRow}>
          {/* Primary Column: Amount and Date */}
          <div className={styles.primaryColumn}>
            <div className={styles.field}>
              <label>
                Amount <span className={styles.requiredAsterisk}>*</span>:
              </label>
              <div className={styles.inputWrapper}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: "Amount is required" }}
                  render={({ field: { onChange, onBlur, value, ref } }) => {
                    const hasValue =
                      value !== null && value !== undefined && value !== "";
                    return (
                      <div className={styles.clearableInputWrapper}>
                        <NumericFormat
                          value={value}
                          thousandSeparator={true}
                          prefix="$"
                          decimalScale={2}
                          fixedDecimalScale={true}
                          onValueChange={(values) =>
                            onChange(values.floatValue)
                          }
                          onBlur={onBlur}
                          placeholder="$0.00"
                          className={`${styles.input} ${
                            errors.amount ? styles.inputError : ""
                          }`}
                          getInputRef={ref}
                        />
                        {hasValue && (
                          <Button
                            variant="danger"
                            size="small"
                            className={styles.clearButton}
                            onClick={() => onChange("")}
                            aria-label="Clear amount"
                          >
                            x
                          </Button>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
              {errors.amount && (
                <span className={styles.errorMessage}>
                  {errors.amount.message}
                </span>
              )}
            </div>

            {/* Date Field */}
            <div className={styles.field}>
              <label>
                Date <span className={styles.requiredAsterisk}>*</span>:
              </label>

              <input
                type="date"
                {...register("date", { required: "Date is required" })}
                className={`${styles.input} ${
                  errors.date ? styles.inputError : ""
                }`}
              />
              {errors.date && (
                <span className={styles.errorMessage}>
                  {errors.date.message}
                </span>
              )}
            </div>
          </div>

          {/* Secondary Column: Source and Notes */}
          <div className={styles.secondaryColumn}>
            <div className={styles.field}>
              <label>
                Select or Add new Source{" "}
                <span className={styles.requiredAsterisk}>*</span>:
              </label>
              <div
                className={`
                  ${styles.iconAndInput} 
                  ${errors.source_id ? styles.hasError : ""}
                `}
              >
                <AutoSuggestInput
                  key={`source-${formKey}`}
                  name="source_id"
                  control={control}
                  rules={{ required: "Source is required" }}
                  options={sources.map((src) => ({
                    label: src.source,
                    value: src.id,
                  }))}
                  placeholder="ex: Salary"
                  onAddNew={async (newSource) => {
                    const res = await dispatch(
                      addSourceThunk(newSource)
                    ).unwrap();
                    return { label: res.source, value: res.id };
                  }}
                />
              </div>
              {errors.source_id && (
                <span className={styles.errorMessage}>
                  {errors.source_id.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label>Notes:</label>
              <textarea
                {...register("notes")}
                className={styles.input}
                placeholder="Enter notes (optional)"
              />
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <Button
            type="submit"
            variant="success"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              isSuccess ? (
                <span className={styles.checkmark}>✓</span>
              ) : (
                <span className={styles.spinner}></span>
              )
            ) : (
              "Add Income"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;
