import React, { useState } from 'react';
import { FaImage, FaPlus, FaBook, FaPrint, FaRegWindowClose, FaCameraRetro, FaPenNib } from 'react-icons/fa';
import api from '../services/api';

const JournalTab = ({ trip, readOnly = false }) => {
  const [journals, setJournals] = useState(trip.journals || []);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Print targets
  const [printTarget, setPrintTarget] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddMoment = async (e) => {
    e.preventDefault();
    if (!title.trim() || uploading) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      // POST form data (multipart file uploads)
      const response = await api.post(`trips/${trip.id}/journal/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Append new entry at the top of the feed
      setJournals([response.data, ...journals]);
      setTitle('');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save journal moment. Ensure image format is valid.");
    } finally {
      setUploading(false);
    }
  };

  const triggerPrint = (entry) => {
    setPrintTarget(entry);
    setTimeout(() => {
      window.print();
      setPrintTarget(null);
    }, 500);
  };

  return (
    <div className="animate-fade-in-up">
      <h4 className="fw-bold mb-1">Travel Journal</h4>
      <p className="text-muted small mb-4">Upload snapshots of your trip; Gemini will write creative stories and captions for your memories</p>

      {/* Grid containing form and journal items */}
      <div className="row g-4">
        {/* Upload Column */}
        {!readOnly && (
          <div className="col-lg-4 col-md-5">
            <div className="card border-0 glass-card p-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <FaCameraRetro className="text-primary" />
                <span>Capture Moment</span>
              </h6>

              <form onSubmit={handleAddMoment}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Heading / Title</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Morning coffee in Venice"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={uploading}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Upload Photo</label>
                  <div 
                    className="border rounded-4 p-4 text-center cursor-pointer bg-white transition-all hover-bg-light"
                    style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                    onClick={() => document.getElementById('journal-file-input').click()}
                  >
                    <input 
                      type="file" 
                      id="journal-file-input"
                      className="d-none"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="img-fluid rounded-3 mb-2" 
                        style={{ maxHeight: '140px', objectFit: 'cover' }} 
                      />
                    ) : (
                      <>
                        <FaImage className="fs-1 text-muted mb-2" style={{ opacity: 0.5 }} />
                        <p className="small text-muted mb-0">Click to select photo</p>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2"
                  disabled={uploading || !title.trim()}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      AI story writing...
                    </>
                  ) : (
                    "Create Journal Entry"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Entries Column */}
        <div className={readOnly ? "col-12" : "col-lg-8 col-md-7"}>
          {journals.length > 0 ? (
            <div className="d-flex flex-column gap-4">
              {journals.map((entry) => (
                <div key={entry.id} className="card border-0 glass-card overflow-hidden shadow-sm hover-lift">
                  <div className="row g-0">
                    {entry.image_url && (
                      <div className="col-md-5 position-relative bg-dark" style={{ minHeight: '220px' }}>
                        <img 
                          src={entry.image_url} 
                          alt={entry.title} 
                          className="w-100 h-100" 
                          style={{ objectFit: 'cover', position: 'absolute' }}
                        />
                        {entry.caption && (
                          <div className="position-absolute bottom-0 start-0 end-0 p-3 text-white small" style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)' }}>
                            <p className="mb-0 italic fw-semibold">“ {entry.caption} ”</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className={entry.image_url ? 'col-md-7' : 'col-12'}>
                      <div className="p-4 d-flex flex-column h-100">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <div>
                            <h5 className="fw-bold text-dark mb-1">{entry.title}</h5>
                            <small className="text-muted">{new Date(entry.created_at).toLocaleDateString()}</small>
                          </div>
                          <button 
                            onClick={() => triggerPrint(entry)}
                            className="btn btn-outline-secondary btn-sm p-1.5"
                            title="Export PDF / Print"
                          >
                            <FaPrint />
                          </button>
                        </div>
                        <p className="small text-muted flex-grow-1 mb-3" style={{ lineHeight: '1.6' }}>
                          {entry.content}
                        </p>
                        {entry.summary && (
                          <div className="border-top pt-2.5 mt-auto">
                            <span className="small text-primary-emphasis fw-bold d-flex align-items-center gap-1">
                              <FaPenNib className="small text-primary" />
                              <span>Memory: {entry.summary}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 glass-card bg-light rounded-4">
              <FaBook className="fs-1 text-muted mb-3" style={{ opacity: 0.3 }} />
              <p className="text-muted fw-semibold">Your Journal is empty</p>
              <p className="text-muted small">Log moments, coffee trips, or flights with pictures to fill your memories catalog.</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Print Container for Isolated PDF Printing */}
      {printTarget && (
        <div id="print-section" className="d-none d-print-block p-5" style={{ color: '#0f172a', fontFamily: 'sans-serif' }}>
          <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0' }}>TripPilot AI Journal Log</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Destination: {trip.destination} | Logged: {new Date(printTarget.created_at).toLocaleDateString()}</p>
          </div>

          <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
            {printTarget.image_url && (
              <div style={{ flex: '0 0 40%', height: '280px' }}>
                <img 
                  src={printTarget.image_url} 
                  alt={printTarget.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                />
              </div>
            )}
            <div style={{ flex: '1' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 15px 0' }}>{printTarget.title}</h2>
              <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.7', margin: 0 }}>
                {printTarget.content}
              </p>
              {printTarget.caption && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderLeft: '4px solid #0ea5e9', borderRadius: '4px', fontStyle: 'italic' }}>
                  "{printTarget.caption}"
                </div>
              )}
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
            Generated with TripPilot AI — Your Intelligent AI Travel Companion.
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalTab;
