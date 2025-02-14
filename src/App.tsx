import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetails from './pages/ApplicationDetails';
import Gazette from './pages/Gazette';
import OppositionForm from './pages/OppositionForm';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AgentLogin from './pages/AgentLogin';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import AdminRoutes from './routes/adminRoutes';
import AgentRoutes from './routes/agentRoutes';
import { AuthProvider } from './providers/AuthProvider';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="app">
            <ToastContainer />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/agent/login" element={<AgentLogin />} />
              <Route path="/register" element={<Register />} />
              
              {/* Layout wrapper */}
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/gazette" element={<Gazette />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/applications/new" element={<ApplicationForm />} />
                  <Route path="/applications/:id" element={<ApplicationDetails />} />
                  <Route path="/applications/:id/oppose" element={<OppositionForm />} />
                  <Route path="/admin/*" element={<AdminRoutes />} />
                  <Route path="/agent/*" element={<AgentRoutes />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;