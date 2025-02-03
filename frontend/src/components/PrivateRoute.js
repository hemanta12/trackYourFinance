import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

function PrivateRoute({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const location = useLocation();
  useEffect(() => {
    const onFocus = () => setToken(localStorage.getItem("token"));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (!token) {
    // Check if the current URL already has a session expiration flag.
    const params = new URLSearchParams(location.search);
    if (params.get("session") === "expired") {
      // If session expired was already set (for example via axios interceptor),
      // we keep that message.
      return <Navigate to="/?session=expired" />;
    }
    // Otherwise, assume the user simply isn’t authorized.
    return <Navigate to="/?message=unauthorized" />;
  }

  return children;
}

export default PrivateRoute;
