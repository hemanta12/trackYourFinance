import React from "react";
import styles from "../../styles/components/common/Button.module.css";
import clsx from "clsx";

const Button = React.memo(
  ({
    children,
    onClick,
    variant = "primary",
    size = "normal",
    disabled = false,
    className,
    type = "button",
    ...props
  }) => {
    // Combine classes using clsx (or you can manually do template strings)
    const buttonClasses = clsx(
      styles.button, // base style
      styles[variant], // e.g. styles.primary or styles.danger
      { [styles.small]: size === "small" },
      { [styles.large]: size === "large" },
      { [styles.primary]: size === "primary" },
      { [styles.danger]: size === "danger" },
      { [styles.success]: size === "success" },
      { [styles.warning]: size === "warning" },
      className
    );

    return (
      <button
        type={type}
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export default Button;
