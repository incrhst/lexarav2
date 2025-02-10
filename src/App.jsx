import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import PublicDashboard from './pages/Dashboard/components/PublicDashboard';
import ApplicationForm from './pages/ApplicationForm';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './providers/AuthProvider';
import { testSupabaseConnection } from './lib/supabase';
import AdminRoutes from './routes/adminRoutes';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  useEffect(() => {
    // Test Supabase connection on app load
    testSupabaseConnection().then(isConnected => {
      if (isConnected) {
        console.log('✅ Supabase connection verified');
      } else {
        console.error('❌ Supabase connection failed');
      }
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/applications/new" element={<ApplicationForm />} />
                
                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 