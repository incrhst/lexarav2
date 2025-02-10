import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <header>
        <h1 className="text-2xl font-bold text-primary mb-4">About Lexara IP</h1>
        <p className="text-lg text-primary-light mb-8">
          Your trusted partner in intellectual property management
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-background-alt p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-primary mb-4">Our Mission</h2>
          <p className="text-primary-light">
            At Lexara IP, we're dedicated to simplifying the intellectual property management process.
            Our platform provides a seamless experience for filing and managing trademarks, copyrights,
            and patents, ensuring your intellectual property is protected efficiently and effectively.
          </p>
        </section>

        <section className="bg-background-alt p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-primary mb-4">What We Offer</h2>
          <ul className="space-y-3 text-primary-light">
            <li>• Streamlined application process for IP registration</li>
            <li>• Comprehensive IP portfolio management</li>
            <li>• Real-time application status tracking</li>
            <li>• Expert guidance throughout the process</li>
          </ul>
        </section>
      </div>

      <section className="mt-8 bg-background-alt p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-primary mb-4">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-primary mb-2">Email</h3>
            <p className="text-primary-light">support@lexara-ip.com</p>
          </div>
          <div>
            <h3 className="font-medium text-primary mb-2">Phone</h3>
            <p className="text-primary-light">+1 (555) 123-4567</p>
          </div>
          <div>
            <h3 className="font-medium text-primary mb-2">Address</h3>
            <p className="text-primary-light">
              123 Innovation Street<br />
              Tech City, TC 12345
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 