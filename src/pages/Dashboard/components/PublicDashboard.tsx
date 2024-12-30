import React from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Shield } from 'lucide-react';
import Button from '../../../components/Button';

export default function PublicDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-primary">Welcome to Lexara IP</h1>
        <p className="mt-2 text-lg text-primary-light">
          Your gateway to intellectual property management
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-alt p-6 rounded-lg shadow-sm">
          <Search className="h-8 w-8 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">
            Search IP Database
          </h3>
          <p className="text-primary-light mb-4">
            Browse and search through published trademark applications and registrations.
          </p>
          <Link to="/gazette">
            <Button variant="secondary" size="sm">
              Browse Gazette
            </Button>
          </Link>
        </div>

        <div className="bg-background-alt p-6 rounded-lg shadow-sm">
          <BookOpen className="h-8 w-8 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">
            File Applications
          </h3>
          <p className="text-primary-light mb-4">
            Register an account to submit and manage your IP applications.
          </p>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="bg-background-alt p-6 rounded-lg shadow-sm">
          <Shield className="h-8 w-8 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">
            Monitor & Protect
          </h3>
          <p className="text-primary-light mb-4">
            Track application status and file oppositions to protect your IP rights.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-background-alt p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Why Choose Lexara IP?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Easy Management',
              description: 'Streamlined application process and intuitive interface',
            },
            {
              title: 'Real-time Updates',
              description: 'Track your applications with instant status notifications',
            },
            {
              title: 'Secure Platform',
              description: 'Enterprise-grade security for your sensitive data',
            },
            {
              title: 'Expert Support',
              description: 'Dedicated support team to assist you every step',
            },
          ].map((feature) => (
            <div key={feature.title}>
              <h3 className="font-medium text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-primary-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}