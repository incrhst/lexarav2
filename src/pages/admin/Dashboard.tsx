import React from "react";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Portfolio Management</h2>
          <p className="text-gray-600">Manage and view the portfolio of applications.</p>
          <button className="mt-4 btn-primary">View Portfolio</button>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Filing Status Tracking</h2>
          <p className="text-gray-600">Track the status of all filings in real-time.</p>
          <button className="mt-4 btn-primary">Track Filings</button>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Document Management</h2>
          <p className="text-gray-600">Manage and organize uploaded documents.</p>
          <button className="mt-4 btn-primary">Manage Documents</button>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Payment Processing</h2>
          <p className="text-gray-600">Review and process payments efficiently.</p>
          <button className="mt-4 btn-primary">Process Payments</button>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Certificate Management</h2>
          <p className="text-gray-600">Issue and manage certificates for approved applications.</p>
          <button className="mt-4 btn-primary">Manage Certificates</button>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Opposition Handling</h2>
          <p className="text-gray-600">Oversee and resolve opposition cases.</p>
          <button className="mt-4 btn-primary">Handle Oppositions</button>
        </div>
      </div>
    </div>
  );
} 