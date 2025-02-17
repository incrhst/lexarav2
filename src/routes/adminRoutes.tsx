import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminPortal from '../pages/admin/AdminPortal';
import Dashboard from '../pages/admin/Dashboard';
import DocumentManagement from '../pages/admin/DocumentManagement';
import CertificateManagement from '../pages/admin/CertificateManagement';
import UserManagement from '../pages/admin/UserManagement';
import PaymentSystem from '../pages/admin/payments/PaymentSystem';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminPortal />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="filings" element={<div className='p-4'>Filing Management coming soon</div>} />
        <Route path="certificates" element={<CertificateManagement />} />
        <Route path="oppositions" element={<div className='p-4'>Opposition Management coming soon</div>} />
        <Route path="payments" element={<PaymentSystem />} />
        <Route path="settings" element={<div className='p-4'>System Settings coming soon</div>} />
        <Route path="document-management" element={<DocumentManagement />} />
      </Route>
    </Routes>
  );
} 