import React, { useEffect, useRef, useState } from 'react';
import { FaUser, FaRoute } from 'react-icons/fa';

// Dict of central coordinates for popular destinations to seed maps
const CITY_COORDS = {
  paris: [48.8566, 2.3522],
  kyoto: [35.0116, 135.7681],
  tokyo: [35.6762, 139.6503],
  reykjavik: [64.1466, -21.9426],
  rome: [41.9028, 12.4964],
  london: [51.5074, -0.1278],
  bali: [-8.4095, 115.1889],
  newyork: [40.7128, -74.0060]
};

const TripMap = ({ destination, hotels = [], restaurants = [], sights = [], activeDay = 1 }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routeLineRef = useRef(null);

  const [userLoc, setUserLoc] = useState(null);
  const [filterHotels, setFilterHotels] = useState(true);
  const [filterRestaurants, setFilterRestaurants] = useState(true);
  const [filterSights, setFilterSights] = useState(true);
  const [filterHospitals, setFilterHospitals] = useState(true);
  const [filterATMs, setFilterATMs] = useState(true);

  const [center, setCenter] = useState([48.8566, 2.3522]); // Default to Paris

  // Determine center coordinates dynamically
  useEffect(() => {
    if (!destination) return;

    const cleanDest = destination.toLowerCase().replace(/[\s,]/g, '');
    let foundCoords = null;
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (cleanDest.includes(key)) {
        foundCoords = coords;
        break;
      }
    }

    if (foundCoords) {
      setCenter(foundCoords);
    } else {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setCenter([lat, lon]);
          }
        })
        .catch(err => {
          console.error("Geocoding failed for:", destination, err);
        });
    }
  }, [destination]);

  // Geolocation trigger
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log("User geolocation declined or unavailable.", err)
      );
    }
  }, []);

  // Initialize and Render Map layers
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = window.L.map(mapContainerRef.current).setView(center, 13);
    mapInstanceRef.current = map;

    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileAttr = '&copy; OpenStreetMap contributors';

    window.L.tileLayer(tileUrl, {
      attribution: tileAttr
    }).addTo(map);

    markersGroupRef.current = window.L.layerGroup().addTo(map);

    updateMapPins();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center]);

  // Update map pins when filters or active day changes
  useEffect(() => {
    updateMapPins();
  }, [filterHotels, filterRestaurants, filterSights, filterHospitals, filterATMs, userLoc, activeDay]);

  const updateMapPins = () => {
    const L = window.L;
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;

    if (!L || !map || !group) return;

    group.clearLayers();
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    const routeCoords = [];

    // Helper to generate custom pin icons
    const getCustomIcon = (type, color) => {
      let svgContent = '';
      if (type === 'user') {
        svgContent = `<circle cx="12" cy="12" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#ffffff"/>`;
        return L.divIcon({
          html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;"><svg viewBox="0 0 24 24" style="width:24px;height:24px;">${svgContent}</svg></div>`,
          className: 'custom-user-pin-container',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
      }

      if (type === 'sight') {
        svgContent = `<path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>`;
      } else if (type === 'hotel') {
        svgContent = `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`;
      } else if (type === 'restaurant') {
        svgContent = `<path d="M12 2v14M12 16c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-4M18 8V2M14 8V2M16 2v14"/><line x1="16" y1="18" x2="16" y2="22"/><line x1="10" y1="18" x2="10" y2="22"/>`;
      } else if (type === 'hospital') {
        svgContent = `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`;
      } else if (type === 'atm') {
        svgContent = `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`;
      }

      const html = `
        <div class="custom-map-pin" style="background-color: ${color};">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            ${svgContent}
          </svg>
        </div>
      `;

      return L.divIcon({
        html: html,
        className: 'custom-pin-container',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
      });
    };

    // 1. Plot User Location
    if (userLoc) {
      const userMarker = L.marker(userLoc, {
        icon: getCustomIcon('user', '#2563eb')
      }).bindPopup("<b>Your Location</b>");
      group.addLayer(userMarker);
    }

    // 2. Hotels
    if (filterHotels && hotels.length > 0) {
      hotels.forEach((hotel, idx) => {
        const offsetLat = (idx + 1) * 0.004 - 0.008;
        const offsetLon = (idx + 1) * -0.003 + 0.005;
        const latLng = [center[0] + offsetLat, center[1] + offsetLon];

        // Create a custom Leaflet map marker using our custom Cyan icon (#06b6d4) representing Hotels
        const pin = L.marker(latLng, {
          icon: getCustomIcon('hotel', '#06b6d4')
        }).bindPopup(`<b>Hotel: ${hotel.name}</b><br/>Rating: ${hotel.rating}<br/>Price: ${hotel.price_range}`);
        
        // Add this pin to our map group layer
        group.addLayer(pin);
      });
    }

    // 3. Restaurants
    if (filterRestaurants && restaurants.length > 0) {
      restaurants.forEach((rest, idx) => {
        const offsetLat = (idx + 1) * -0.005 + 0.007;
        const offsetLon = (idx + 1) * 0.005 - 0.004;
        const latLng = [center[0] + offsetLat, center[1] + offsetLon];

        const pin = L.marker(latLng, {
          icon: getCustomIcon('restaurant', '#f43f5e')
        }).bindPopup(`<b>Restaurant: ${rest.name}</b><br/>Cuisine: ${rest.cuisine}<br/>Price: ${rest.price_range}`);
        group.addLayer(pin);
      });
    }

    // 4. Sights (Tourist Places) & Route Overlay
    if (filterSights && sights.length > 0) {
      sights.forEach((sight, idx) => {
        const offsetLat = (idx + 1) * 0.002 - 0.004;
        const offsetLon = (idx + 1) * 0.006 - 0.007;
        const latLng = [center[0] + offsetLat, center[1] + offsetLon];
        routeCoords.push(latLng);

        // Create a custom Leaflet map marker using our custom Green icon (#22c55e) representing Sights
        const pin = L.marker(latLng, {
          icon: getCustomIcon('sight', '#22c55e')
        }).bindPopup(`<b>Sight: ${sight.title}</b><br/>${sight.description}`);
        
        // Add this pin to our map group layer
        group.addLayer(pin);
      });
    }

    // 5. Emergency Nearby Sights
    if (filterHospitals) {
      const hospLatLng1 = [center[0] + 0.009, center[1] + 0.002];
      const hospLatLng2 = [center[0] - 0.008, center[1] - 0.006];

      const pin1 = L.marker(hospLatLng1, {
        icon: getCustomIcon('hospital', '#ef4444')
      }).bindPopup("<b>Hospital: City Central General Hospital</b><br/>Emergency Ward open 24/7.");
      const pin2 = L.marker(hospLatLng2, {
        icon: getCustomIcon('hospital', '#ef4444')
      }).bindPopup("<b>Clinic: Metropolitan Red Cross Clinic</b><br/>Urgent Medical Support.");
      group.addLayer(pin1);
      group.addLayer(pin2);
    }

    if (filterATMs) {
      const atm1 = [center[0] + 0.003, center[1] - 0.002];
      const atm2 = [center[0] - 0.004, center[1] + 0.008];

      const pin1 = L.marker(atm1, {
        icon: getCustomIcon('atm', '#f59e0b')
      }).bindPopup("<b>ATM: Bank Express</b><br/>Accepts international debit/credit cards.");
      const pin2 = L.marker(atm2, {
        icon: getCustomIcon('atm', '#f59e0b')
      }).bindPopup("<b>ATM: Global Exchange</b><br/>Currency withdrawal available.");
      group.addLayer(pin1);
      group.addLayer(pin2);
    }

    // 6. Draw Actual Road Routing overlays using OSRM Routing Engine API
    if (routeCoords.length > 1) {
      // Convert our [lat, lng] coordinates into OSRM format "lng,lat;lng,lat"
      const osrmCoordinates = routeCoords.map(coord => `${coord[1]},${coord[0]}`).join(';');
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmCoordinates}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            // Get the road geometry lines from the API response
            const geometry = data.routes[0].geometry;

            // Draw the actual road route line on the Leaflet map in Royal Blue (#2563eb)
            const polyline = L.geoJSON(geometry, {
              style: {
                color: '#2563eb',
                weight: 5,
                opacity: 0.8,
                dashArray: '2, 6' // Slightly tighter dots for an aesthetic road look
              }
            }).addTo(map);

            routeLineRef.current = polyline;

            // Auto zoom map to beautifully fit the real road route bounds
            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
          }
        })
        .catch(err => {
          console.error("OSRM Routing failed, falling back to straight line:", err);
          // Fallback to basic straight line in Royal Blue (#2563eb) if OSRM API is slow or down
          const polyline = L.polyline(routeCoords, {
            color: '#2563eb',
            weight: 5,
            opacity: 0.8,
            dashArray: '8, 8'
          }).addTo(map);
          routeLineRef.current = polyline;
          map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
        });
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-9 col-md-8">
        <div
          ref={mapContainerRef}
          className="rounded-4 border shadow-sm animate-fade-in-up"
          style={{ height: '480px', width: '100%', position: 'relative', zIndex: 1 }}
        ></div>
      </div>

      <div className="col-lg-3 col-md-4 d-flex">
        <div className="glass-card p-4 shadow-sm flex-grow-1 d-flex flex-column justify-content-between w-100">
          <div>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FaRoute className="text-primary" />
              <span>Map Filters</span>
            </h5>
            <p className="small text-muted mb-4">Toggle markers to locate amenities surrounding your travel route.</p>

            <div className="map-filter-group">
              {/* Sights */}
              <div className={`map-filter-card-item ${filterSights ? 'active' : ''}`} onClick={() => setFilterSights(!filterSights)}>
                <div className="map-filter-left-section">
                  <div className="map-filter-badge-box sights shadow-sm">
                    <svg className="map-filter-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="d-block small fw-bold text-dark">Sights & Route</span>
                  </div>
                </div>
                <label className="map-filter-toggle-switch mb-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={filterSights}
                    onChange={(e) => setFilterSights(e.target.checked)}
                  />
                  <span className="map-filter-toggle-slider"></span>
                </label>
              </div>

              {/* Hotels */}
              <div className={`map-filter-card-item ${filterHotels ? 'active' : ''}`} onClick={() => setFilterHotels(!filterHotels)}>
                <div className="map-filter-left-section">
                  <div className="map-filter-badge-box hotels shadow-sm">
                    <svg className="map-filter-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <span className="d-block small fw-bold text-dark">Hotels</span>
                  </div>
                </div>
                <label className="map-filter-toggle-switch mb-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={filterHotels}
                    onChange={(e) => setFilterHotels(e.target.checked)}
                  />
                  <span className="map-filter-toggle-slider"></span>
                </label>
              </div>

              {/* Restaurants */}
              <div className={`map-filter-card-item ${filterRestaurants ? 'active' : ''}`} onClick={() => setFilterRestaurants(!filterRestaurants)}>
                <div className="map-filter-left-section">
                  <div className="map-filter-badge-box restaurants shadow-sm">
                    <svg className="map-filter-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v14M12 16c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-4M18 8V2M14 8V2M16 2v14" />
                      <line x1="16" y1="18" x2="16" y2="22" />
                      <line x1="10" y1="18" x2="10" y2="22" />
                    </svg>
                  </div>
                  <div>
                    <span className="d-block small fw-bold text-dark">Restaurants</span>
                  </div>
                </div>
                <label className="map-filter-toggle-switch mb-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={filterRestaurants}
                    onChange={(e) => setFilterRestaurants(e.target.checked)}
                  />
                  <span className="map-filter-toggle-slider"></span>
                </label>
              </div>

              {/* Hospitals */}
              <div className={`map-filter-card-item ${filterHospitals ? 'active' : ''}`} onClick={() => setFilterHospitals(!filterHospitals)}>
                <div className="map-filter-left-section">
                  <div className="map-filter-badge-box hospitals shadow-sm">
                    <svg className="map-filter-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <span className="d-block small fw-bold text-dark">Hospitals</span>
                  </div>
                </div>
                <label className="map-filter-toggle-switch mb-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={filterHospitals}
                    onChange={(e) => setFilterHospitals(e.target.checked)}
                  />
                  <span className="map-filter-toggle-slider"></span>
                </label>
              </div>

              {/* ATMs */}
              <div className={`map-filter-card-item ${filterATMs ? 'active' : ''}`} onClick={() => setFilterATMs(!filterATMs)}>
                <div className="map-filter-left-section">
                  <div className="map-filter-badge-box atms shadow-sm">
                    <svg className="map-filter-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <span className="d-block small fw-bold text-dark">ATMs</span>
                  </div>
                </div>
                <label className="map-filter-toggle-switch mb-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={filterATMs}
                    onChange={(e) => setFilterATMs(e.target.checked)}
                  />
                  <span className="map-filter-toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {userLoc && (
            <div className="mt-4 pt-4 border-top">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1.5 small d-inline-flex align-items-center gap-1.5">
                <FaUser /> My Location Detected
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripMap;