import React from 'react';
import { FileText, Clock, Bell } from 'lucide-react';

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-background-alt p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <FileText className="h-8 w-8 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-primary">Active Applications</h3>
        </div>
        <div className="flex items-baseline">
          <p className="text-4xl font-bold text-primary">12</p>
          <p className="ml-2 text-sm text-primary-light">applications</p>
        </div>
        <p className="mt-2 text-sm text-primary-light">4 pending approval</p>
      </div>

      <div className="bg-background-alt p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <Clock className="h-8 w-8 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-primary">Under Review</h3>
        </div>
        <div className="flex items-baseline">
          <p className="text-4xl font-bold text-primary">5</p>
          <p className="ml-2 text-sm text-primary-light">applications</p>
        </div>
        <p className="mt-2 text-sm text-primary-light">2 require action</p>
      </div>

      <div className="bg-background-alt p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <Bell className="h-8 w-8 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-primary">Recent Updates</h3>
        </div>
        <div className="flex items-baseline">
          <p className="text-4xl font-bold text-primary">8</p>
          <p className="ml-2 text-sm text-primary-light">notifications</p>
        </div>
        <p className="mt-2 text-sm text-primary-light">3 new today</p>
      </div>
    </div>
  );
}