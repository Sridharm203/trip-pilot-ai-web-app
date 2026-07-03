import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlane, FaUser, FaEnvelope, FaLock, FaAddressCard } from 'react-icons/fa';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setLocalError("Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    setLoadingLocal(true);
    setLocalError('');
    try {
      // API call will trigger register then login automatically
      await register(username, email, password, firstName, lastName);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || "Registration failed. Try a different username/email.");
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-card p-4 p-md-5 w-100 animate-fade-in-up" style={{ maxWidth: '540px' }}>
        <div className="text-center mb-4">
          <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '56px', height: '56px' }}>
            <FaPlane className="fs-4" style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <h2 className="fw-bold mb-1">Create Account</h2>
          <p className="text-muted small">Begin your journey with your AI co-pilot today</p>
        </div>

        {localError && (
          <div className="alert alert-danger border-0 small py-2 px-3 rounded-3" role="alert">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold">First Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FaAddressCard />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loadingLocal}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold">Last Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FaAddressCard />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loadingLocal}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Username *</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FaUser />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loadingLocal}
                style={{ fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address *</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loadingLocal}
                style={{ fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold">Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FaLock />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="At least 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loadingLocal}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold">Confirm Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FaLock />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loadingLocal}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
            disabled={loadingLocal}
          >
            {loadingLocal ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top">
          <p className="small text-muted mb-0">
            Already have an account? <Link to="/login" className="text-info fw-bold text-decoration-none">Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
