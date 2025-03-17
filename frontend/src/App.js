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
import { fetchBillPayments, fetchRecurringItems } from "./redux/recurringSlice";
import {
  fetchCategories,
  fetchPaymentTypes,
  fetchMerchants,
} from "./redux/listSlice";

import PrivateRoute from "./components/layout/PrivateRoute";
import OAuthCallback from "./pages/OAuthCallback";
import Navigation from "./components/layout/Navigation";
import MobileNavigation from "./components/layout/MobileNavigation";
import Settings from "./components/settings/SettingsLayout";
import BudgetPage from "./pages/BudgetPage";
import styles from "./styles/AppLayout.module.css";
import RecurringBillsPage from "./pages/RecurringBillsPage";
import useWindowDimensions from "./utils/useWindowDimensions";

const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const SignupPage = React.lazy(() => import("./pages/SignupPage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Expenses = React.lazy(() => import("./pages/Expenses"));
const Income = React.lazy(() => import("./pages/Income"));

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (token && !isTokenValid(token)) {
      dispatch(logout());
    }
  }, [token, dispatch]);
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPaymentTypes());
    dispatch(fetchMerchants());
    dispatch(fetchBillPayments());
    dispatch(fetchRecurringItems());
  }, [dispatch]);

  return (
    <Router>
      <div className={styles.appContainer}>
        {token && (width < 480 ? <MobileNavigation /> : <Navigation />)}
        <div className={styles.mainContent}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route
                path="/"
                element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
              />
              <Route
                path="/signup"
                element={token ? <Navigate to="/dashboard" /> : <SignupPage />}
              />
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
                path="/recurring-bills"
                element={
                  <PrivateRoute>
                    <RecurringBillsPage />
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
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
