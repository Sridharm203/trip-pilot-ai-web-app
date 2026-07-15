import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { 
  FaCalendarAlt, FaDollarSign, FaUsers, FaCompass, FaChevronLeft,
  FaCopy, FaShareAlt, FaTrashAlt, FaHotel, FaUtensils, 
  FaBus, FaCameraRetro, FaCloudSun, FaExclamationTriangle,
  FaBriefcase, FaComments, FaExclamationCircle, FaBook, FaPlane, FaClock,
  FaStar, FaSun, FaCloud, FaCloudShowersHeavy, FaBolt, FaSnowflake, FaWind, FaTint
} from 'react-icons/fa';
import TripMap from '../components/TripMap';
import PackingAssistantTab from '../components/PackingAssistantTab';
import TripGuideTab from '../components/TripGuideTab';
import ReplannerModal from '../components/ReplannerModal';
import ExpensesTab from '../components/ExpensesTab';
import JournalTab from '../components/JournalTab';

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80'
];

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
];

const SIGHT_IMAGES = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
];

const WEATHER_IMAGES = [
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1472214222541-d510753a8707?auto=format&fit=crop&w=800&q=80'
];

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  
  const [trip, setTrip] = useState(null);
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showReplanner, setShowReplanner] = useState(false);

  const sanitizeTripData = (tripData) => {
    if (!tripData) return null;
    const cloned = { ...tripData };
    if (cloned.itinerary) {
      const seenDays = new Set();
      cloned.itinerary = cloned.itinerary.filter(d => {
        if (seenDays.has(d.day)) return false;
        seenDays.add(d.day);
        return true;
      });
    }
    return cloned;
  };

  const formatCost = (costStr) => {
    if (!costStr) return '';
    const cleanCost = costStr.trim();
    if (cleanCost.toLowerCase() === 'free') return 'Free';
    if (cleanCost.toLowerCase() === 'varies') return 'Varies';
    
    // Convert and format USD amount to active currency symbol
    if (cleanCost.startsWith('$')) {
      const val = parseFloat(cleanCost.substring(1));
      if (!isNaN(val)) {
        return formatAmount(val);
      }
    }
    return cleanCost;
  };

  const getWeatherIcon = (emojiOrCond) => {
    const term = (emojiOrCond || '').toLowerCase();
    if (term.includes('🌧️') || term.includes('rain')) {
      return <FaCloudShowersHeavy className="text-info" />;
    }
    if (term.includes('⛈️') || term.includes('storm')) {
      return <FaBolt className="text-warning" />;
    }
    if (term.includes('☁️') || term.includes('cloudy') || term.includes('cloud')) {
      return <FaCloud className="text-secondary" />;
    }
    if (term.includes('❄️') || term.includes('snow')) {
      return <FaSnowflake className="text-info" />;
    }
    if (term.includes('☀️') || term.includes('sunny') || term.includes('clear')) {
      return <FaSun className="text-warning" />;
    }
    if (term.includes('💨') || term.includes('wind') || term.includes('windy')) {
      return <FaWind className="text-secondary" />;
    }
    // Default fallback
    return <FaCloudSun className="text-secondary" />;
  };

  // Fetch Trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await api.get(`trips/${id}/`);
        setTrip(sanitizeTripData(response.data));
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


  const handleReplanned = (updatedTrip) => {
    setTrip(sanitizeTripData(updatedTrip));
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
  const activeDayPlan = trip.itinerary?.find(d => Number(d.day) === Number(selectedDay)) || trip.itinerary?.[0] || null;

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
            <span className="badge bg-info text-dark px-3 py-1.5 rounded-pill fw-bold mb-3 d-inline-flex align-items-center gap-1.5">
              <FaPlane style={{ transform: 'rotate(-45deg)', fontSize: '0.85rem' }} /> AI CO-PILOT ACTIVE
            </span>
            <h1 className="display-4 fw-bold text-white mb-2">{trip.destination}</h1>
            <p className="lead mb-0 text-white-50 d-flex align-items-center gap-2">
              <FaCalendarAlt /> {trip.start_date} to {trip.end_date}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
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
              {formatAmount(trip.budget)}
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
                {Array.from(new Set(trip.itinerary?.map(d => d.day))).map((dayNum) => (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`btn btn-sm px-3.5 py-2 rounded-pill fw-semibold ${Number(selectedDay) === Number(dayNum) ? 'btn-primary' : 'btn-outline-secondary'}`}
                  >
                    Day {dayNum}
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
                <div className="position-relative ms-2 ps-4 border-start border-2 border-primary-subtle pb-3">
                  <h5 className="fw-bold mb-1 text-primary">Day {activeDayPlan.day}</h5>
                  <h6 className="text-muted fw-semibold mb-4">{activeDayPlan.theme}</h6>
                  
                  <div className="row g-3">
                    {activeDayPlan.activities?.map((act, aIdx) => (
                      <div className="col-12" key={aIdx}>
                        <div className="card bg-light border-0 p-3.5 rounded-4 shadow-sm hover-lift">
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-2">
                            <span className="badge bg-secondary-subtle text-secondary fw-bold rounded-pill px-3 d-inline-flex align-items-center gap-1">
                              <FaClock style={{ fontSize: '0.75rem' }} /> {act.time}
                            </span>
                            <span className="badge bg-success-subtle text-success fw-bold d-inline-flex align-items-center gap-1">
                              <span>{formatCost(act.cost)}</span>
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
                    <div className="card h-100 border-light bg-light rounded-4 shadow-sm hover-lift overflow-hidden">
                      <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                        <img 
                          src={HOTEL_IMAGES[idx % HOTEL_IMAGES.length]} 
                          alt={hotel.name} 
                          className="w-100 h-100 object-fit-cover animate-fade-in"
                        />
                        <span className="position-absolute top-3 end-3 badge bg-warning text-dark fw-bold d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm">
                          <FaStar style={{ fontSize: '0.85rem' }} />
                          <span>{hotel.rating}</span>
                        </span>
                      </div>
                      <div className="card-body p-4">
                        <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                          <FaHotel className="text-primary" /> {hotel.name}
                        </h5>
                        <p className="small text-muted mb-0">{hotel.description}</p>
                        <div className="bg-white p-3 rounded-3 border-start border-4 border-primary mt-3">
                          <small className="fw-semibold d-block text-primary mb-1">AI Recommendation:</small>
                          <p className="small text-muted mb-0">{hotel.why_recommend}</p>
                        </div>
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
                    <div className="card h-100 border-light bg-light rounded-4 shadow-sm hover-lift overflow-hidden">
                      <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                        <img 
                          src={RESTAURANT_IMAGES[idx % RESTAURANT_IMAGES.length]} 
                          alt={rest.name} 
                          className="w-100 h-100 object-fit-cover animate-fade-in"
                        />
                        <span className="position-absolute top-3 end-3 badge bg-secondary text-white fw-bold px-3 py-1.5 shadow-sm">
                          {rest.cuisine}
                        </span>
                      </div>
                      <div className="card-body p-4">
                        <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                          <FaUtensils className="text-secondary" /> {rest.name}
                        </h5>
                        <p className="small text-muted mb-0">{rest.description}</p>
                        <div className="bg-white p-3 rounded-3 border-start border-4 border-secondary mt-3">
                          <small className="fw-semibold d-block text-secondary mb-1">AI Recommendation:</small>
                          <p className="small text-muted mb-0">{rest.why_recommend}</p>
                        </div>
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
                      <div className="list-group-item bg-light border-0 p-3 rounded-4 shadow-sm d-flex gap-3 align-items-center animate-fade-in" key={idx}>
                        <div className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-3" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                          <FaBus style={{ fontSize: '1.2rem' }} />
                        </div>
                        <div>
                          <h6 className="fw-bold text-primary mb-1">{trans.type}</h6>
                          <p className="small text-muted mb-1">{trans.description}</p>
                          <small className="fw-bold text-success">Cost Estimate: {trans.cost_estimate}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-6">
                  <h4 className="fw-bold mb-4">Top Tourist Sights</h4>
                  <div className="list-group gap-3">
                    {trip.things_to_do?.map((sight, idx) => (
                      <div className="list-group-item bg-light border-0 p-3 rounded-4 shadow-sm d-flex gap-3 align-items-center animate-fade-in" key={idx}>
                        <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                          <img 
                            src={SIGHT_IMAGES[idx % SIGHT_IMAGES.length]} 
                            alt={sight.title} 
                            className="w-100 h-100 object-fit-cover animate-fade-in"
                          />
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                            <FaCameraRetro className="text-info" /> {sight.title}
                          </h6>
                          <p className="small text-muted mb-0">{sight.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="animate-fade-in-up">
              <div className="card border-0 rounded-4 overflow-hidden mb-4 shadow-sm" style={{ height: '180px', position: 'relative' }}>
                <img 
                  src={WEATHER_IMAGES[0]} 
                  alt="Weather Destination" 
                  className="w-100 h-100 object-fit-cover"
                />
                <div className="position-absolute bottom-0 start-0 w-100 p-4 bg-dark bg-opacity-50 text-white d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-0 text-white">Weather Outlook for {trip.destination}</h5>
                    <p className="small mb-0 text-white-50">Local forecast details for the next 7 days</p>
                  </div>
                </div>
              </div>
              <h4 className="fw-bold mb-4">7-Day Weather Forecast</h4>
              {weather.length > 0 ? (
                <div className="row g-3">
                  {weather.map((w, idx) => (
                    <div className="col-md-4 col-sm-6" key={idx}>
                      <div className={`card h-100 p-4 border rounded-4 shadow-sm hover-lift ${w.warning ? 'bg-warning-subtle border-start border-4 border-warning' : 'bg-white border-light'}`}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="small text-muted fw-bold">{w.date}</span>
                          <span className="fs-4 d-inline-flex align-items-center">{getWeatherIcon(w.icon || w.condition)}</span>
                        </div>
                        <h5 className="fw-bold mb-1 text-dark">{w.temp}</h5>
                        <p className="small text-muted mb-2 fw-semibold">{w.condition}</p>
                        
                        <div className="d-flex justify-content-between small text-muted border-top pt-2">
                          <span className="d-inline-flex align-items-center gap-1">
                            <FaTint className="text-info" style={{ fontSize: '0.8rem' }} /> Humid: {w.humidity}
                          </span>
                          <span className="d-inline-flex align-items-center gap-1">
                            <FaWind className="text-secondary" style={{ fontSize: '0.8rem' }} /> Wind: {w.wind}
                          </span>
                        </div>
 
                        {w.warning && (
                          <div className="mt-3 small fw-semibold text-warning-emphasis d-flex align-items-start gap-1.5">
                            <FaExclamationTriangle className="text-warning mt-0.5 flex-shrink-0" style={{ fontSize: '0.85rem' }} />
                            <span>{w.warning}</span>
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
