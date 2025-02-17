import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminPortal() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-semibold mb-4">Admin Menu</h2>
        <nav>
          <ul>
            <li><Link to="/admin/dashboard" className="block py-2">Dashboard</Link></li>
            <li><Link to="/admin/users" className="block py-2">User Management</Link></li>
            <li><Link to="/admin/filings" className="block py-2">Filing Management</Link></li>
            <li><Link to="/admin/certificates" className="block py-2">Certificate Management</Link></li>
            <li><Link to="/admin/oppositions" className="block py-2">Opposition Management</Link></li>
            <li><Link to="/admin/payments" className="block py-2">Payment Management</Link></li>
            <li><Link to="/admin/settings" className="block py-2">System Settings</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        <h1 className="text-2xl font-bold p-4">Admin Portal</h1>
        <Outlet />
      </main>
    </div>
  );
} 