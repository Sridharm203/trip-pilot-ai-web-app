import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaBuilding, FaPlaneDeparture, FaTrophy, FaCalendarCheck, FaCameraRetro } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [homeCity, setHomeCity] = useState(user?.profile?.home_city || '');
  const [travelPreference, setTravelPreference] = useState(user?.profile?.travel_preference || 'Solo');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        bio,
        home_city: homeCity,
        travel_preference: travelPreference
      });
      setMessage({ text: "Profile details updated successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: err.message || "Failed to update profile", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const achievements = user?.profile?.badges || [
    { id: "explorer", name: "Global Explorer", description: "Created 3 or more travel itineraries.", icon: "🌍", unlocked: false },
    { id: "budget_master", name: "Budget Master", description: "Log costs and stay under budget.", icon: "💰", unlocked: false },
    { id: "flexible_replanner", name: "Flexible Nomad", description: "Adapt timelines in response to travel disruptions.", icon: "⚡", unlocked: false },
    { id: "memory_maker", name: "Memory Maker", description: "Upload visual journal logs.", icon: "📸", unlocked: false }
  ];

  return (
    <div className="container py-5 animate-fade-in-up">
      <div className="row g-4">
        {/* Left Column: Profile Card & Achievements */}
        <div className="col-lg-4">
          {/* Avatar and bio card */}
          <div className="card border-0 glass-card p-4 text-center mb-4">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '96px', height: '96px', fontSize: '2.5rem' }}>
                {firstName ? firstName[0].toUpperCase() : (user?.username ? user.username[0].toUpperCase() : 'U')}
              </div>
            </div>
            <h4 className="fw-bold mb-1">{user?.first_name || user?.last_name ? `${firstName} ${lastName}` : user?.username}</h4>
            <p className="text-muted small mb-3">{user?.email}</p>
            <span className="badge bg-primary px-3 py-1.5 rounded-pill mb-3" style={{ fontSize: '0.8rem' }}>
              🏆 {user?.profile?.loyalty_points || 0} Loyalty Points
            </span>
            <p className="small text-muted mb-0 fst-italic">
              "{bio || "Write something about your traveling style and experiences..."}"
            </p>
          </div>

          {/* Achievements Card */}
          <div className="card border-0 glass-card p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <FaTrophy className="text-warning" />
              <span>Achievements</span>
            </h5>
            
            <div className="d-grid gap-3">
              {achievements.map((ach, idx) => (
                <div key={idx} className={`d-flex align-items-center justify-content-between p-3 rounded-4 border ${!ach.unlocked ? 'bg-light-subtle opacity-75' : 'bg-light border-success bg-success-subtle'}`}>
                  <div className="d-flex align-items-center col-9">
                    <span className="fs-3 me-3">{ach.icon}</span>
                    <div>
                      <h6 className={`mb-0 fw-bold small ${ach.unlocked ? 'text-success-emphasis' : ''}`}>{ach.name}</h6>
                      <small className="text-muted text-xs d-block" style={{ fontSize: '0.7rem' }}>{ach.description}</small>
                    </div>
                  </div>
                  <span className={`badge ${ach.unlocked ? 'bg-success' : 'bg-secondary'} rounded-pill`} style={{ fontSize: '0.7rem' }}>
                    {ach.unlocked ? 'Earned' : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="col-lg-8">
          <div className="card border-0 glass-card p-4 p-md-5">
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <FaUser className="text-primary" />
              <span>Profile Settings</span>
            </h4>

            {message.text && (
              <div className={`alert alert-${message.type} border-0 small py-2 px-3 mb-4 rounded-3`} role="alert">
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Username (Read-Only)</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={user?.username || ''}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email Address (Read-Only)</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    readOnly
                  />
                </div>
              </div>

              <hr className="my-4" />

              <h5 className="fw-bold mb-4 text-primary">Traveler Persona</h5>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Home City</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <FaBuilding />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g. New York"
                      value={homeCity}
                      onChange={(e) => setHomeCity(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Primary Travel Style</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <FaPlaneDeparture />
                    </span>
                    <select
                      className="form-select border-start-0 ps-0"
                      value={travelPreference}
                      onChange={(e) => setTravelPreference(e.target.value)}
                      disabled={loading}
                    >
                      <option value="Solo">Solo Traveler</option>
                      <option value="Couple">Couple Travel</option>
                      <option value="Friends">Friends Trip</option>
                      <option value="Family">Family Vacation</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Biography</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Describe your travel styles, preferred climates, or bucket list spots..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary px-4 py-2.5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving Changes...
                  </>
                ) : (
                  "Save Profile Changes"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
