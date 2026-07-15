import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaTwitter, FaFacebook, FaInstagram, FaGithub, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white-50 py-5 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-white mb-3 d-flex align-items-center">
              <FaPlane className="me-2 text-info" style={{ transform: 'rotate(-45deg)' }} />
              TripPilot <span className="text-info">AI</span>
            </h5>
            <p className="small">
              Your intelligent, responsive companion for before, during, and after your journeys.
              Plan smart, travel safe, and track your highlights effortlessly.
            </p>
            <p className="fst-italic small mt-2">
              "Travel far enough, you meet yourself."
            </p>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white mb-3">Links</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2"><Link to="/" className="text-white-50 text-decoration-none hover-white">Home</Link></li>
              <li className="mb-2"><Link to="/#features" className="text-white-50 text-decoration-none hover-white">Features</Link></li>
              <li className="mb-2"><Link to="/#testimonials" className="text-white-50 text-decoration-none hover-white">Reviews</Link></li>
              <li><Link to="/register" className="text-white-50 text-decoration-none hover-white">Sign Up</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white mb-3">Contact & Support</h6>
            <ul className="list-unstyled mb-0 small">
              <li className="mb-2">Email: support@trippilot.ai</li>
              <li className="mb-2">Phone: +1 (800) 555-PILOT</li>
              <li>Address: 100 AI Way, San Francisco, CA</li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white mb-3">Follow The Journey</h6>
            <div className="d-flex gap-3 fs-5">
              <a href="#" className="text-white-50 hover-info"><FaTwitter /></a>
              <a href="#" className="text-white-50 hover-info"><FaFacebook /></a>
              <a href="#" className="text-white-50 hover-info"><FaInstagram /></a>
              <a href="#" className="text-white-50 hover-info"><FaGithub /></a>
            </div>
            <p className="small mt-3">
              Subscribe for weather and travel updates directly to your dashboard.
            </p>
          </div>
        </div>
        
        <hr className="my-4 border-secondary" />
        
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small">
          <p className="mb-0">&copy; {new Date().getFullYear()} TripPilot AI. All rights reserved.</p>
          <p className="mb-0 d-flex align-items-center">
            Made with <FaHeart className="text-danger mx-1" /> for travelers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
