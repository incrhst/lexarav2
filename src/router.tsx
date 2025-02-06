import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetails from './pages/ApplicationDetails';
import Gazette from './pages/Gazette';
import OppositionForm from './pages/OppositionForm';
import Overview from './pages/AdminDashboard/components/Overview';
import ApplicationManagement from './pages/AdminDashboard/components/ApplicationManagement';
import UserManagement from './pages/AdminDashboard/components/UserManagement';
import Settings from './pages/AdminDashboard/components/Settings';
import RequireAuth from './components/RequireAuth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'gazette',
        element: <Gazette />,
      },
      {
        path: 'applications',
        children: [
          {
            path: 'new',
            element: <RequireAuth><ApplicationForm /></RequireAuth>,
          },
          {
            path: ':id',
            element: <RequireAuth><ApplicationDetails /></RequireAuth>,
          },
          {
            path: ':id/oppose',
            element: <RequireAuth><OppositionForm /></RequireAuth>,
          },
        ],
      },
      {
        path: 'admin',
        element: <RequireAuth><Overview /></RequireAuth>,
      },
      {
        path: 'admin/applications',
        element: <RequireAuth><ApplicationManagement /></RequireAuth>,
      },
      {
        path: 'admin/users',
        element: <RequireAuth><UserManagement /></RequireAuth>,
      },
      {
        path: 'admin/settings',
        element: <RequireAuth><Settings /></RequireAuth>,
      },
    ],
  },
]); 