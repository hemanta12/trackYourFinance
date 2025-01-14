import React from 'react';
import styles from '../styles/Input.module.css';

const Input = React.memo(({ type, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={styles.input}
    />
  );
});

export default Input;
