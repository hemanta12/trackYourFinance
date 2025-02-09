// pages/OAuthCallback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { googleLoginSuccess } from "../redux/authSlice";

function OAuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    if (token) {
      dispatch(googleLoginSuccess({ token, name }));
      navigate("/dashboard");
    } else {
      // If there's no token, or an error, go back to login
      navigate("/");
    }
  }, [dispatch, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h3>Finishing up your login...</h3>
    </div>
  );
}

export default OAuthCallback;
