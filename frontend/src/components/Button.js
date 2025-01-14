import React from 'react';
import styles from '../styles/Button.module.css';

const Button = React.memo(({ children, onClick })  =>{
  return (
    <button className={styles.button} onClick={onClick}>
      {children}
    </button>
  );
});

export default Button;
