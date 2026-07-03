import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlaneDeparture, FaMapMarkedAlt, FaCloudSun, FaRoute, FaClipboardList, FaFileInvoiceDollar } from 'react-icons/fa';

const Home = () => {
  const destinations = [
    {
      title: "Kyoto, Japan",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
      description: "Explore serene temples, pristine bamboo forests, and traditional tea houses.",
      type: "Cultural"
    },
    {
      title: "Amalfi Coast, Italy",
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
      description: "Stunning coastal cliffs, colorful cliffside villages, and azure waters.",
      type: "Coastal"
    },
    {
      title: "Reykjavik, Iceland",
      image: "https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=600&q=80",
      description: "Witness dancing Northern Lights, volcanic geysers, and geothermal spas.",
      type: "Adventure"
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
        <div className="container py-5 text-center text-lg-start">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-info text-dark px-3 py-2 rounded-pill fw-bold mb-3">
                MEET YOUR NEW CO-PILOT
              </span>
              <h1 className="display-3 fw-bold text-white mb-4 lh-sm">
                Your Smart <span className="text-info">AI Travel</span> Companion
              </h1>
              <p className="lead text-white-50 mb-5">
                Go beyond simple itinerary schedules. Experience real-time adaptive routing, weather warnings, smart budget analytics, and curated local guides—all tailored to you.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                <Link to="/register" className="btn btn-primary btn-lg px-4 py-3 text-white">
                  Start Planning Free
                </Link>
                <a href="#features" className="btn btn-outline-light btn-lg px-4 py-3">
                  Explore Features
                </a>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="position-relative">
                <img 
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80" 
                  alt="Scenic Travel View" 
                  className="img-fluid rounded-4 shadow-lg border border-secondary"
                  style={{ transform: 'rotate(1deg)' }}
                />
                <div className="glass-card position-absolute bottom-0 start-0 p-4 m-3 text-dark d-flex align-items-center gap-3" style={{ maxWidth: '320px', background: 'rgba(255,255,255,0.9)' }}>
                  <div className="bg-info text-white p-3 rounded-3 fs-3 d-flex align-items-center justify-content-center">
                    ☀️
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">Amalfi Coast, 24°C</h6>
                    <small className="text-muted">Perfect beach day scheduled by AI</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5 max-w-600 mx-auto">
            <h2 className="display-5 fw-bold text-gradient-ocean mb-3">More than just an itinerary generator</h2>
            <p className="text-muted lead">
              TripPilot AI behaves like a veteran traveler sitting right next to you, handling all details so you can focus on the memories.
            </p>
          </div>
          <div className="row g-4">
            {features.map((feature, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="card h-100 p-4 border-0 glass-card">
                  <div className="card-body p-0">
                    {feature.icon}
                    <h5 className="card-title fw-bold mb-2">{feature.title}</h5>
                    <p className="card-text text-muted small">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-gradient-aurora">Popular Destinations</h2>
            <p className="text-muted">Where will your AI co-pilot take you next?</p>
          </div>
          <div className="row g-4">
            {destinations.map((dest, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift">
                  <img src={dest.image} className="card-img-top" alt={dest.title} style={{ height: '240px', objectFit: 'cover' }} />
                  <span className="badge bg-dark text-white position-absolute top-0 end-0 m-3 px-3 py-2 fw-semibold">
                    {dest.type}
                  </span>
                  <div className="card-body p-4 bg-white">
                    <h5 className="card-title fw-bold">{dest.title}</h5>
                    <p className="card-text text-muted small">{dest.description}</p>
                    <Link to="/register" className="btn btn-outline-custom w-100 btn-sm mt-2">
                      Plan Trip Here
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5 bg-white border-top">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">How it Works</h2>
            <p className="text-muted">Get your fully optimized trip in 4 easy steps</p>
          </div>
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="p-3">
                <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-3 fw-bold shadow-sm" style={{ width: '64px', height: '64px' }}>
                  1
                </div>
                <h5 className="fw-bold">Create Account</h5>
                <p className="small text-muted">Sign up in seconds to save your trips and manage budgets.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="bg-light text-info rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-3 fw-bold shadow-sm" style={{ width: '64px', height: '64px' }}>
                  2
                </div>
                <h5 className="fw-bold">Input Details</h5>
                <p className="small text-muted">Tell us your budget, dates, and what kind of explorer you are.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="bg-light text-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-3 fw-bold shadow-sm" style={{ width: '64px', height: '64px' }}>
                  3
                </div>
                <h5 className="fw-bold">Let AI Optimize</h5>
                <p className="small text-muted">Gemini builds itineraries, check lists, and syncs live weather.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="bg-light text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fs-3 fw-bold shadow-sm" style={{ width: '64px', height: '64px' }}>
                  4
                </div>
                <h5 className="fw-bold">Travel & Sync</h5>
                <p className="small text-muted">Track expenses and auto-replanned routes as you explore.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-5 bg-light border-top">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-gradient-sunset">What Travelers Say</h2>
            <p className="text-muted">Real reviews from our globe-trotting community</p>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 glass-card p-4 h-100">
                <div className="card-body">
                  <p className="fst-italic text-muted">
                    "I was in Tokyo when a sudden storm forced my outdoor plans to cancel. TripPilot AI immediately updated my route, found an indoor art museum nearby, and swapped my lunch to a ramen shop next door. Life saver!"
                  </p>
                  <div className="d-flex align-items-center mt-4">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" alt="Sarah L." className="rounded-circle me-3" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                    <div>
                      <h6 className="mb-0 fw-bold">Sarah L.</h6>
                      <small className="text-muted">Solo Backpacker</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 glass-card p-4 h-100">
                <div className="card-body">
                  <p className="fst-italic text-muted">
                    "The expense tracker coupled with Gemini analysis helped my family stay on track during our tour of Italy. The packing helper suggested rain gear which saved our day in Venice. Absolutely brilliant travel tool."
                  </p>
                  <div className="d-flex align-items-center mt-4">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="Marcus T." className="rounded-circle me-3" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                    <div>
                      <h6 className="mb-0 fw-bold">Marcus T.</h6>
                      <small className="text-muted">Family Traveler</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
