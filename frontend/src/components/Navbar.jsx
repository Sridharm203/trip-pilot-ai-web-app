import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { FaPlane, FaUser, FaSignOutAlt, FaChartBar, FaHome } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
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
        <Link className="navbar-brand d-flex align-items-center text-decoration-none" to="/" style={{ fontWeight: '800', letterSpacing: '-0.03em' }}>
          <FaPlane className="me-2" style={{ transform: 'rotate(-45deg)', color: 'var(--color-primary)', fontSize: '1.4rem' }} />
          <span style={{ color: 'var(--color-text-main)', fontSize: '1.35rem', fontWeight: '800' }}>
            TripPilot <span style={{ color: 'var(--color-primary)' }}>AI</span>
          </span>
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
                  <NavLink className="nav-link d-flex align-items-center" to="/">
                    <FaHome className="me-1.5" style={{ opacity: 0.8 }} /> Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/dashboard">
                    <FaChartBar className="me-1.5" style={{ opacity: 0.8 }} /> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/profile">
                    <FaUser className="me-1.5" style={{ opacity: 0.8 }} /> Profile
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-3 my-2 my-lg-0 text-muted small" style={{ fontWeight: '500' }}>
                  Hi, {user.first_name || user.username}
                </li>
                <li className="nav-item ms-lg-3">
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center px-3 py-1.5"
                    style={{ borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}
                  >
                    <FaSignOutAlt className="me-1.5" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center" to="/">
                    <FaHome className="me-1.5" style={{ opacity: 0.8 }} /> Home
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-2">
                  <NavLink className="nav-link" to="/login">Login</NavLink>
                </li>
                <li className="nav-item ms-lg-3 my-2 my-lg-0">
                  <Link className="btn btn-primary btn-sm px-4 py-2" to="/register" style={{ borderRadius: '6px', fontSize: '0.875rem' }}>
                    Get Started
                  </Link>
                </li>
              </>
            )}
            
            {/* Currency Toggle/Selector */}
            <li className="nav-item ms-lg-2 my-2 my-lg-0 dropdown">
              <button 
                className="btn nav-link d-flex align-items-center justify-content-center px-2.5 py-1.5 bg-light text-dark rounded-3 fw-bold"
                style={{ border: 'none', minWidth: '80px', fontSize: '0.85rem' }}
                id="currencyDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {currency === 'USD' ? 'USD ($)' : 'INR (₹)'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2" aria-labelledby="currencyDropdown" style={{ minWidth: '160px', borderRadius: '10px' }}>
                <li>
                  <button 
                    className={`dropdown-item rounded-2 d-flex align-items-center justify-content-between py-2 ${currency === 'USD' ? 'active' : ''}`}
                    onClick={() => setCurrency('USD')}
                  >
                    <span>US Dollar</span>
                    <span className="fw-bold">$</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item rounded-2 d-flex align-items-center justify-content-between py-2 ${currency === 'INR' ? 'active' : ''}`}
                    onClick={() => setCurrency('INR')}
                  >
                    <span>Indian Rupee</span>
                    <span className="fw-bold">₹</span>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
