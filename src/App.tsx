import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { useAuth } from './hooks/useAuth';
import { useUserRole } from './hooks/useUserRole';

function App() {
  const { loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
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
              
              {/* Role-based routes */}
              <Route
                path="/admin/*"
                element={
                  role === 'admin' ? (
                    <AdminRoutes />
                  ) : (
                    <Navigate to="/admin/login" replace />
                  )
                }
              />
              
              <Route
                path="/agent/*"
                element={
                  role === 'agent' ? (
                    <AgentRoutes />
                  ) : (
                    <Navigate to="/agent/login" replace />
                  )
                }
              />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;