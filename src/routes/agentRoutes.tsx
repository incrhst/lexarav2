import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AgentLayout from '../components/agent/AgentLayout';

// Lazy load agent components
const AgentDashboard = React.lazy(() => import('../pages/agent/AgentDashboard'));
const ApplicationList = React.lazy(() => import('../pages/agent/ApplicationList'));
const GazetteBrowser = React.lazy(() => import('../pages/agent/GazetteBrowser'));
const OppositionManager = React.lazy(() => import('../pages/agent/OppositionManager'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="p-8 text-center">
    <div className="animate-pulse text-primary">Loading...</div>
  </div>
);

export default function AgentRoutes() {
  return (
    <Routes>
      <Route element={<AgentLayout />}>
        <Route path="/*" element={
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Dashboard */}
              <Route index element={<AgentDashboard />} />
              
              {/* Applications */}
              <Route path="applications" element={<ApplicationList />} />
              <Route path="applications/new" element={<ApplicationList />} />
              <Route path="applications/pending" element={<ApplicationList />} />
              <Route path="applications/completed" element={<ApplicationList />} />
              
              {/* Gazette */}
              <Route path="gazette" element={<GazetteBrowser />} />
              <Route path="gazette/search" element={<GazetteBrowser />} />
              <Route path="gazette/saved" element={<GazetteBrowser />} />
              
              {/* Oppositions */}
              <Route path="oppositions" element={<OppositionManager />} />
              <Route path="oppositions/active" element={<OppositionManager />} />
              <Route path="oppositions/filed" element={<OppositionManager />} />
              <Route path="oppositions/drafts" element={<OppositionManager />} />
            </Routes>
          </Suspense>
        } />
      </Route>
    </Routes>
  );
} 