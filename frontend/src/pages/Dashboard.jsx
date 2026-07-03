import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaCalendarAlt, FaDollarSign, FaRoute, 
  FaSuitcase, FaMapMarkerAlt, FaCompass, FaChevronRight, FaPlus 
} from 'react-icons/fa';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        const response = await api.get('trips/');
        setTrips(response.data);
      } catch (err) {
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserTrips();
  }, []);

  // Split trips into upcoming and past
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingTrips = trips.filter(t => t.start_date >= todayStr).sort((a, b) => a.start_date.localeCompare(b.start_date));
  const completedTrips = trips.filter(t => t.start_date < todayStr).sort((a, b) => b.start_date.localeCompare(a.start_date));

  // Dynamically calculate metrics
  const totalBudget = trips.reduce((sum, t) => sum + parseFloat(t.budget), 0);
  const nextTrip = upcomingTrips[0] || null;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!nextTrip) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(nextTrip.start_date + "T00:00:00") - +new Date();
      let remaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        remaining = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      setTimeLeft(remaining);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [nextTrip]);

  const stats = [
    { label: "Planned Trips", value: trips.length, icon: <FaCalendarAlt className="text-primary" /> },
    { label: "Total Budget", value: `$${totalBudget.toLocaleString()}`, icon: <FaDollarSign className="text-success" /> },
    { label: "Loyalty Points", value: user?.profile?.loyalty_points || "0", icon: <FaCompass className="text-info" /> },
    { label: "Completed Trips", value: completedTrips.length, icon: <FaRoute className="text-warning" /> }
  ];

  // Budget category allocation mock data for Recharts (to be linked to dynamic expenses in Phase 5)
  const budgetData = [
    { name: 'Hotel', value: nextTrip ? Math.round(parseFloat(nextTrip.budget) * 0.4) : 400, color: '#0ea5e9' },
    { name: 'Transport', value: nextTrip ? Math.round(parseFloat(nextTrip.budget) * 0.25) : 250, color: '#10b981' },
    { name: 'Food', value: nextTrip ? Math.round(parseFloat(nextTrip.budget) * 0.2) : 200, color: '#fb923c' },
    { name: 'Shopping', value: nextTrip ? Math.round(parseFloat(nextTrip.budget) * 0.15) : 150, color: '#f43f5e' }
  ];

  if (loading) {
    return (
      <div className="container py-5">
        <div className="skeleton-pulse rounded mb-4" style={{ height: '160px' }}></div>
        <div className="row g-4 mb-4">
          <div className="col-3"><div className="skeleton-pulse rounded" style={{ height: '100px' }}></div></div>
          <div className="col-3"><div className="skeleton-pulse rounded" style={{ height: '100px' }}></div></div>
          <div className="col-3"><div className="skeleton-pulse rounded" style={{ height: '100px' }}></div></div>
          <div className="col-3"><div className="skeleton-pulse rounded" style={{ height: '100px' }}></div></div>
        </div>
        <div className="row g-4">
          <div className="col-8"><div className="skeleton-pulse rounded" style={{ height: '350px' }}></div></div>
          <div className="col-4"><div className="skeleton-pulse rounded" style={{ height: '350px' }}></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="glass-card p-4 p-md-5 mb-4 text-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4" style={{ background: 'var(--gradient-ocean)', border: 'none' }}>
        <div>
          <span className="badge bg-white text-primary px-3 py-1.5 rounded-pill fw-bold mb-2">
            TRAVEL STATUS: ACTIVE
          </span>
          <h1 className="display-5 fw-bold mb-1">
            Hello, {user?.first_name || user?.username}!
          </h1>
          <p className="lead mb-0 text-white-50">
            {nextTrip 
              ? `Your next adventure to ${nextTrip.destination} starts on ${nextTrip.start_date}.`
              : "No upcoming trips planned yet. Where should we go next?"
            }
          </p>
        </div>
        <div>
          <Link to="/plan-trip" className="btn btn-light text-primary fw-bold py-2.5 px-4 d-flex align-items-center gap-2" style={{ borderRadius: '10px' }}>
            <FaPlus /> Plan New Trip
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div className="col-sm-6 col-lg-3" key={idx}>
            <div className="card border-0 glass-card p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small fw-semibold mb-1">{stat.label}</p>
                  <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
                </div>
                <div className="bg-light p-3 rounded-3 fs-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="row g-4">
        {/* Left Column: Trip Previews */}
        <div className="col-lg-8">
          {/* Upcoming Trip details */}
          <div className="card border-0 glass-card p-4 mb-4">
            <h4 className="fw-bold mb-4 d-flex align-items-center justify-content-between">
              <span>Next Adventure Co-Pilot</span>
              {nextTrip && (
                <span className="badge bg-success-subtle text-success small border border-success-subtle px-3 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
                  Upcoming
                </span>
              )}
            </h4>
            
            {nextTrip ? (
              <div className="row align-items-stretch g-4">
                <div className="col-md-7 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-1 d-flex align-items-center text-primary">
                      <FaMapMarkerAlt className="me-2" /> {nextTrip.destination}
                    </h5>
                    <p className="text-muted small mb-3">
                      <FaCalendarAlt className="me-2" /> {nextTrip.start_date} to {nextTrip.end_date}
                    </p>
                    <div className="d-flex flex-wrap gap-2.5 mb-3">
                      <span className="bg-light rounded px-2.5 py-1.5 small text-dark fw-semibold" style={{ fontSize: '0.75rem' }}>
                        👪 {nextTrip.num_travelers} Travelers ({nextTrip.travel_type})
                      </span>
                      <span className="bg-light rounded px-2.5 py-1.5 small text-dark fw-semibold" style={{ fontSize: '0.75rem' }}>
                        💰 Budget: ${parseFloat(nextTrip.budget).toLocaleString()}
                      </span>
                    </div>

                    {/* Packing checklist progress widget */}
                    {nextTrip.packing_list && nextTrip.packing_list.length > 0 && (
                      <div className="mb-3 bg-light p-3 rounded-4">
                        <div className="d-flex justify-content-between mb-1.5 small fw-bold text-dark">
                          <span>🎒 Packing Progress</span>
                          <span>
                            {nextTrip.packing_list.filter(i => i.packed).length}/{nextTrip.packing_list.length} Packed
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ 
                              width: `${(nextTrip.packing_list.filter(i => i.packed).length / nextTrip.packing_list.length) * 100}%` 
                            }} 
                            aria-valuenow={(nextTrip.packing_list.filter(i => i.packed).length / nextTrip.packing_list.length) * 100} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <Link to={`/trips/${nextTrip.id}`} className="btn btn-primary btn-sm px-3.5 py-2 fw-semibold" style={{ borderRadius: '8px' }}>Open Itinerary</Link>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="p-4 rounded-4 text-white text-center h-100 d-flex flex-column justify-content-center" style={{ background: 'var(--gradient-dark)' }}>
                    <small className="text-white-50 uppercase fw-bold d-block mb-3.5 small tracking-wide" style={{ fontSize: '0.7rem' }}>Departure Countdown</small>
                    
                    <div className="d-flex justify-content-center align-items-center gap-2.5">
                      <div className="text-center">
                        <span className="fs-3 fw-bold d-block text-warning">{timeLeft.days}</span>
                        <small className="text-white-50 text-xs" style={{ fontSize: '0.65rem' }}>DAYS</small>
                      </div>
                      <span className="text-white-50 fs-4 pb-3">:</span>
                      <div className="text-center">
                        <span className="fs-3 fw-bold d-block text-warning">{timeLeft.hours}</span>
                        <small className="text-white-50 text-xs" style={{ fontSize: '0.65rem' }}>HRS</small>
                      </div>
                      <span className="text-white-50 fs-4 pb-3">:</span>
                      <div className="text-center">
                        <span className="fs-3 fw-bold d-block text-warning">{timeLeft.minutes}</span>
                        <small className="text-white-50 text-xs" style={{ fontSize: '0.65rem' }}>MIN</small>
                      </div>
                      <span className="text-white-50 fs-4 pb-3">:</span>
                      <div className="text-center">
                        <span className="fs-3 fw-bold d-block text-warning">{timeLeft.seconds}</span>
                        <small className="text-white-50 text-xs" style={{ fontSize: '0.65rem' }}>SEC</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted mb-3">You don't have any upcoming trips scheduled.</p>
                <Link to="/plan-trip" className="btn btn-outline-custom">Create Your First AI Itinerary</Link>
              </div>
            )}
          </div>

          {/* Recent/All Trips list */}
          <div className="card border-0 glass-card p-4">
            <h4 className="fw-bold mb-4">Saved Itineraries</h4>
            {trips.length > 0 ? (
              <div className="list-group list-group-flush">
                {trips.map((trip, idx) => (
                  <div key={idx} className="list-group-item bg-transparent border-0 px-0 py-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary-subtle text-primary rounded-3 p-2.5 me-3 text-center" style={{ width: '44px' }}>
                        ✈️
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{trip.destination}</h6>
                        <small className="text-muted">{trip.start_date} to {trip.end_date}</small>
                      </div>
                    </div>
                    <Link to={`/trips/${trip.id}`} className="btn btn-outline-custom btn-sm rounded-pill px-3">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small text-center my-3">No saved trips found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Budgets & Quick Actions */}
        <div className="col-lg-4">
          {/* Budget Visualizer Chart */}
          <div className="card border-0 glass-card p-4 mb-4">
            <h4 className="fw-bold mb-2">Estimated Allocation</h4>
            <p className="text-muted small mb-3">Target allocation on next trip</p>
            
            <div className="d-flex justify-content-center align-items-center" style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3">
              <div className="row g-2">
                {budgetData.map((item, idx) => (
                  <div className="col-6" key={idx}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle d-inline-block" style={{ width: '12px', height: '12px', backgroundColor: item.color }}></span>
                      <span className="small text-muted">{item.name} (${item.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="card border-0 glass-card p-4">
            <h4 className="fw-bold mb-4">Features Overview</h4>
            <div className="d-grid gap-3">
              <Link to="/plan-trip" className="btn btn-outline-custom text-start d-flex align-items-center justify-content-between p-3 text-decoration-none">
                <span className="d-flex align-items-center gap-2">
                  <FaSuitcase className="text-info fs-5" />
                  <span className="text-dark">AI Planner Form</span>
                </span>
                <FaChevronRight className="small text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
