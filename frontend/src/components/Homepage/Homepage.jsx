import React, { use, useState } from 'react';
import { FaUser, FaHospital } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

function Homepage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate=useNavigate();

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo-container">
          <FaHospital className="logo-icon" />
          <h1 className="logo-text">MedCart</h1>
        </div>
        
        <div className="nav-buttons">
          <button className="nav-button">Home</button>
          
          <div 
            className="dropdown-container"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
          <button className="nav-button">About Us ▾</button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => navigate("/privacy")}>
                Privacy Policy
              </button>
              <button className="dropdown-item" onClick={() => navigate("/terms")}>
                Terms & Conditions
              </button>
            </div>
          )}
          </div>


          <button className="nav-button" onClick={() => navigate("/contact")}>Contact Us</button>
          <button className="nav-button login-button" onClick={() => navigate('/logSign')}>
            <FaUser /> Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-text">
            <h2>Smart Crash Cart Management System</h2>
            <p>Ensuring medical equipment availability and optimal emergency readiness</p>
          </div>
          <div className="hero-image">
            {/* Add your medical cart image here */}
            <div className="image-placeholder">
            <img src="/cover.png" alt="Medical Cart" className="cover-image" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="hfeatures-section">
          <h3>Key Features</h3>
          <div className="hfeatures-grid">
            <div className="hfeature-card">
              <FaHospital className="hfeature-icon" />
              <h4>Real-time Inventory Tracking</h4>
              <p>Monitor medical supplies 24/7 with automated alerts</p>
            </div>
            <div className="hfeature-card">
              <FaHospital className="hfeature-icon" />
              <h4>Emergency Readiness</h4>
              <p>Instant crash cart status updates for critical situations</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 MedCart. All rights reserved. Emergency Medical Solutions</p>
      </footer>
    </div>
  );
}


export default Homepage;