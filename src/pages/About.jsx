import React from 'react';
import { Info, Shield, BookOpen, Users, Clock, Globe } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary mb-4">About Lexara IP</h1>
        <p className="text-xl text-primary-light max-w-3xl mx-auto">
          Your comprehensive platform for intellectual property management and protection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-background-alt p-6 rounded-lg shadow-sm">
          <Shield className="h-8 w-8 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">
            IP Protection
          </h3>
          <p className="text-primary-light">
            Secure and manage your intellectual property rights with our comprehensive protection system.
          </p>
        </div>

        <div className="bg-background-alt p-6 rounded-lg shadow-sm">
          <Globe className="h-8 w-8 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">
            Global Coverage
          </h3>
          <p className="text-primary-light">
            File and manage IP applications across multiple jurisdictions with ease.
          </p>
        </div>

        <div className="bg-background-alt p-6 rounded-lg shadow-sm">
          <Clock className="h-8 w-8 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">
            Real-time Updates
          </h3>
          <p className="text-primary-light">
            Stay informed with instant notifications about your IP applications and status changes.
          </p>
        </div>
      </div>

      <div className="bg-background-alt rounded-lg shadow-sm p-8 mb-16">
        <h2 className="text-2xl font-bold text-primary mb-6">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">IP Applications</h3>
            <ul className="space-y-3 text-primary-light">
              <li>• Trademark registration and renewal</li>
              <li>• Patent applications</li>
              <li>• Copyright registration</li>
              <li>• Design protection</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Management Tools</h3>
            <ul className="space-y-3 text-primary-light">
              <li>• Portfolio management</li>
              <li>• Status tracking</li>
              <li>• Opposition filing</li>
              <li>• Document management</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-background-alt rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Support & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <BookOpen className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Documentation</h3>
            <p className="text-primary-light">
              Comprehensive guides and documentation to help you navigate the IP management process.
            </p>
          </div>
          <div>
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Expert Support</h3>
            <p className="text-primary-light">
              Our team of IP experts is available to assist you with any questions or concerns.
            </p>
          </div>
          <div>
            <Info className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">FAQ</h3>
            <p className="text-primary-light">
              Find answers to common questions about IP management and our platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 