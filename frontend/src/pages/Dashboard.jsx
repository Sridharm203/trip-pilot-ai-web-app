import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { 
  FaCalendarAlt, FaDollarSign, FaRoute, 
  FaSuitcase, FaMapMarkerAlt, FaCompass, FaChevronRight, FaPlus, FaPlane,
  FaUsers, FaClock, FaBriefcase
} from 'react-icons/fa';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { currency, currencySymbol, formatAmount, convertAmount } = useCurrency();
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
    { label: "Total Budget", value: formatAmount(totalBudget), icon: <FaDollarSign className="text-success" /> },
    { label: "Completed Trips", value: completedTrips.length, icon: <FaRoute className="text-warning" /> }
  ];

  // Budget category allocation mock data for Recharts (to be linked to dynamic expenses in Phase 5)
  const budgetData = [
    { name: 'Hotel', value: nextTrip ? Math.round(convertAmount(parseFloat(nextTrip.budget)) * 0.4) : Math.round(convertAmount(400)), color: '#0ea5e9' },
    { name: 'Transport', value: nextTrip ? Math.round(convertAmount(parseFloat(nextTrip.budget)) * 0.25) : Math.round(convertAmount(250)), color: '#10b981' },
    { name: 'Food', value: nextTrip ? Math.round(convertAmount(parseFloat(nextTrip.budget)) * 0.2) : Math.round(convertAmount(200)), color: '#fb923c' },
    { name: 'Shopping', value: nextTrip ? Math.round(convertAmount(parseFloat(nextTrip.budget)) * 0.15) : Math.round(convertAmount(150)), color: '#f43f5e' }
  ];

  if (loading) {
    return (
      <div className="container py-5">
        <div className="skeleton-pulse rounded mb-4" style={{ height: '160px' }}></div>
        <div className="row g-4 mb-4">
          <div className="col-4"><div className="skeleton-pulse rounded" style={{ height: '100px' }}></div></div>
          <div className="col-4"><div className="skeleton-pulse rounded" style={{ height: '100px' }}></div></div>
          <div className="col-4"><div className="skeleton-pulse rounded" style={{ height: '100px' }}></div></div>
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
          <div className="col-sm-6 col-md-4" key={idx}>
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
              <div className="copilot-hero-card p-4 position-relative overflow-hidden">
                <div className="position-absolute top-0 end-0 p-4 pointer-events-none copilot-plane-watermark" style={{ pointerEvents: 'none', zIndex: 1 }}>
                  <svg className="text-primary" style={{ width: '4.5rem', height: '4.5rem', transform: 'rotate(-45deg)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z"/>
                  </svg>
                </div>

                <div className="d-flex flex-column gap-4" style={{ position: 'relative', zIndex: 2 }}>
                  {/* Top Zone: Header (Location & Dates) + Countdown Live Timer */}
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 border-bottom pb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="copilot-icon-wrapper primary shadow-sm">
                        {/* Custom Location Pin SVG */}
                        <svg className="copilot-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="copilot-location-title mb-0">
                          {nextTrip.destination}
                        </h5>
                        <p className="copilot-dates-subtitle mb-0 d-flex align-items-center gap-1.5 mt-0.5">
                          {/* Custom Calendar Sheet SVG */}
                          <svg className="copilot-svg-icon" style={{ width: '14px', height: '14px', strokeWidth: 2 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{nextTrip.start_date} to {nextTrip.end_date}</span>
                        </p>
                      </div>
                    </div>

                    {/* Timer Countdown capsule */}
                    <div className="copilot-timer-container">
                      <div className="d-flex align-items-center gap-1.5 text-warning fw-bold small me-1">
                        {/* Custom stopwatch SVG with pulsing animation */}
                        <svg className="copilot-svg-icon animate-pulse" style={{ strokeWidth: 2.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span style={{ fontSize: '0.8rem', letterSpacing: '0.02em' }}>Starts in:</span>
                      </div>
                      <div className="copilot-timer-units">
                        <div className="copilot-timer-block">
                          <div className="num">{timeLeft.days}</div>
                          <div className="lbl">d</div>
                        </div>
                        <div className="copilot-timer-block">
                          <div className="num">{timeLeft.hours.toString().padStart(2, '0')}</div>
                          <div className="lbl">h</div>
                        </div>
                        <div className="copilot-timer-block">
                          <div className="num">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                          <div className="lbl">m</div>
                        </div>
                        <div className="copilot-timer-block">
                          <div className="num">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                          <div className="lbl">s</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Zone: Metrics Grid */}
                  <div className="copilot-grid">
                    {/* Traveler Info */}
                    <div className="copilot-grid-item">
                      <div>
                        <div className="item-header">
                          <h6 className="item-title">Travelers</h6>
                          <div className="copilot-icon-wrapper secondary">
                            {/* Custom double user SVG */}
                            <svg className="copilot-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          </div>
                        </div>
                        <div className="item-value">{nextTrip.num_travelers} Travelers</div>
                      </div>
                      <p className="item-sub text-capitalize">{nextTrip.travel_type} Setup</p>
                    </div>

                    {/* Budget Info */}
                    <div className="copilot-grid-item">
                      <div>
                        <div className="item-header">
                          <h6 className="item-title">Trip Budget</h6>
                          <div className="copilot-icon-wrapper success">
                            {/* Custom Wallet SVG */}
                            <svg className="copilot-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="4" width="20" height="16" rx="2" />
                              <path d="M12 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                              <line x1="22" y1="10" x2="18" y2="10" />
                            </svg>
                          </div>
                        </div>
                        <div className="item-value">{formatAmount(nextTrip.budget)}</div>
                      </div>
                      <p className="item-sub">Estimated expenses</p>
                    </div>

                    {/* Packing progress Widget */}
                    <div className="copilot-grid-item">
                      <div>
                        <div className="item-header">
                          <h6 className="item-title">Packing</h6>
                          <div className="copilot-icon-wrapper info">
                            {/* Custom luggage SVG with a check badge */}
                            <svg className="copilot-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="6" width="18" height="14" rx="2" />
                              <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                              <path d="M12 10v6" />
                              <path d="M9 13h6" />
                            </svg>
                          </div>
                        </div>
                        {nextTrip.packing_list && nextTrip.packing_list.length > 0 ? (
                          <div className="item-value">
                            {nextTrip.packing_list.filter(i => i.packed).length}/{nextTrip.packing_list.length} Items
                          </div>
                        ) : (
                          <div className="item-value">Empty</div>
                        )}
                      </div>
                      
                      {nextTrip.packing_list && nextTrip.packing_list.length > 0 ? (
                        <div className="w-100 mt-2">
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
                          <div className="copilot-progress-text">
                            {Math.round((nextTrip.packing_list.filter(i => i.packed).length / nextTrip.packing_list.length) * 100)}% Packed
                          </div>
                        </div>
                      ) : (
                        <p className="item-sub">No checklist items</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="d-flex align-items-center justify-content-between mt-1 pt-3 border-top">
                    <span className="small text-muted fw-semibold">
                      Your AI Trip Companion is active.
                    </span>
                    <Link to={`/trips/${nextTrip.id}`} className="btn btn-primary btn-copilot-action btn-sm px-4 py-2.5 fw-semibold d-flex align-items-center gap-2" style={{ borderRadius: '10px' }}>
                      <span>Open Itinerary</span>
                      <span className="btn-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                    </Link>
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
                      <div className="bg-primary-subtle text-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                        <FaPlane style={{ transform: 'rotate(-45deg)', fontSize: '1.2rem' }} />
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
                  <Tooltip formatter={(value) => `${currencySymbol}${value.toLocaleString()}`} />
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
                      <span className="small text-muted">{item.name} ({currencySymbol}{item.value.toLocaleString()})</span>
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
