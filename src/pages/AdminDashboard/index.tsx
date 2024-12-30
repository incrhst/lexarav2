import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Overview from './components/Overview';
import ApplicationManagement from './components/ApplicationManagement';
import UserManagement from './components/UserManagement';
import AgentList from './components/AgentManagement/AgentList';
import AgentDetails from './components/AgentManagement/AgentDetails';
import Settings from './components/Settings';
import { useAdminAuth } from './hooks/useAdminAuth';
import AdminTour from '../../components/AdminTour';

export default function AdminDashboard() {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <div className="animate-pulse">Checking permissions...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="applications" element={<ApplicationManagement />} />
          <Route path="agents" element={<AgentList />} />
          <Route path="agents/:id" element={<AgentDetails />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <AdminTour />
    </>
  );
}