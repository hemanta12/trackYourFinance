import React, {Suspense} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation'; 
import Settings from './components/settings/SettingsLayout';
import BudgetPage from './pages/BudgetPage';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Expenses = React.lazy(() => import('./pages/Expenses')); 
const Income = React.lazy(() => import('./pages/Income')); 



function App() {
    const isAuthenticated = !!localStorage.getItem('token'); 
    return (
        <Router>
            <div style={{ display: 'flex' }}>
                {/* Render Navigation only if user is authenticated */}
                {isAuthenticated && <Navigation />}

                <div style={{ flex: 1, padding: '20px' }}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                           
                            {/* Public Routes */}
                            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
                            {/* <Route path="/" element={<LoginPage />} />  */}
                            <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} />

                            {/* Private Routes */}
                            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                            <Route path= "/dashboard" element = {<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
                            <Route path="/income" element={<PrivateRoute><Income /></PrivateRoute>} />
                            <Route path="/budgets" element={<PrivateRoute><BudgetPage /></PrivateRoute>} />
                            <Route path="*" element={<Navigate to="/" />} /> {/* Redirect unknown routes */}
                        </Routes>
                    </Suspense>
                    </div>
                </div>
        </Router>
    );
}

export default App;
