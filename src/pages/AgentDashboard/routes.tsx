import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AgentDashboard from './index';
import ClientDetails from './components/ClientDetails';

export default function AgentRoutes() {
  return (
    <Routes>
      <Route index element={<AgentDashboard />} />
      <Route path="clients/:id" element={<ClientDetails />} />
    </Routes>
  );
}