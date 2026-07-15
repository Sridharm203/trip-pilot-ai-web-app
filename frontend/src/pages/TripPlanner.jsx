import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { 
  FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, 
  FaUsers, FaHeart, FaHiking, FaUtensils, FaLandmark, 
  FaTree, FaShoppingBag, FaCrown 
} from 'react-icons/fa';

const TripPlanner = () => {
  // Use React hook to redirect users to different pages
  const navigate = useNavigate();
  // Get active currency details from context provider
  const { currency, currencySymbol } = useCurrency();
  // State to track current form step (1 = Destination/Dates, 2 = Budget/Interests)
  const [step, setStep] = useState(1);
  // State to track if the AI itinerary generation API request is running
  const [loading, setLoading] = useState(false);
  // State to hold error messages to show on the screen
  const [error, setError] = useState('');
  
  // State to show rotating helpful messages on screen while AI loads
  const [loadingMessage, setLoadingMessage] = useState("Consulting local maps...");
  const loaderMessages = [
    "Consulting local maps...",
    "Summoning your AI Co-Pilot...",
    "Scouting top-rated dining spots...",
    "Curating custom daily itineraries...",
    "Filtering local weather patterns...",
    "Matching hotel recommendations...",
    "Structuring travel tips..."
  ];

  // Rotate helpful loading status messages every 2.5 seconds when loading is true
  useEffect(() => {
    let interval;
    if (loading) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loaderMessages.length;
        setLoadingMessage(loaderMessages[index]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Read destination keyword from URL params if present, default to empty string
  const [destination, setDestination] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('destination') || '';
  });
  // State to store trip start date
  const [startDate, setStartDate] = useState('');
  // State to store trip end date
  const [endDate, setEndDate] = useState('');
  // State to store budget amount (defaults to 1500)
  const [budget, setBudget] = useState('1500');
  // State to store number of travelers
  const [numTravelers, setNumTravelers] = useState(1);
  // State to store travel style choice (Solo, Couple, Family, Friends)
  const [travelType, setTravelType] = useState('Solo');
  // State to store array of selected interest IDs
  const [selectedInterests, setSelectedInterests] = useState([]);

  // List of interests with icons to show as toggle cards on step 2
  const interestsList = [
    { id: 'Adventure', name: 'Adventure', icon: <FaHiking /> },
    { id: 'Food', name: 'Food & Dining', icon: <FaUtensils /> },
    { id: 'History', name: 'History & Culture', icon: <FaLandmark /> },
    { id: 'Nature', name: 'Nature & Outdoors', icon: <FaTree /> },
    { id: 'Shopping', name: 'Shopping', icon: <FaShoppingBag /> },
    { id: 'Luxury', name: 'Luxury', icon: <FaCrown /> }
  ];

  // Toggle interest selection by adding or removing it from the selected state array
  const handleInterestToggle = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(item => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  // Helper function to auto-fill form inputs with sample mock options
  const handleAutofill = (dest, startOffset, duration, budgetVal, travelers, type, interests) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + startOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + duration);

    setDestination(dest);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    
    let finalBudget = budgetVal;
    if (currency === 'INR') {
      finalBudget = (parseFloat(budgetVal) * 83).toString();
    }
    setBudget(finalBudget);
    
    setNumTravelers(travelers);
    setTravelType(type);
    setSelectedInterests(interests);
  };

  // Validate step 1 fields before transitioning user to step 2 panel
  const handleNext = () => {
    if (step === 1 && (!destination || !startDate || !endDate)) {
      setError("Please fill out your destination and dates.");
      return;
    }
    setError('');
    setStep(step + 1);
  };

  // Go back to the previous step in the form wizard
  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  // Handle final form submit to post trip options and trigger the backend generator
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const numericBudget = parseFloat(budget);
    const usdBudget = currency === 'INR' ? numericBudget / 83 : numericBudget;

    const tripData = {
      destination,
      budget: usdBudget,
      start_date: startDate,
      end_date: endDate,
      num_travelers: parseInt(numTravelers),
      travel_type: travelType,
      interests: selectedInterests
    };

    try {
      // Send form data to backend django REST API and await the generated trip record
      const response = await api.post('trips/', tripData);
      // Navigate to the newly generated trip details page using its returned DB ID
      navigate(`/trips/${response.data.id}`);
    } catch (err) {
      console.error(err);
      let errorMsg = "Failed to generate itinerary. Please try again.";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          const errorsList = [];
          for (const key in data) {
            const msgs = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
            if (key === 'non_field_errors' || key === 'detail') {
              errorsList.push(msgs);
            } else {
              const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
              errorsList.push(`${fieldName}: ${msgs}`);
            }
          }
          if (errorsList.length > 0) {
            errorMsg = errorsList.join(' | ');
          }
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
        <div className="card glass-card p-5 text-center w-100" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            <div className="spinner-grow text-info" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <h3 className="fw-bold mb-2">Generating Your Trip</h3>
          <p className="text-gradient-ocean fw-semibold fs-5 animate-pulse mb-3">{loadingMessage}</p>
          <p className="text-muted small">Please wait, this will take about 10-15 seconds as Gemini structures your day-wise plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="max-w-600 mx-auto" style={{ maxWidth: '640px' }}>
        {/* Progress indicator */}
        <div className="d-flex align-items-center justify-content-between mb-4 px-2">
          <span className={`badge ${step >= 1 ? 'bg-primary' : 'bg-secondary'} rounded-pill px-3 py-2`}>1. Destination</span>
          <div className="flex-grow-1 border-top mx-2" style={{ borderColor: '#cbd5e1' }}></div>
          <span className={`badge ${step >= 2 ? 'bg-primary' : 'bg-secondary'} rounded-pill px-3 py-2`}>2. Style & Budget</span>
          <div className="flex-grow-1 border-top mx-2" style={{ borderColor: '#cbd5e1' }}></div>
          <span className={`badge ${step >= 3 ? 'bg-primary' : 'bg-secondary'} rounded-pill px-3 py-2`}>3. Interests</span>
        </div>

        {error && (
          <div className="alert alert-danger border-0 py-2.5 px-4 rounded-3 small mb-4" role="alert">
            {error}
          </div>
        )}

        <div className="card glass-card p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">AI Trip Planner</h2>
            <p className="text-muted small">Input parameters to build your premium customized itinerary</p>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="animate-fade-in-up">
                <div className="mb-3.5 p-3 rounded-4 bg-light border">
                  <label className="form-label small fw-bold text-dark mb-2">First Time? Try Quick Autofill</label>
                  <div className="d-flex flex-wrap gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleAutofill("Kyoto, Japan", 14, 5, "2500", 2, "Couple", ["Food", "History", "Nature"])}
                      className="btn btn-outline-primary btn-sm py-1.5 px-3 rounded-pill text-xs d-flex align-items-center gap-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Kyoto (5 Days, Couple)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleAutofill("Paris, France", 30, 4, "1800", 1, "Solo", ["History", "Luxury"])}
                      className="btn btn-outline-primary btn-sm py-1.5 px-3 rounded-pill text-xs d-flex align-items-center gap-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Paris (4 Days, Solo)
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Where do you want to go?</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <FaMapMarkerAlt />
                    </span>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Kyoto, Japan or Paris, France"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold">Start Date</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">
                        <FaCalendarAlt />
                      </span>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold">End Date</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">
                        <FaCalendarAlt />
                      </span>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary w-100 py-2.5 mt-2" 
                  onClick={handleNext}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in-up">
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold">Total Budget ({currencySymbol})</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted fw-bold">
                        {currencySymbol}
                      </span>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="e.g. 2000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold">Number of Travelers</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">
                        <FaUsers />
                      </span>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={numTravelers}
                        onChange={(e) => setNumTravelers(e.target.value)}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Traveler Persona</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <FaHeart />
                    </span>
                    <select 
                      className="form-select" 
                      value={travelType}
                      onChange={(e) => setTravelType(e.target.value)}
                    >
                      <option value="Solo">Solo Explorer</option>
                      <option value="Couple">Couple Getaway</option>
                      <option value="Friends">Friends Trip</option>
                      <option value="Family">Family Vacation</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <button type="button" className="btn btn-outline-secondary w-100 py-2.5" onClick={handleBack}>
                      Back
                    </button>
                  </div>
                  <div className="col-6">
                    <button type="button" className="btn btn-primary w-100 py-2.5" onClick={handleNext}>
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in-up">
                <label className="form-label small fw-semibold mb-3">Select Interests (Check all that apply)</label>
                <div className="row g-3 mb-4">
                  {interestsList.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    return (
                      <div className="col-6" key={interest.id}>
                        <div 
                          className={`card p-3 text-center border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary-subtle text-primary' : 'border-light bg-light text-dark'}`}
                          onClick={() => handleInterestToggle(interest.id)}
                          style={{ cursor: 'pointer', borderRadius: '12px' }}
                        >
                          <div className="fs-3 mb-2">{interest.icon}</div>
                          <span className="fw-semibold small">{interest.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <button type="button" className="btn btn-outline-secondary w-100 py-2.5" onClick={handleBack}>
                      Back
                    </button>
                  </div>
                  <div className="col-6">
                    <button type="submit" className="btn btn-secondary w-100 py-2.5 text-white">
                      Generate Trip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
