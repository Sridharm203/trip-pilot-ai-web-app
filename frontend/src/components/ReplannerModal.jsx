import React, { useState } from 'react';
import { FaCloudRain, FaRegTimesCircle, FaBan, FaDollarSign, FaBolt } from 'react-icons/fa';
import api from '../services/api';

const ReplannerModal = ({ trip, onReplanned, onClose }) => {
  const [disruptionType, setDisruptionType] = useState('heavy_rain');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(`trips/${trip.id}/replan/`, {
        disruption_type: disruptionType,
        details: details
      });
      // Fire success callback to update parent state details
      onReplanned(response.data);
      alert("Itinerary and budget adapted successfully by your AI Co-Pilot!");
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to adapt itinerary. Try again later.");
      setLoading(false);
    }
  };

  const getPresetDescription = () => {
    switch (disruptionType) {
      case 'heavy_rain':
        return "Adapts the schedule for rain. Swaps outdoor walking tours, parks, and high vistas with museums, indoor centers, and warm bistros.";
      case 'budget_exceeded':
        return "Slashes itinerary costs. Replaces expensive ticketed spots or premium restaurants with free/low-cost local attractions.";
      case 'place_closed':
        return "Replaces a closed spot. Swap the closed attraction (name it in the details field below) with a highly rated alternative sight nearby.";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="modal d-block fade show" style={{ background: 'rgba(15,23,42,0.85)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content glass-card p-5 text-center text-white border-0 bg-transparent">
            <div className="mb-4">
              <div className="spinner-border text-info" role="status" style={{ width: '3.5rem', height: '3.5rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h4 className="fw-bold mb-2">AI Co-Pilot Replanning</h4>
            <p className="text-info fw-semibold mb-3">Adjusting routes, spots, and budget values...</p>
            <p className="small text-muted mb-0">Please wait. Gemini is currently updating your timeline in the database.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="modal d-block fade show" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content glass-card border-0 p-4">
            <div className="modal-header border-0 pb-0 justify-content-between align-items-center">
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                <FaBolt className="text-warning animate-pulse" />
                <span>Travel Disruption Assistant</span>
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body py-4">
              {error && (
                <div className="alert alert-danger border-0 small py-2 px-3 mb-3 rounded-3" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Report Disruption Type</label>
                  <select 
                    className="form-select"
                    value={disruptionType}
                    onChange={(e) => {
                      setDisruptionType(e.target.value);
                      setDetails('');
                    }}
                  >
                    <option value="heavy_rain">🌧️ Heavy Rain / Storm</option>
                    <option value="budget_exceeded">💰 Over Budget Limit</option>
                    <option value="place_closed">🚫 Attraction Closed</option>
                  </select>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3 small border-start border-4 border-info">
                  <p className="mb-0 text-muted">{getPresetDescription()}</p>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">
                    {disruptionType === 'place_closed' 
                      ? "Name of Closed Attraction (Required)" 
                      : disruptionType === 'budget_exceeded'
                      ? "How much did you overspend? (Optional)"
                      : "Additional Details (Optional)"
                    }
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={disruptionType === 'place_closed' ? "e.g. Eiffel Tower or Louvre Museum" : "e.g. Overspent $150 on shopping"}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required={disruptionType === 'place_closed'}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary w-100">
                    Adapt Itinerary
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
    </>
  );
};

export default ReplannerModal;
