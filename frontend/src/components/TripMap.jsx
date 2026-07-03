import React, { useEffect, useRef, useState } from 'react';
import { FaUser, FaHotel, FaUtensils, FaCamera, FaHospital, FaDollarSign, FaRoute } from 'react-icons/fa';

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
  const [darkMap, setDarkMap] = useState(true);

  // Determine center coordinates
  const cleanDest = destination.toLowerCase().replace(/[\s,]/g, '');
  let center = [48.8566, 2.3522]; // Paris default
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (cleanDest.includes(key)) {
      center = coords;
      break;
    }
  }

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

    // Remove existing instance if created
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Initialize leaflet map
    const map = window.L.map(mapContainerRef.current).setView(center, 13);
    mapInstanceRef.current = map;

    // Select tile URL based on darkMap toggle state
    const tileUrl = darkMap 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileAttr = darkMap
      ? '&copy; OpenStreetMap &copy; CARTO'
      : '&copy; OpenStreetMap contributors';

    window.L.tileLayer(tileUrl, {
      attribution: tileAttr
    }).addTo(map);

    // Group layer for markers
    markersGroupRef.current = window.L.layerGroup().addTo(map);

    updateMapPins();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, filterHotels, filterRestaurants, filterSights, filterHospitals, filterATMs, userLoc, activeDay, darkMap]);

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

    // 1. Plot User Location
    if (userLoc) {
      const userMarker = L.circleMarker(userLoc, {
        color: '#2563eb',
        fillColor: '#60a5fa',
        fillOpacity: 0.8,
        radius: 10
      }).bindPopup("<b>Your Location</b>");
      group.addLayer(userMarker);
    }

    // Scatter mock coordinates around the center for recommendations
    // 2. Hotels
    if (filterHotels && hotels.length > 0) {
      hotels.forEach((hotel, idx) => {
        const offsetLat = (idx + 1) * 0.004 - 0.008;
        const offsetLon = (idx + 1) * -0.003 + 0.005;
        const latLng = [center[0] + offsetLat, center[1] + offsetLon];
        
        const pin = L.marker(latLng)
          .bindPopup(`<b>🏨 ${hotel.name}</b><br/>Rating: ${hotel.rating}<br/>Price: ${hotel.price_range}`);
        group.addLayer(pin);
      });
    }

    // 3. Restaurants
    if (filterRestaurants && restaurants.length > 0) {
      restaurants.forEach((rest, idx) => {
        const offsetLat = (idx + 1) * -0.005 + 0.007;
        const offsetLon = (idx + 1) * 0.005 - 0.004;
        const latLng = [center[0] + offsetLat, center[1] + offsetLon];

        const pin = L.marker(latLng)
          .bindPopup(`<b>🍔 ${rest.name}</b><br/>Cuisine: ${rest.cuisine}<br/>Price: ${rest.price_range}`);
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

        const pin = L.marker(latLng)
          .bindPopup(`<b>🏛️ ${sight.title}</b><br/>${sight.description}`);
        group.addLayer(pin);
      });
    }

    // 5. Emergency Nearby Sights (Hospitals & ATMs scattered at static offsets)
    if (filterHospitals) {
      // Localized Hospital
      const hospLatLng1 = [center[0] + 0.009, center[1] + 0.002];
      const hospLatLng2 = [center[0] - 0.008, center[1] - 0.006];
      
      const pin1 = L.marker(hospLatLng1).bindPopup("<b>🏥 City Central General Hospital</b><br/>Emergency Ward open 24/7.");
      const pin2 = L.marker(hospLatLng2).bindPopup("<b>🏥 Metropolitan Red Cross Clinic</b><br/>Urgent Medical Support.");
      group.addLayer(pin1);
      group.addLayer(pin2);
    }

    if (filterATMs) {
      const atm1 = [center[0] + 0.003, center[1] - 0.002];
      const atm2 = [center[0] - 0.004, center[1] + 0.008];
      
      const pin1 = L.marker(atm1).bindPopup("<b>🏧 Bank Express ATM</b><br/>Accepts international debit/credit cards.");
      const pin2 = L.marker(atm2).bindPopup("<b>🏧 Global Exchange ATM</b><br/>Currency withdrawal available.");
      group.addLayer(pin1);
      group.addLayer(pin2);
    }

    // 6. Draw Routing overlays
    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#0ea5e9',
        weight: 5,
        opacity: 0.7,
        dashArray: '8, 8'
      }).addTo(map);
      routeLineRef.current = polyline;
      
      // Auto zoom map to fit route coordinates
      map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    }
  };

  return (
    <div className="row g-4">
      {/* Map display */}
      <div className="col-lg-9 col-md-8">
        <div 
          ref={mapContainerRef} 
          className="rounded-4 border shadow-sm" 
          style={{ height: '480px', width: '100%', position: 'relative', zIndex: 1 }}
        ></div>
      </div>

      {/* Control panel filter cards */}
      <div className="col-lg-3 col-md-4">
        <div className="card bg-light border-0 p-4 rounded-4 shadow-sm h-100">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <FaRoute className="text-primary" />
            <span>Map Filters</span>
          </h5>
          <p className="small text-muted mb-4">Toggle markers to locate amenities surrounding your travel route.</p>
          
          <div className="d-flex flex-column gap-3">
            <label className="d-flex align-items-center gap-2.5 small fw-semibold cursor-pointer border-bottom pb-3 mb-1">
              <input 
                type="checkbox" 
                checked={darkMap} 
                onChange={(e) => setDarkMap(e.target.checked)}
                className="form-check-input"
              />
              <span className="d-flex align-items-center gap-2">🌙 Dark Theme Map</span>
            </label>

            <label className="d-flex align-items-center gap-2.5 small fw-semibold cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterSights} 
                onChange={(e) => setFilterSights(e.target.checked)}
                className="form-check-input"
              />
              <span className="d-flex align-items-center gap-2"><FaCamera className="text-success" /> Sights & Route</span>
            </label>

            <label className="d-flex align-items-center gap-2.5 small fw-semibold cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterHotels} 
                onChange={(e) => setFilterHotels(e.target.checked)}
                className="form-check-input"
              />
              <span className="d-flex align-items-center gap-2"><FaHotel className="text-info" /> Hotels</span>
            </label>

            <label className="d-flex align-items-center gap-2.5 small fw-semibold cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterRestaurants} 
                onChange={(e) => setFilterRestaurants(e.target.checked)}
                className="form-check-input"
              />
              <span className="d-flex align-items-center gap-2"><FaUtensils className="text-danger" /> Restaurants</span>
            </label>

            <label className="d-flex align-items-center gap-2.5 small fw-semibold cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterHospitals} 
                onChange={(e) => setFilterHospitals(e.target.checked)}
                className="form-check-input"
              />
              <span className="d-flex align-items-center gap-2"><FaHospital className="text-danger" /> Hospitals</span>
            </label>

            <label className="d-flex align-items-center gap-2.5 small fw-semibold cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterATMs} 
                onChange={(e) => setFilterATMs(e.target.checked)}
                className="form-check-input"
              />
              <span className="d-flex align-items-center gap-2"><FaDollarSign className="text-secondary" /> ATMs</span>
            </label>
          </div>

          {userLoc && (
            <div className="mt-4 pt-4 border-top">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1.5 small d-inline-flex align-items-center gap-1.5">
                <FaUser /> GPS Geolocated
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripMap;
