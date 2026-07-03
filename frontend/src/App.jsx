import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Phase 2 Page Imports
import TripPlanner from './pages/TripPlanner';
import TripDetails from './pages/TripDetails';
import SharedTripView from './pages/SharedTripView';
import CommunityFeed from './pages/CommunityFeed';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 glow-wrapper">
          <div className="glow-ball-primary"></div>
          <div className="glow-ball-secondary"></div>
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/share/:shareToken" element={<SharedTripView />} />
              <Route path="/feed" element={<CommunityFeed />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/plan-trip" 
                element={
                  <ProtectedRoute>
                    <TripPlanner />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trips/:id" 
                element={
                  <ProtectedRoute>
                    <TripDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback to Home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
