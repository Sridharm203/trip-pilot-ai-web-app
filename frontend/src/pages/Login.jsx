import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlane, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError("Please fill out all fields.");
      return;
    }
    
    setLoadingLocal(true);
    setLocalError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-card p-4 p-md-5 w-100 animate-fade-in-up" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '56px', height: '56px' }}>
            <FaPlane className="fs-4" style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <h2 className="fw-bold mb-1">Welcome Back</h2>
          <p className="text-muted small">Log in to sync with your AI Travel Companion</p>
        </div>

        {localError && (
          <div className="alert alert-danger border-0 small py-2 px-3 rounded-3" role="alert">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loadingLocal}
                style={{ fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold mb-0">Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FaLock />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loadingLocal}
                style={{ fontSize: '0.95rem' }}
              />
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
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top">
          <p className="small text-muted mb-0">
            Don't have an account? <Link to="/register" className="text-info fw-bold text-decoration-none">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
