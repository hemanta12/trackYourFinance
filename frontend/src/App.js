import React, {Suspense} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));


function App() {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}></Suspense>
            <Routes>
                <Route path= "/" element = {<LoginPage/>} />
                <Route path= "/signup" element = {<SignupPage/>} /> 
                <Route 
                path= "/dashboard" 
                element = {<PrivateRoute><Dashboard /></PrivateRoute>} 
                />

            </Routes>
            <Suspense/>
        </Router>
    );
}

export default App;
