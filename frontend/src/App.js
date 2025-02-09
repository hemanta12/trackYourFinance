import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "./redux/authSlice";
import { isTokenValid } from "./utils/auth";

import PrivateRoute from "./components/PrivateRoute";
import OAuthCallback from "./pages/OAuthCallback";
import Navigation from "./components/Navigation";
import Settings from "./components/settings/SettingsLayout";
import BudgetPage from "./pages/BudgetPage";

const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const SignupPage = React.lazy(() => import("./pages/SignupPage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Expenses = React.lazy(() => import("./pages/Expenses"));
const Income = React.lazy(() => import("./pages/Income"));

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  useEffect(() => {
    if (token && !isTokenValid(token)) {
      dispatch(logout());
    }
  }, [token, dispatch]);

  return (
    <Router>
      <div style={{ display: "flex" }}>
        {/* Render Navigation only if user is authenticated */}
        {token && <Navigation />}

        <div style={{ flex: 1, padding: "20px" }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
              />
              {/* <Route path="/" element={<LoginPage />} />  */}
              <Route
                path="/signup"
                element={token ? <Navigate to="/dashboard" /> : <SignupPage />}
              />
              {/* Private Routes */}
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <PrivateRoute>
                    <Expenses />
                  </PrivateRoute>
                }
              />
              <Route
                path="/income"
                element={
                  <PrivateRoute>
                    <Income />
                  </PrivateRoute>
                }
              />
              <Route
                path="/budgets"
                element={
                  <PrivateRoute>
                    <BudgetPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
              {/* Redirect unknown routes */}
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
