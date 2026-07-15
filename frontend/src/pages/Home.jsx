import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlaneDeparture, FaMapMarkedAlt, FaCloudSun, FaRoute, FaClipboardList, FaFileInvoiceDollar } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const destinations = [
    {
      title: "Maharashtra, India",
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80",
      description: "Explore vibrant Mumbai, historic Ajanta & Ellora caves, and the scenic Western Ghats.",
      type: "Indian Heritage"
    },
    {
      title: "Valparai, India",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
      description: "A tranquil hill station surrounded by lush tea estates, waterfalls, and rich wildlife.",
      type: "Indian Nature"
    },
    {
      title: "Ladakh, India",
      image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80",
      description: "Experience majestic high-altitude lakes, ancient monasteries, and cold mountain deserts.",
      type: "Indian Adventure"
    },
    {
      title: "Chikmagalur, India",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
      description: "Walk through mist-covered coffee plantations, scenic valleys, and pristine peak hikes.",
      type: "Indian Hills"
    },
    {
      title: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
      description: "Discover romantic streets, iconic art galleries, and historic architectural landmarks.",
      type: "Abroad City"
    },
    {
      title: "Tokyo, Japan",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
      description: "Immerse in neon-lit streets, ultra-modern tech centers, and historic local shrines.",
      type: "Abroad Tech"
    },
    {
      title: "Swiss Alps, Switzerland",
      image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80",
      description: "Ski down snow-capped alpine peaks, cruise lakes, and visit picturesque villages.",
      type: "Abroad Nature"
    }
  ];

  const features = [
    {
      icon: <FaPlaneDeparture className="text-primary fs-2 mb-3" />,
      title: "AI Trip Planner",
      desc: "Get personalized, budget-conscious, day-by-day itineraries tailored to your specific interests in seconds."
    },
    {
      icon: <FaMapMarkedAlt className="text-info fs-2 mb-3" />,
      title: "Interactive Maps",
      desc: "Navigate effortlessly. Explore recommended local spots, restaurants, ATMs, and hotels near your location."
    },
    {
      icon: <FaCloudSun className="text-warning fs-2 mb-3" />,
      title: "Live Weather & Warnings",
      desc: "Receive real-time 7-day weather forecasts and warnings. Stay prepared for heavy rain, snow, or extreme heat."
    },
    {
      icon: <FaRoute className="text-danger fs-2 mb-3" />,
      title: "Smart Replanner",
      desc: "Flight canceled or heavy rain? The AI companion instantly updates your itinerary with indoor activities and alternative routes."
    },
    {
      icon: <FaClipboardList className="text-success fs-2 mb-3" />,
      title: "Packing Assistant",
      desc: "Never forget a charger or medicine. Generate custom packing checklists based on destination, weather, and length of stay."
    },
    {
      icon: <FaFileInvoiceDollar className="text-secondary fs-2 mb-3" />,
      title: "AI Budget Analyst",
      desc: "Track expenses on the go and receive intelligent suggestions from Gemini on how to optimize spending."
    }
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <header className="hero-overlay d-flex align-items-center">
        <div className="container py-5 text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-4 lh-sm">
                Your Smart <span className="text-gradient-ocean">AI Travel</span> Companion
              </h1>
              <p className="lead text-muted mb-5" style={{ fontSize: '1.15rem', lineHeight: '1.7' }}>
                Go beyond simple itinerary schedules. Experience real-time adaptive routing, weather warnings, smart budget analytics, and curated local guides—all tailored to you.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link to="/register" className="btn btn-primary btn-lg px-4 py-3 text-white">
                  Start Planning Free
                </Link>
                <a href="#features" className="btn btn-outline-secondary btn-lg px-4 py-3">
                  Explore Features
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-5" style={{ background: 'var(--color-section-bg-1)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container py-5">
          <div className="text-center mb-5 max-w-600 mx-auto" style={{ maxWidth: '640px' }}>
            <h2 className="display-5 fw-bold mb-3">More than just an itinerary generator</h2>
            <p className="text-muted lead" style={{ fontSize: '1.05rem' }}>
              TripPilot AI behaves like a veteran traveler sitting right next to you, handling all details so you can focus on the memories.
            </p>
          </div>
          <div className="row g-4">
            {features.map((feature, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="card h-100 p-4 border-0 glass-card">
                  <div className="card-body p-0">
                    <div className="mb-3 d-inline-block">
                      {feature.icon}
                    </div>
                    <h5 className="card-title fw-bold mb-2">{feature.title}</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.6' }}>{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-5 overflow-hidden" style={{ background: 'var(--color-section-bg-2)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-2">Popular Destinations</h2>
            <p className="text-muted">Where will your AI co-pilot take you next? Hover to pause.</p>
          </div>
          
          <div className="marquee-container py-3">
            <div className="marquee-content">
              {[...destinations, ...destinations].map((dest, idx) => (
                <div 
                  className="card border-0 shadow-md rounded-4 overflow-hidden position-relative" 
                  key={idx} 
                  style={{ 
                    width: '350px', 
                    flexShrink: 0, 
                    border: '1px solid var(--color-border)', 
                    background: 'var(--color-card-bg-solid)' 
                  }}
                >
                  <img src={dest.image} className="card-img-top" alt={dest.title} style={{ height: '200px', objectFit: 'cover' }} />
                  <span className="badge position-absolute top-0 end-0 m-3 px-3 py-2 fw-semibold" style={{ background: 'var(--color-card-bg-solid)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}>
                    {dest.type}
                  </span>
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold mb-2">{dest.title}</h5>
                      <p className="card-text text-muted small mb-4" style={{ lineHeight: '1.5', whiteSpace: 'normal' }}>{dest.description}</p>
                    </div>
                    <Link 
                      to={user ? `/plan-trip?destination=${encodeURIComponent(dest.title)}` : "/register"} 
                      className="btn btn-unique-glow w-100 mt-auto"
                    >
                      Plan Trip Here <span className="arrow-icon">➔</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5" style={{ background: 'var(--color-section-bg-1)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-2">How it Works</h2>
            <p className="text-muted">Get your fully optimized trip in 4 easy steps</p>
          </div>
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-4 fw-bold shadow-sm" style={{ width: '56px', height: '56px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)', color: 'var(--color-primary)' }}>
                  1
                </div>
                <h5 className="fw-bold mb-2">Create Account</h5>
                <p className="small text-muted">Sign up in seconds to save your trips and manage budgets.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-4 fw-bold shadow-sm" style={{ width: '56px', height: '56px', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.15)', color: 'var(--color-secondary)' }}>
                  2
                </div>
                <h5 className="fw-bold mb-2">Input Details</h5>
                <p className="small text-muted">Tell us your budget, dates, and what kind of explorer you are.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-4 fw-bold shadow-sm" style={{ width: '56px', height: '56px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  3
                </div>
                <h5 className="fw-bold mb-2">Let AI Optimize</h5>
                <p className="small text-muted">Gemini builds itineraries, check lists, and syncs live weather.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-4 fw-bold shadow-sm" style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
                  4
                </div>
                <h5 className="fw-bold mb-2">Travel & Sync</h5>
                <p className="small text-muted">Track expenses and auto-replanned routes as you explore.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
