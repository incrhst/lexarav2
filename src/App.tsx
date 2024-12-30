import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetails from './pages/ApplicationDetails';
import Gazette from './pages/Gazette';
import OppositionForm from './pages/OppositionForm';
import Overview from './pages/AdminDashboard/components/Overview';
import ApplicationManagement from './pages/AdminDashboard/components/ApplicationManagement';
import UserManagement from './pages/AdminDashboard/components/UserManagement';
import Settings from './pages/AdminDashboard/components/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <ToastProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gazette" element={<Gazette />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/applications/new" element={<ApplicationForm />} />
              <Route path="/applications/:id" element={<ApplicationDetails />} />
              <Route path="/applications/:id/oppose" element={<OppositionForm />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<Overview />} />
              <Route path="/admin/applications" element={<ApplicationManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;