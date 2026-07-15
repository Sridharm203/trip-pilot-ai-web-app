import React, { useState } from 'react';
import { FaCompass, FaChevronRight, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import api from '../services/api';
import axios from 'axios';

const TripGuideTab = ({ trip }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am your AI Local Guide for **${trip.destination}**. Ask me about cafes, hidden landmarks, safety support, or cheap dining spots! Select a preset below or type a query.`
    }
  ]);
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const presets = [
    { label: "Best cafes nearby", query: "Best cafes nearby" },
    { label: "Hidden places", query: "Hidden places and scenic viewpoints" },
    { label: "Cheap restaurants", query: "Cheap restaurants and local food stalls" },
    { label: "Best sunset point", query: "Best sunset point" },
    { label: "Nearby hospitals", query: "Nearby hospitals and pharmacy details" }
  ];

  const handleAskGuide = async (queryText) => {
    if (!queryText.trim() || loading) return;

    // Append user query to chat log
    const updatedMessages = [...messages, { role: 'user', text: queryText }];
    setMessages(updatedMessages);
    setCustomQuery('');
    setLoading(true);

    try {
      let response;
      const token = localStorage.getItem('token');
      if (token) {
        response = await api.post(`trips/${trip.id}/ask-guide/`, {
          query: queryText,
        });
      } else {
        response = await axios.post(`http://127.0.0.1:8000/api/trips/${trip.id}/ask-guide/`, {
          query: queryText,
        });
      }

      // Append AI response
      setMessages([...updatedMessages, { role: 'assistant', text: response.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', text: "Sorry, I encountered an issue querying the local guidebook database. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h4 className="fw-bold mb-1">AI Local Guide</h4>
      <p className="text-muted small mb-4">Chat with your AI companion for localized suggestions and emergency details</p>

      <div className="row g-4">
        {/* Presets and Chat layout */}
        <div className="col-lg-4 col-md-5">
          <div className="card bg-light border-0 p-4 rounded-4 shadow-sm h-100">
            <h6 className="fw-bold text-dark mb-3">Quick Queries</h6>
            <div className="d-grid gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskGuide(preset.query)}
                  className="btn btn-outline-custom text-start d-flex align-items-center justify-content-between p-3"
                  style={{ fontSize: '0.85rem' }}
                  disabled={loading}
                >
                  <span>{preset.label}</span>
                  <FaChevronRight className="small text-muted" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8 col-md-7">
          <div className="card border-0 glass-card p-4 d-flex flex-column" style={{ minHeight: '420px', maxHeight: '500px' }}>
            {/* Messages box */}
            <div className="flex-grow-1 overflow-auto mb-3 pe-2" style={{ maxHeight: '380px' }}>
              {messages.map((msg, idx) => {
                const isAI = msg.role === 'assistant';
                return (
                  <div key={idx} className={`d-flex gap-3 mb-4 ${isAI ? '' : 'flex-row-reverse'}`}>
                    <div 
                      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white ${isAI ? 'bg-info' : 'bg-primary'}`}
                      style={{ width: '36px', height: '36px' }}
                    >
                      {isAI ? <FaRobot /> : <FaUser />}
                    </div>
                    <div 
                      className={`p-3 rounded-4 small ${isAI ? 'bg-light text-dark' : 'bg-primary text-white'}`}
                      style={{ maxWidth: '80%', whiteSpace: 'pre-wrap' }}
                    >
                      {/* Render markdown style lines */}
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Check headers
                        if (line.startsWith('###')) {
                          return <h6 className="fw-bold mt-2" key={lIdx}>{line.replace('###', '')}</h6>;
                        }
                        // Check bullets
                        if (line.startsWith('-')) {
                          return <li className="ms-3 mb-1" key={lIdx}>{line.replace('-', '').trim()}</li>;
                        }
                        return <p className="mb-2" key={lIdx}>{line}</p>;
                      })}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="d-flex gap-3 mb-4">
                  <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                    <FaRobot />
                  </div>
                  <div className="bg-light p-3 rounded-4 small">
                    <span className="spinner-grow spinner-grow-sm me-2 text-info" role="status" aria-hidden="true"></span>
                    Guide is writing tips...
                  </div>
                </div>
              )}
            </div>

            {/* Custom Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAskGuide(customQuery);
              }}
              className="input-group border rounded-3 overflow-hidden bg-white mt-auto"
            >
              <input
                type="text"
                className="form-control border-0 px-3"
                placeholder="Ask about cheap pizza, local events, eSIM..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                disabled={loading}
                style={{ fontSize: '0.9rem' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary border-0 rounded-0 px-4"
                disabled={loading || !customQuery.trim()}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripGuideTab;
