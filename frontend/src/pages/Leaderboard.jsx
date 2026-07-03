import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaUserCircle, FaMapMarkerAlt, FaCompass } from 'react-icons/fa';
import api from '../services/api';
import axios from 'axios';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Leaderboard endpoint is public, we can fetch via axios directly or api
      const token = localStorage.getItem('accessToken');
      let response;
      if (token) {
        response = await api.get('users/leaderboard/');
      } else {
        response = await axios.get('http://127.0.0.1:8000/api/users/leaderboard/');
      }
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Top 3 users logic
  const podium = {
    first: users.find(u => u.rank === 1) || null,
    second: users.find(u => u.rank === 2) || null,
    third: users.find(u => u.rank === 3) || null
  };

  const remainingUsers = users.filter(u => u.rank > 3);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return <span className="fs-4">🥇</span>;
      case 2: return <span className="fs-4">🥈</span>;
      case 3: return <span className="fs-4">🥉</span>;
      default: return <span className="badge bg-secondary rounded-pill px-2.5">{rank}</span>;
    }
  };

  return (
    <div className="container py-5 animate-fade-in-up">
      <div className="text-center mb-5">
        <span className="badge bg-warning text-dark px-3 py-1.5 rounded-pill fw-bold mb-3">
          🏆 GLOBAL TRAVELER SCOREBOARD
        </span>
        <h1 className="display-5 fw-bold text-dark mb-2">Leaderboard</h1>
        <p className="text-muted lead">Compete with travelers worldwide, earn loyalty points, and secure badges</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : users.length > 0 ? (
        <>
          {/* Podium Layout */}
          <div className="row g-4 align-items-end justify-content-center mb-5 mt-2">
            {/* 2nd Place */}
            {podium.second && (
              <div className="col-md-3 col-6 text-center order-2 order-md-1">
                <div className="card border-0 glass-card p-4 rounded-4 shadow-sm hover-lift text-center position-relative mb-2">
                  <span className="fs-2 mb-2 d-block">🥈</span>
                  <div className="avatar-wrapper mx-auto mb-3 position-relative" style={{ width: '80px', height: '80px' }}>
                    {podium.second.avatar_url ? (
                      <img src={podium.second.avatar_url} alt={podium.second.username} className="rounded-circle w-100 h-100 border border-4 border-light shadow-sm" style={{ objectFit: 'cover' }} />
                    ) : (
                      <FaUserCircle className="text-muted w-100 h-100" />
                    )}
                  </div>
                  <h6 className="fw-bold mb-1">@{podium.second.username}</h6>
                  <small className="text-muted d-block mb-2">
                    <FaMapMarkerAlt /> {podium.second.home_city || "Earth"}
                  </small>
                  <span className="badge bg-secondary-subtle text-secondary fw-bold px-3 py-1.5 rounded-pill">
                    {podium.second.loyalty_points} Points
                  </span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {podium.first && (
              <div className="col-md-3 col-12 text-center order-1 order-md-2 mb-4 mb-md-0">
                <div className="card border-0 p-4 rounded-4 shadow hover-lift text-center position-relative" style={{ background: 'var(--gradient-dark)', color: 'white', minHeight: '270px' }}>
                  <div className="position-absolute top-0 start-50 translate-middle-y mt-2" style={{ transform: 'translateY(-20px) translateX(-50%)' }}>
                    <FaCrown className="text-warning fs-1 animate-pulse" />
                  </div>
                  <span className="fs-2 mb-2 d-block">🥇</span>
                  <div className="avatar-wrapper mx-auto mb-3 position-relative" style={{ width: '100px', height: '100px' }}>
                    {podium.first.avatar_url ? (
                      <img src={podium.first.avatar_url} alt={podium.first.username} className="rounded-circle w-100 h-100 border border-4 border-warning shadow" style={{ objectFit: 'cover' }} />
                    ) : (
                      <FaUserCircle className="text-white-50 w-100 h-100" />
                    )}
                  </div>
                  <h5 className="fw-bold mb-1 text-white">@{podium.first.username}</h5>
                  <small className="text-white-50 d-block mb-3">
                    <FaMapMarkerAlt /> {podium.first.home_city || "Earth"}
                  </small>
                  <span className="badge bg-warning text-dark fw-bold px-4 py-2 rounded-pill fs-6">
                    {podium.first.loyalty_points} Points
                  </span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {podium.third && (
              <div className="col-md-3 col-6 text-center order-3">
                <div className="card border-0 glass-card p-4 rounded-4 shadow-sm hover-lift text-center position-relative mb-2">
                  <span className="fs-2 mb-2 d-block">🥉</span>
                  <div className="avatar-wrapper mx-auto mb-3 position-relative" style={{ width: '80px', height: '80px' }}>
                    {podium.third.avatar_url ? (
                      <img src={podium.third.avatar_url} alt={podium.third.username} className="rounded-circle w-100 h-100 border border-4 border-light shadow-sm" style={{ objectFit: 'cover' }} />
                    ) : (
                      <FaUserCircle className="text-muted w-100 h-100" />
                    )}
                  </div>
                  <h6 className="fw-bold mb-1">@{podium.third.username}</h6>
                  <small className="text-muted d-block mb-2">
                    <FaMapMarkerAlt /> {podium.third.home_city || "Earth"}
                  </small>
                  <span className="badge bg-secondary-subtle text-secondary fw-bold px-3 py-1.5 rounded-pill">
                    {podium.third.loyalty_points} Points
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* List Table View */}
          <div className="card border-0 glass-card p-4 mx-auto" style={{ maxWidth: '850px' }}>
            <h5 className="fw-bold text-dark mb-4">Top Explorers</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: '80px' }}>Rank</th>
                    <th>Traveler</th>
                    <th>Home Location</th>
                    <th className="text-center">Trips Created</th>
                    <th className="text-end">Loyalty Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((profile) => (
                    <tr key={profile.rank} className={profile.rank <= 3 ? 'table-light' : ''}>
                      <td className="text-center fw-bold">{getRankBadge(profile.rank)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.username} className="rounded-circle" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                          ) : (
                            <FaUserCircle className="text-muted fs-3" />
                          )}
                          <span className="fw-bold text-dark">@{profile.username}</span>
                        </div>
                      </td>
                      <td>
                        <span className="small text-muted d-inline-flex align-items-center gap-1">
                          <FaMapMarkerAlt className="text-danger" /> {profile.home_city || "Not set"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="small fw-semibold text-dark d-inline-flex align-items-center gap-1">
                          <FaCompass className="text-info" /> {profile.trips_count}
                        </span>
                      </td>
                      <td className="text-end">
                        <span className="fw-bold text-success-emphasis bg-success-subtle px-3 py-1 rounded-pill small">
                          🏆 {profile.loyalty_points} Pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5 glass-card bg-light rounded-4 mx-auto" style={{ maxWidth: '500px' }}>
          <FaTrophy className="fs-1 text-muted mb-3" style={{ opacity: 0.3 }} />
          <h5 className="fw-bold text-dark">Scoreboard Empty</h5>
          <p className="text-muted small">Once users sign up and earn loyalty points, scores will display here.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
