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
      <div className="card glass-card p-4 p-md-5 w-100 animate-fade-in-up" style={{ maxWidth: '520px', background: 'var(--color-card-bg-solid)', borderColor: 'var(--color-border)' }}>
        <div className="text-center mb-4">
          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '56px', height: '56px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
            <FaPlane className="fs-4" style={{ transform: 'rotate(-45deg)', color: 'var(--color-primary)' }} />
          </div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Create Account</h2>
          <p className="text-muted small">Begin your journey with your AI co-pilot today</p>
        </div>

        {localError && (
          <div className="alert alert-danger border-0 small py-2.5 px-3 rounded-3 mb-4" role="alert">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>First Name</label>
              <div className="input-group">
                <span className="input-group-text border-end-0" style={{ background: 'var(--color-section-bg-2)', borderColor: 'var(--color-border)' }}>
                  <FaAddressCard style={{ color: 'var(--color-text-muted)', opacity: 0.8 }} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loadingLocal}
                  style={{ fontSize: '0.9rem', background: 'var(--color-section-bg-2)', borderLeft: 'none' }}
                />
              </div>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Last Name</label>
              <div className="input-group">
                <span className="input-group-text border-end-0" style={{ background: 'var(--color-section-bg-2)', borderColor: 'var(--color-border)' }}>
                  <FaAddressCard style={{ color: 'var(--color-text-muted)', opacity: 0.8 }} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loadingLocal}
                  style={{ fontSize: '0.9rem', background: 'var(--color-section-bg-2)', borderLeft: 'none' }}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Username *</label>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{ background: 'var(--color-section-bg-2)', borderColor: 'var(--color-border)' }}>
                <FaUser style={{ color: 'var(--color-text-muted)', opacity: 0.8 }} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loadingLocal}
                style={{ fontSize: '0.9rem', background: 'var(--color-section-bg-2)', borderLeft: 'none' }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Email Address *</label>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{ background: 'var(--color-section-bg-2)', borderColor: 'var(--color-border)' }}>
                <FaEnvelope style={{ color: 'var(--color-text-muted)', opacity: 0.8 }} />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loadingLocal}
                style={{ fontSize: '0.9rem', background: 'var(--color-section-bg-2)', borderLeft: 'none' }}
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Password *</label>
              <div className="input-group">
                <span className="input-group-text border-end-0" style={{ background: 'var(--color-section-bg-2)', borderColor: 'var(--color-border)' }}>
                  <FaLock style={{ color: 'var(--color-text-muted)', opacity: 0.8 }} />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="At least 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loadingLocal}
                  style={{ fontSize: '0.9rem', background: 'var(--color-section-bg-2)', borderLeft: 'none' }}
                />
              </div>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Confirm Password *</label>
              <div className="input-group">
                <span className="input-group-text border-end-0" style={{ background: 'var(--color-section-bg-2)', borderColor: 'var(--color-border)' }}>
                  <FaLock style={{ color: 'var(--color-text-muted)', opacity: 0.8 }} />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loadingLocal}
                  style={{ fontSize: '0.9rem', background: 'var(--color-section-bg-2)', borderLeft: 'none' }}
                />
              </div>
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
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: 'var(--color-border)' }}>
          <p className="small text-muted mb-0">
            Already have an account? <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--color-primary)' }}>Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
