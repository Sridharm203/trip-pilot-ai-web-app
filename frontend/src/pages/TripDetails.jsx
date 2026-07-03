import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FaCalendarAlt, FaDollarSign, FaUsers, FaCompass, FaChevronLeft,
  FaCopy, FaShareAlt, FaTrashAlt, FaHotel, FaUtensils, 
  FaBus, FaCameraRetro, FaCloudSun, FaExclamationTriangle,
  FaBriefcase, FaComments, FaExclamationCircle, FaBook, FaGlobe
} from 'react-icons/fa';
import TripMap from '../components/TripMap';
import PackingAssistantTab from '../components/PackingAssistantTab';
import TripGuideTab from '../components/TripGuideTab';
import ReplannerModal from '../components/ReplannerModal';
import ExpensesTab from '../components/ExpensesTab';
import JournalTab from '../components/JournalTab';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showReplanner, setShowReplanner] = useState(false);

  // Fetch Trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await api.get(`trips/${id}/`);
        setTrip(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load trip details. It might have been deleted.");
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [id]);

  // Fetch Weather details based on destination
  useEffect(() => {
    const fetchWeatherForecast = async () => {
      if (!trip) return;
      try {
        const city = trip.destination.split(',')[0].trim();
        const response = await api.get(`trips/weather/?city=${city}`);
        setWeather(response.data);
      } catch (err) {
        console.warn("Weather forecast fetch failed", err);
      }
    };

    if (trip) {
      fetchWeatherForecast();
    }
  }, [trip]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this trip itinerary?")) {
      try {
        await api.delete(`trips/${id}/`);
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
        alert("Failed to delete trip.");
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await api.post(`trips/${id}/duplicate/`);
      alert("Trip duplicated successfully!");
      navigate(`/trips/${response.data.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to duplicate trip.");
    }
  };

  const handleShare = () => {
    if (!trip) return;
    const shareUrl = `${window.location.origin}/share/${trip.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const handlePublishToggle = async () => {
    try {
      const response = await api.post(`trips/${id}/publish/`);
      setTrip({ ...trip, is_public: response.data.is_public });
      alert(response.data.is_public 
        ? "Trip published to Community Feed! You earned +20 loyalty points!" 
        : "Trip removed from Community Feed."
      );
    } catch (err) {
      console.error(err);
      alert("Failed to toggle public state.");
    }
  };

  const handleReplanned = (updatedTrip) => {
    setTrip(updatedTrip);
    setSelectedDay(1); // Reset selected day to Day 1
  };

  // Check for active weather warnings across the forecast
  const activeWarning = weather.find(w => w.warning !== "")?.warning || "";

  if (loading) {
    return (
      <div className="container py-5">
        <div className="card glass-card p-5">
          <div className="skeleton-pulse rounded mb-4" style={{ height: '50px', width: '50%' }}></div>
          <div className="skeleton-pulse rounded mb-3" style={{ height: '20px', width: '30%' }}></div>
          <div className="row g-3 mb-4">
            <div className="col-4"><div className="skeleton-pulse rounded" style={{ height: '80px' }}></div></div>
            <div className="col-4"><div className="skeleton-pulse rounded" style={{ height: '80px' }}></div></div>
            <div className="col-4"><div className="skeleton-pulse rounded" style={{ height: '80px' }}></div></div>
          </div>
          <div className="skeleton-pulse rounded" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container py-5 text-center">
        <div className="card glass-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <h3 className="fw-bold mb-3">Trip Not Found</h3>
          <p className="text-muted mb-4">{error || "The itinerary could not be loaded."}</p>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Find active day's plan
  const activeDayPlan = trip.itinerary?.find(d => d.day === selectedDay) || trip.itinerary?.[0] || null;

  return (
    <div className="container py-5 animate-fade-in-up">
      {/* Back link */}
      <Link to="/dashboard" className="text-muted text-decoration-none small d-inline-flex align-items-center mb-4">
        <FaChevronLeft className="me-1" /> Back to Dashboard
      </Link>

      {/* Weather Warning Notification */}
      {activeWarning && (
        <div className="alert alert-warning border-0 p-3 mb-4 rounded-4 shadow-sm d-flex align-items-center gap-3 animate-pulse">
          <FaExclamationTriangle className="text-warning fs-3 flex-shrink-0" />
          <div>
            <h6 className="fw-bold mb-0 text-dark">Active Weather Alert</h6>
            <p className="small text-muted mb-0">{activeWarning}</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="card glass-card p-4 p-md-5 mb-4 border-0" style={{ background: 'var(--gradient-dark)', color: 'white' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4">
          <div>
            <span className="badge bg-info text-dark px-3 py-1.5 rounded-pill fw-bold mb-3">
              ✈️ AI CO-PILOT ACTIVE
            </span>
            <h1 className="display-4 fw-bold text-white mb-2">{trip.destination}</h1>
            <p className="lead mb-0 text-white-50 d-flex align-items-center gap-2">
              <FaCalendarAlt /> {trip.start_date} to {trip.end_date}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button 
              onClick={handlePublishToggle} 
              className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-semibold ${trip.is_public ? 'btn-success text-white' : 'btn-outline-light'}`}
              style={{ borderRadius: '8px' }}
            >
              <FaGlobe /> {trip.is_public ? "Public on Feed" : "Publish to Feed"}
            </button>
            <button onClick={() => setShowReplanner(true)} className="btn btn-warning btn-sm d-flex align-items-center gap-2 px-3 py-2 text-dark fw-bold" style={{ borderRadius: '8px' }}>
              <FaExclamationCircle /> Re-plan Trip
            </button>
            <button onClick={handleDuplicate} className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: '8px' }}>
              <FaCopy /> Duplicate
            </button>
            <button onClick={handleShare} className="btn btn-info btn-sm d-flex align-items-center gap-2 px-3 py-2 text-dark fw-semibold" style={{ borderRadius: '8px' }}>
              <FaShareAlt /> {shareSuccess ? "Copied!" : "Share"}
            </button>
            <button onClick={handleDelete} className="btn btn-danger btn-sm d-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: '8px' }}>
              <FaTrashAlt /> Delete
            </button>
          </div>
        </div>

        {shareSuccess && (
          <div className="alert alert-success border-0 py-2.5 px-4 rounded-3 small mt-3 mb-0" role="alert" style={{ background: 'rgba(25, 135, 84, 0.2)', color: '#a3cfbb' }}>
            Public read-only link copied to clipboard! Send this URL to your friends or family.
          </div>
        )}

        <hr className="my-4 border-secondary" />

        <div className="row g-3 text-center text-md-start">
          <div className="col-6 col-md-3">
            <small className="text-muted d-block uppercase mb-1">Travel Persona</small>
            <span className="fw-bold fs-5 text-info d-flex align-items-center justify-content-center justify-content-md-start gap-1">
              <FaUsers /> {trip.travel_type}
            </span>
          </div>
          <div className="col-6 col-md-3">
            <small className="text-muted d-block uppercase mb-1">Total Budget</small>
            <span className="fw-bold fs-5 text-success d-flex align-items-center justify-content-center justify-content-md-start gap-1">
              <FaDollarSign /> ${parseFloat(trip.budget).toLocaleString()}
            </span>
          </div>
          <div className="col-12 col-md-6">
            <small className="text-muted d-block uppercase mb-1">AI Trip Concept</small>
            <span className="small text-white-50">{trip.summary}</span>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="card glass-card p-0 mb-4 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="bg-light border-bottom d-flex overflow-auto">
          {[
            { id: 'itinerary', label: 'Day-Wise Itinerary', icon: <FaCompass /> },
            { id: 'hotels', label: 'Hotels', icon: <FaHotel /> },
            { id: 'restaurants', label: 'Food & Drink', icon: <FaUtensils /> },
            { id: 'transport', label: 'Transit & Sights', icon: <FaBus /> },
            { id: 'weather', label: '7-Day Weather', icon: <FaCloudSun /> },
            { id: 'packing', label: 'Packing Checklist', icon: <FaBriefcase /> },
            { id: 'guide', label: 'AI Local Guide', icon: <FaComments /> },
            { id: 'expenses', label: 'Expense Tracker', icon: <FaDollarSign /> },
            { id: 'journal', label: 'Travel Journal', icon: <FaBook /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn border-0 py-3 px-4 rounded-0 fw-semibold d-flex align-items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white border-bottom border-primary border-3 text-primary' : 'text-muted hover-bg-light'}`}
              style={{ flexShrink: 0 }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body Contents */}
        <div className="p-4 p-md-5">
          {activeTab === 'itinerary' && (
            <div className="animate-fade-in-up">
              <h4 className="fw-bold mb-4 text-dark">Day-wise Schedule & Routing</h4>
              
              {/* Day Selector Buttons */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {trip.itinerary?.map((dayPlan) => (
                  <button
                    key={dayPlan.day}
                    onClick={() => setSelectedDay(dayPlan.day)}
                    className={`btn btn-sm px-3.5 py-2 rounded-pill fw-semibold ${selectedDay === dayPlan.day ? 'btn-primary' : 'btn-outline-secondary'}`}
                  >
                    Day {dayPlan.day}
                  </button>
                ))}
              </div>

              {/* Map Layer Embed */}
              {activeDayPlan && (
                <div className="mb-5">
                  <h6 className="fw-bold text-muted uppercase mb-3">ROUTE OVERLAY</h6>
                  <TripMap
                    destination={trip.destination}
                    hotels={trip.hotels}
                    restaurants={trip.restaurants}
                    sights={activeDayPlan.activities || []}
                    activeDay={selectedDay}
                  />
                </div>
              )}

              {/* Day Schedule Timeline */}
              {activeDayPlan && (
                <div className="position-relative ms-2 ps-4 border-start border-2 border-primary-subtle">
                  <h5 className="fw-bold mb-1 text-primary">Day {activeDayPlan.day}</h5>
                  <h6 className="text-muted fw-semibold mb-4">{activeDayPlan.theme}</h6>
                  
                  <div className="row g-3">
                    {activeDayPlan.activities?.map((act, aIdx) => (
                      <div className="col-12" key={aIdx}>
                        <div className="card bg-light border-0 p-3.5 rounded-4 shadow-sm hover-lift">
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-2">
                            <span className="badge bg-secondary-subtle text-secondary fw-bold rounded-pill px-3">
                              ⏰ {act.time}
                            </span>
                            <span className="badge bg-success-subtle text-success fw-bold">
                              💰 {act.cost}
                            </span>
                          </div>
                          <h6 className="fw-bold text-dark mb-1">{act.title}</h6>
                          <p className="small text-muted mb-0">{act.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="animate-fade-in-up">
              <h4 className="fw-bold mb-4">Suggested Lodging</h4>
              <div className="row g-4">
                {trip.hotels?.map((hotel, idx) => (
                  <div className="col-md-6" key={idx}>
                    <div className="card h-100 p-4 border-light bg-light rounded-4 shadow-sm hover-lift">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                          <FaHotel className="text-info" /> {hotel.name}
                        </h5>
                        <span className="badge bg-warning text-dark fw-bold">⭐️ {hotel.rating}</span>
                      </div>
                      <p className="small text-muted mb-3">{hotel.description}</p>
                      <div className="bg-white p-3 rounded-3 border-start border-4 border-info">
                        <small className="fw-semibold d-block text-info mb-1">AI Recommendation:</small>
                        <p className="small text-muted mb-0">{hotel.why_recommend}</p>
                      </div>
                      <div className="mt-3 text-end">
                        <span className="fw-bold text-dark">{hotel.price_range}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'restaurants' && (
            <div className="animate-fade-in-up">
              <h4 className="fw-bold mb-4">Dining & Gastronomy</h4>
              <div className="row g-4">
                {trip.restaurants?.map((rest, idx) => (
                  <div className="col-md-6" key={idx}>
                    <div className="card h-100 p-4 border-light bg-light rounded-4 shadow-sm hover-lift">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                          <FaUtensils className="text-danger" /> {rest.name}
                        </h5>
                        <span className="badge bg-secondary text-white">{rest.cuisine}</span>
                      </div>
                      <p className="small text-muted mb-3">{rest.description}</p>
                      <div className="bg-white p-3 rounded-3 border-start border-4 border-danger">
                        <small className="fw-semibold d-block text-danger mb-1">AI Recommendation:</small>
                        <p className="small text-muted mb-0">{rest.why_recommend}</p>
                      </div>
                      <div className="mt-3 text-end">
                        <span className="fw-bold text-dark">{rest.price_range}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="animate-fade-in-up">
              <div className="row g-4">
                <div className="col-md-6">
                  <h4 className="fw-bold mb-4">Transport Logistics</h4>
                  <div className="list-group gap-3">
                    {trip.transport?.map((trans, idx) => (
                      <div className="list-group-item bg-light border-0 p-3 rounded-4 shadow-sm" key={idx}>
                        <h6 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
                          <FaBus /> {trans.type}
                        </h6>
                        <p className="small text-muted mb-2">{trans.description}</p>
                        <small className="fw-bold text-success">Cost Estimate: {trans.cost_estimate}</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-6">
                  <h4 className="fw-bold mb-4">Top Tourist Sights</h4>
                  <div className="list-group gap-3">
                    {trip.things_to_do?.map((sight, idx) => (
                      <div className="list-group-item bg-light border-0 p-3 rounded-4 shadow-sm" key={idx}>
                        <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                          <FaCameraRetro className="text-info" /> {sight.title}
                        </h6>
                        <p className="small text-muted mb-0">{sight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="animate-fade-in-up">
              <h4 className="fw-bold mb-4">7-Day Weather Forecast</h4>
              {weather.length > 0 ? (
                <div className="row g-3">
                  {weather.map((w, idx) => (
                    <div className="col-md-4 col-sm-6" key={idx}>
                      <div className={`card h-100 p-3.5 border-0 rounded-4 shadow-sm ${w.rain_alert ? 'bg-info-subtle border-start border-4 border-info' : 'bg-light'}`}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small text-muted fw-bold">{w.date}</span>
                          <span className="fs-3">{w.icon}</span>
                        </div>
                        <h5 className="fw-bold mb-1 text-dark">{w.temp}</h5>
                        <p className="small text-muted mb-2 fw-semibold">{w.condition}</p>
                        
                        <div className="d-flex justify-content-between small text-muted border-top pt-2">
                          <span>💧 Humid: {w.humidity}</span>
                          <span>💨 Wind: {w.wind}</span>
                        </div>

                        {w.warning && (
                          <div className="mt-2.5 p-2 bg-warning-subtle text-warning-emphasis rounded small fw-semibold">
                            ⚠️ {w.warning}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small">No weather predictions available for this destination.</p>
              )}
            </div>
          )}

          {activeTab === 'packing' && (
            <PackingAssistantTab trip={trip} />
          )}

          {activeTab === 'guide' && (
            <TripGuideTab trip={trip} />
          )}

          {activeTab === 'expenses' && (
            <ExpensesTab trip={trip} />
          )}

          {activeTab === 'journal' && (
            <JournalTab trip={trip} />
          )}
        </div>
      </div>

      {/* Disruption Replanner Modal */}
      {showReplanner && (
        <ReplannerModal
          trip={trip}
          onReplanned={handleReplanned}
          onClose={() => setShowReplanner(false)}
        />
      )}
    </div>
  );
};

export default TripDetails;
