import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';

// Lazy load admin components
const AdminRenewalDashboard = React.lazy(() => import('../pages/admin/renewals/AdminRenewalDashboard'));
const AdminOppositionDashboard = React.lazy(() => import('../pages/admin/oppositions/AdminOppositionDashboard'));
const AdminPaymentDashboard = React.lazy(() => import('../pages/admin/payments/AdminPaymentDashboard'));
const ApplicationReview = React.lazy(() => import('../pages/admin/review/ApplicationReview'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="p-8 text-center">
    <div className="animate-pulse text-primary">Loading...</div>
  </div>
);

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/*" element={
          <Suspense fallback={<LoadingFallback />}>
            {/* Application Review */}
            <Route path="review" element={<ApplicationReview />} />
            <Route path="review/:id" element={<ApplicationReview />} />

            {/* Renewal Management */}
            <Route path="renewals" element={<AdminRenewalDashboard />} />
            <Route path="renewals/upcoming" element={<AdminRenewalDashboard />} />
            <Route path="renewals/payments" element={<AdminRenewalDashboard />} />
            <Route path="renewals/status" element={<AdminRenewalDashboard />} />

            {/* Opposition Management */}
            <Route path="oppositions" element={<AdminOppositionDashboard />} />
            <Route path="oppositions/filings" element={<AdminOppositionDashboard />} />
            <Route path="oppositions/counter-statements" element={<AdminOppositionDashboard />} />
            <Route path="oppositions/status" element={<AdminOppositionDashboard />} />

            {/* Payment Verification */}
            <Route path="payments" element={<AdminPaymentDashboard />} />
            <Route path="payments/pending" element={<AdminPaymentDashboard />} />
            <Route path="payments/receipts" element={<AdminPaymentDashboard />} />
            <Route path="payments/issues" element={<AdminPaymentDashboard />} />

            {/* Default route */}
            <Route index element={<AdminRenewalDashboard />} />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
} 