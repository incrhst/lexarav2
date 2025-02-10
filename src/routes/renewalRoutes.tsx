import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RenewalDashboard from '../pages/RenewalDashboard';
import RenewalInitiation from '../components/RenewalInitiation';
import RenewalSuccess from '../pages/RenewalSuccess';

export default function RenewalRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RenewalDashboard />} />
      <Route path="/initiate/:id" element={<RenewalInitiation />} />
      <Route path="/success" element={<RenewalSuccess />} />
    </Routes>
  );
}

// Update the RenewalDashboard to include the new components
export function RenewalDashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <RenewalDashboard />
        </div>
      </div>
    </div>
  );
} 