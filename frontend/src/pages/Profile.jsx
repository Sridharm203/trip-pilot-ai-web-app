import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  
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
        bio
      });
      setMessage({ text: "Profile details updated successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: err.message || "Failed to update profile", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 animate-fade-in-up">
      <div className="max-w-800 mx-auto" style={{ maxWidth: '800px' }}>
        <div className="card border-0 glass-card p-4 p-md-5">
          
          {/* Profile Header & Avatar section */}
          <div className="text-center mb-5">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm mx-auto" style={{ width: '96px', height: '96px', fontSize: '2.5rem' }}>
                {firstName ? firstName[0].toUpperCase() : (user?.username ? user.username[0].toUpperCase() : 'U')}
              </div>
            </div>
            <h3 className="fw-bold mb-1">
              {firstName || lastName ? `${firstName} ${lastName}` : user?.username}
            </h3>
            <p className="text-muted small mb-0">{user?.email}</p>
          </div>

          <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 border-bottom pb-3">
            <FaUser className="text-primary" />
            <span>Profile Details</span>
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

            <div className="text-end">
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
