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
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <Outlet />
        {/* If no nested route is selected, display default content */}
        {window.location.pathname === '/admin' && (
          <div>
            <p>Welcome to the Admin Portal. Please select an option from the menu.</p>
          </div>
        )}
      </main>
    </div>
  );
} 