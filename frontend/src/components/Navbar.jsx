import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlane, FaUser, FaSignOutAlt, FaChartBar, FaGlobe, FaTrophy } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center text-white" to="/">
          <FaPlane className="me-2 text-info" style={{ transform: 'rotate(-45deg)' }} />
          <span>TripPilot <span className="text-info">AI</span></span>
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/feed">
                    <FaGlobe className="me-1" /> Feed
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/leaderboard">
                    <FaTrophy className="me-1" /> Leaderboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/dashboard">
                    <FaChartBar className="me-1" /> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/profile">
                    <FaUser className="me-1" /> Profile
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-3 my-2 my-lg-0 text-white-50 small">
                  Hi, {user.first_name || user.username}
                </li>
                <li className="nav-item ms-lg-3">
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-outline-light btn-sm d-flex align-items-center px-3"
                    style={{ borderRadius: '8px' }}
                  >
                    <FaSignOutAlt className="me-1" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/">Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/feed">
                    <FaGlobe className="me-1" /> Feed
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/leaderboard">
                    <FaTrophy className="me-1" /> Leaderboard
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-2">
                  <NavLink className="nav-link" to="/login">Login</NavLink>
                </li>
                <li className="nav-item ms-lg-3 my-2 my-lg-0">
                  <Link className="btn btn-primary btn-sm px-4" to="/register">
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
