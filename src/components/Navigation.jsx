import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="side-nav">
      <div className="logo">
        <h2>My App</h2>
      </div>
      <ul className="side-nav-list">
        <li className="side-nav-item">
          <Link to="/" className="side-nav-link">
            <span className="nav-icon">🏠</span>
            Home
          </Link>
        </li>
        <li className="side-nav-item">
          <Link to="/dashboard" className="side-nav-link">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
        </li>
        <li className="side-nav-item">
          <Link to="/about" className="side-nav-link">
            <span className="nav-icon">ℹ️</span>
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 