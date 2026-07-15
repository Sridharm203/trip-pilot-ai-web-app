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
      <div className="card glass-card p-4 p-md-5 w-100 animate-fade-in-up" style={{ maxWidth: '460px', background: 'var(--color-card-bg-solid)', borderColor: 'var(--color-border)' }}>
        <div className="text-center mb-4">
          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '56px', height: '56px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
            <FaPlane className="fs-4" style={{ transform: 'rotate(-45deg)', color: 'var(--color-primary)' }} />
          </div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Welcome Back</h2>
          <p className="text-muted small">Log in to sync with your AI Travel Companion</p>
        </div>

        {localError && (
          <div className="alert alert-danger border-0 small py-2.5 px-3 rounded-3 mb-4" role="alert">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Email Address</label>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{ background: 'var(--color-section-bg-2)', borderColor: 'var(--color-border)' }}>
                <FaEnvelope style={{ color: 'var(--color-text-muted)', opacity: 0.8 }} />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loadingLocal}
                style={{ fontSize: '0.9rem', background: 'var(--color-section-bg-2)', borderLeft: 'none' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <label className="form-label small fw-semibold mb-0" style={{ color: 'var(--color-text-muted)' }}>Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{ background: 'var(--color-section-bg-2)', borderColor: 'var(--color-border)' }}>
                <FaLock style={{ color: 'var(--color-text-muted)', opacity: 0.8 }} />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loadingLocal}
                style={{ fontSize: '0.9rem', background: 'var(--color-section-bg-2)', borderLeft: 'none' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
            disabled={loadingLocal}
            style={{ fontSize: '0.95rem', fontWeight: '500', borderRadius: '8px' }}
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

        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: 'var(--color-border)' }}>
          <p className="small text-muted mb-0">
            Don't have an account? <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: 'var(--color-primary)' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
