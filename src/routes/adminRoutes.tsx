import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';

// Lazy load admin components
const AdminRenewalDashboard = React.lazy(() => import('../pages/admin/renewals/AdminRenewalDashboard'));
const AdminOppositionDashboard = React.lazy(() => import('../pages/admin/oppositions/AdminOppositionDashboard'));
const AdminPaymentDashboard = React.lazy(() => import('../pages/admin/payments/AdminPaymentDashboard'));
const PaymentSystem = React.lazy(() => import('../pages/admin/payments/PaymentSystem'));
const ApplicationReview = React.lazy(() => import('../pages/admin/review/ApplicationReview'));
const DocumentManagement = React.lazy(() => import('../pages/admin/DocumentManagement'));
const CertificateManagement = React.lazy(() => import('../pages/admin/CertificateManagement.tsx'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="p-8 text-center">
    <div className="animate-pulse text-primary">Loading...</div>
  </div>
);

function AdminRoutesContent() {
  return (
    <Routes>
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

      {/* Payment Verification and Processing */}
      <Route path="payments" element={<AdminPaymentDashboard />} />
      <Route path="payments/pending" element={<AdminPaymentDashboard />} />
      <Route path="payments/receipts" element={<AdminPaymentDashboard />} />
      <Route path="payments/issues" element={<AdminPaymentDashboard />} />
      {/* Integrated Payment System */}
      <Route path="payments/system" element={<PaymentSystem />} />

      {/* Document Management */}
      <Route path="documents" element={<DocumentManagement />} />

      {/* Certificate Management */}
      <Route path="certificates" element={<CertificateManagement />} />

      {/* Default route */}
      <Route index element={<AdminRenewalDashboard />} />
    </Routes>
  );
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/*" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminRoutesContent />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
} 