import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { isTokenValid } from "../utils/auth";

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!token || !isTokenValid(token)) {
    // Clear any stale data.
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    dispatch(logout());
    return <Navigate to="/?message=unauthorized" />;
  }
  return children;
}

export default PrivateRoute;
