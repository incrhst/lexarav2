import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarIcon,
  ScaleIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Renewal Management',
    href: '/admin/renewals',
    icon: CalendarIcon,
    children: [
      { name: 'Upcoming Renewals', href: '/admin/renewals/upcoming' },
      { name: 'Payment Processing', href: '/admin/renewals/payments' },
      { name: 'Status Tracking', href: '/admin/renewals/status' },
    ],
  },
  {
    name: 'Opposition Management',
    href: '/admin/oppositions',
    icon: ScaleIcon,
    children: [
      { name: 'Opposition Filings', href: '/admin/oppositions/filings' },
      { name: 'Counter-Statements', href: '/admin/oppositions/counter-statements' },
      { name: 'Status Tracking', href: '/admin/oppositions/status' },
    ],
  },
  {
    name: 'Payment Verification',
    href: '/admin/payments',
    icon: BanknotesIcon,
    children: [
      { name: 'Pending Payments', href: '/admin/payments/pending' },
      { name: 'Payment Receipts', href: '/admin/payments/receipts' },
      { name: 'Payment Issues', href: '/admin/payments/issues' },
    ],
  },
  { name: 'Applications', href: '/admin/applications', icon: ClipboardDocumentCheckIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-full">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex w-64 flex-col">
            <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
              <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <img
                    className="h-8 w-auto"
                    src="/logo.svg"
                    alt="Admin Dashboard"
                  />
                </div>
                <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          location.pathname === item.href
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            location.pathname === item.href
                              ? 'text-gray-500'
                              : 'text-gray-400 group-hover:text-gray-500',
                            'mr-3 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                      {item.children && (
                        <div className="space-y-1 pl-10">
                          {item.children.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={classNames(
                                location.pathname === subItem.href
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                              )}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                <div className="group block w-full flex-shrink-0">
                  <div className="flex items-center">
                    <div>
                      <img
                        className="inline-block h-9 w-9 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Admin User
                      </p>
                      <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                        View profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative z-0 flex flex-1 overflow-hidden">
            <main className="relative z-0 flex-1 overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
} 