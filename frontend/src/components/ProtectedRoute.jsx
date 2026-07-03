import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container my-5 py-5 text-center">
        <div className="card glass-card p-5 mx-auto" style={{ maxWidth: '450px' }}>
          <div className="skeleton-pulse rounded mb-4" style={{ height: '40px' }}></div>
          <div className="skeleton-pulse rounded mb-3" style={{ height: '20px', width: '80%' }}></div>
          <div className="skeleton-pulse rounded mb-3" style={{ height: '20px', width: '90%' }}></div>
          <div className="skeleton-pulse rounded" style={{ height: '50px' }}></div>
          <p className="mt-4 text-muted">Securing your journey...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
