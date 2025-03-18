import React, { useState } from "react";
import axios from "axios";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { Link } from "react-router-dom";
import styles from "../styles/pages/SignupPage.module.css";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await axios.post(
        "https://trackyourfinance-backend.onrender.com/api/auth/register",
        {
          email,
          password,
          name,
        }
      );
      alert("Sign up succesful. Now, please Login");
      window.location.href = "/";
    } catch (error) {
      console.log("Sign Up Failed", error);
      setError("Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href =
      "https://trackyourfinance-backend.onrender.com/api/auth/google";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Signup</h1>
      <form className={styles.form} onSubmit={handleSignup}>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Signup"}
        </Button>
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <div className={styles.googleButtonContainer}>
        <button className={styles.googleButton} onClick={handleGoogleSignup}>
          Sign up with Google
        </button>
      </div>
      <p className={styles.switchAuth}>
        Already have an account? <Link to="/">Log in here</Link>
      </p>
    </div>
  );
}

export default SignupPage;
