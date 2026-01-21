import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Components
import RegionMarker from './components/RegionMarker';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import GeocodingSummary from './components/GeocodingSummary';

// Hooks and utilities
import { useRegionGeocoding } from './hooks/useRegionGeocoding';
import { fetchRegions } from './services/linodeApi';

// Leaflet icon fix for React
import L from 'leaflet';

let DefaultIcon = L.divIcon({
  html: `<div class="custom-marker"></div>`,
  className: 'custom-div-icon',
  iconSize: [25, 25],
  iconAnchor: [12, 12]
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const {
    isLoading,
    error,
    geocodingSummary,
    geocodeRegions,
    getValidRegions,
    getNewRegions
  } = useRegionGeocoding();

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regionsData = await fetchRegions();
        await geocodeRegions(regionsData);
      } catch (err) {
        console.error('Failed to load regions:', err);
      }
    };

    loadRegions();
  }, [geocodeRegions]);

  // Handle ESC key to close sidebars
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showSidebar) {
          handleSidebarClose();
        }
        if (showSummary) {
          setShowSummary(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSidebar, showSummary]);

  // Handle region selection
  const handleRegionClick = (region) => {
    setSelectedRegion(region);
    setShowSidebar(true);
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setShowSidebar(false);
    setSelectedRegion(null);
  };

  // Handle map click (close sidebar if clicking outside)
  const handleMapClick = () => {
    if (showSidebar) {
      handleSidebarClose();
    }
  };

  const validRegions = getValidRegions();
  const newRegions = getNewRegions();

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🗺️ AkaMap</h1>
          <p>Interactive Global Map of Akamai Linode Cloud Regions</p>
          <div className="header-stats">
            <span className="stat">
              📍 {validRegions.length} Regions
            </span>
            {newRegions.length > 0 && (
              <span className="stat new-regions">
                🆕 {newRegions.length} New
              </span>
            )}
            <button 
              className="summary-toggle"
              onClick={() => setShowSummary(!showSummary)}
            >
              📊 Summary
            </button>
          </div>
        </div>
      </header>

      {/* Summary Panel */}
      {showSummary && geocodingSummary && (
        <GeocodingSummary 
          summary={geocodingSummary} 
          onClose={() => setShowSummary(false)}
        />
      )}

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <span>⚠️ Error: {error}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="map-container">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-container"
          onClick={handleMapClick}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render region markers */}
          {validRegions.map((region) => (
            <RegionMarker
              key={region.id}
              region={region}
              onClick={() => handleRegionClick(region)}
              isSelected={selectedRegion?.id === region.id}
            />
          ))}
        </MapContainer>
      </div>

      {/* Sidebar */}
      {showSidebar && selectedRegion && (
        <Sidebar
          region={selectedRegion}
          onClose={handleSidebarClose}
        />
      )}
    </div>
  );
}

export default App;
