import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaHeart, FaCopy, FaEye, FaGlobe, FaCalendarAlt, FaUsers, FaCompass } from 'react-icons/fa';
import api from '../services/api';
import axios from 'axios';

const CommunityFeed = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cloningId, setCloningId] = useState(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      // Feed endpoint is public, we can fetch via axios directly or api
      const token = localStorage.getItem('token');
      let response;
      if (token) {
        response = await api.get('trips/feed/');
      } else {
        response = await axios.get('http://127.0.0.1:8000/api/trips/feed/');
      }
      setTrips(response.data);
    } catch (err) {
      console.error("Failed to fetch community feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (tripId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to like this itinerary.");
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`trips/${tripId}/like/`);
      setTrips(trips.map(trip => {
        if (trip.id === tripId) {
          return {
            ...trip,
            liked_by_user: response.data.liked,
            likes_count: response.data.likes_count
          };
        }
        return trip;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClone = async (tripId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to clone this itinerary.");
      navigate('/login');
      return;
    }

    if (window.confirm("Copy this community itinerary into your dashboard?")) {
      setCloningId(tripId);
      try {
        const response = await api.post(`trips/${tripId}/clone/`);
        alert("Trip cloned successfully! Redirecting you to your new trip...");
        navigate(`/trips/${response.data.id}`);
      } catch (err) {
        console.error(err);
        alert("Failed to clone trip.");
      } finally {
        setCloningId(null);
      }
    }
  };

  const filteredTrips = trips.filter(t => 
    t.destination.toLowerCase().includes(search.toLowerCase()) ||
    t.travel_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-5 animate-fade-in-up">
      <div className="text-center mb-5">
        <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill fw-bold mb-3">
          🌎 GLOBAL ADVENTURES FEED
        </span>
        <h1 className="display-5 fw-bold text-dark mb-2">Community Feed</h1>
        <p className="text-muted lead">Explore and clone custom public travel itineraries crafted by fellow explorers</p>
      </div>

      {/* Search Bar */}
      <div className="card border-0 glass-card p-3 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
        <div className="input-group">
          <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted" /></span>
          <input 
            type="text" 
            className="form-control border-0" 
            placeholder="Search by city or travel persona..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ outline: 'none', boxShadow: 'none' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="row g-4">
          {[1, 2, 3].map(n => (
            <div className="col-md-4" key={n}>
              <div className="card glass-card p-4 skeleton-pulse" style={{ height: '300px' }}></div>
            </div>
          ))}
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="row g-4">
          {filteredTrips.map((trip) => {
            const start = new Date(trip.start_date);
            const end = new Date(trip.end_date);
            const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

            return (
              <div className="col-md-4" key={trip.id}>
                <div className="card h-100 border-0 glass-card p-4 d-flex flex-column hover-lift">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge bg-secondary-subtle text-secondary fw-semibold rounded-pill px-3">
                      👤 @{trip.owner_username}
                    </span>
                    <button 
                      onClick={() => handleLike(trip.id)}
                      className={`btn border-0 p-0 d-flex align-items-center gap-1 small ${trip.liked_by_user ? 'text-danger' : 'text-muted'}`}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <FaHeart />
                      <span>{trip.likes_count}</span>
                    </button>
                  </div>

                  <h4 className="fw-bold text-dark mb-1">{trip.destination}</h4>
                  <div className="d-flex flex-wrap gap-2.5 mb-3 text-muted small">
                    <span className="d-flex align-items-center gap-1"><FaCalendarAlt /> {days} Days</span>
                    <span className="d-flex align-items-center gap-1"><FaUsers /> {trip.travel_type}</span>
                  </div>

                  <p className="small text-muted flex-grow-1 mb-4" style={{ display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {trip.summary || "A custom trip plan detailing schedules, dining, transport guidelines, and lodging recommendations."}
                  </p>

                  <div className="d-flex gap-2 mt-auto border-top pt-3">
                    <Link 
                      to={`/share/${trip.share_token}`} 
                      className="btn btn-outline-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    >
                      <FaEye /> View
                    </Link>
                    <button 
                      onClick={() => handleClone(trip.id)}
                      className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      disabled={cloningId === trip.id}
                    >
                      {cloningId === trip.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Cloning...
                        </>
                      ) : (
                        <>
                          <FaCopy /> Clone Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5 glass-card bg-light rounded-4 mx-auto" style={{ maxWidth: '500px' }}>
          <FaGlobe className="fs-1 text-muted mb-3" style={{ opacity: 0.3 }} />
          <h5 className="fw-bold text-dark">No Trips Shared Yet</h5>
          <p className="text-muted small">Be the first to publish your amazing trip plan to the community feed!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
