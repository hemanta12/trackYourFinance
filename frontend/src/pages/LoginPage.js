import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginUser } from "../redux//authSlice";
import axios from "axios";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  // const [unauthorized, setUnauthorized] = useState(false);
  const dispatch = useDispatch();

  const location = useLocation();

  const { token, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we already have a token in Redux, redirect to /dashboard
    if (token) {
      window.location.href = "/dashboard";
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Dispatch the thunk with email/password
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleLogin = () => {
    // Redirect to your backend's Google route
    window.location.href = "http://localhost:8080/api/auth/google";
  };

  // Optionally handle ?message=unauthorized logic
  const params = new URLSearchParams(location.search);
  const isUnauthorized = params.get("message") === "unauthorized";

  // useEffect(() => {
  //   // Check if the query parameter contains `session=expired`
  //   const params = new URLSearchParams(location.search);
  //   if (params.get("session") === "expired") {
  //     setSessionExpired(true);
  //   } else if (params.get("message") === "unauthorized") {
  //     setUnauthorized(true);
  //   }
  // }, [location.search]);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:8080/api/auth/login",
  //       { email, password }
  //     );
  //     localStorage.setItem("token", response.data.token);
  //     localStorage.setItem("userName", response.data.name);
  //     window.location.href = "/dashboard";
  //   } catch (error) {
  //     console.log("Login failed", error);
  //     setError("Invalid email or password");
  //   }
  // };

  // const handleGoogleLogin = () => {
  //   const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
  //   // window.location.href = `${backendUrl}/api/auth/google`;
  //   window.location.href = "http://localhost:8080/api/auth/google";
  // };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      {/* {sessionExpired && (
        <p className={styles.error}>
          Your session has expired. Please log in again.
        </p>
      )} */}
      {isUnauthorized && (
        <p className={styles.error}>
          Please log in because you are not authorized to visit this page.
        </p>
      )}

      <form className={styles.form} onSubmit={handleLogin}>
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

        <Button type="submit">Login</Button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <div className={styles.googleButtonContainer}>
        <button className={styles.googleButton} onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
      <p className={styles.switchAuth}>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}

export default LoginPage;
