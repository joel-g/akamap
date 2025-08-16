import React from 'react';

const GeocodingSummary = ({ summary, onClose }) => {
  return (
    <div className="geocoding-summary">
      <h3>
        📊 Geocoding Summary
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </h3>
      
      <div className="summary-stats">
        <div className="summary-stat">
          <span className="stat-label">Total Regions</span>
          <span className="stat-value">{summary.total}</span>
        </div>
        
        <div className="summary-stat">
          <span className="stat-label">Bundled Coordinates</span>
          <span className="stat-value success">{summary.bundled}</span>
        </div>
        
        {summary.newlyGeocoded > 0 && (
          <div className="summary-stat">
            <span className="stat-label">Newly Geocoded</span>
            <span className="stat-value warning">{summary.newlyGeocoded}</span>
          </div>
        )}
        
        {summary.failed > 0 && (
          <div className="summary-stat">
            <span className="stat-label">Failed to Geocode</span>
            <span className="stat-value error">{summary.failed}</span>
          </div>
        )}
        
        <div className="summary-stat">
          <span className="stat-label">Success Rate</span>
          <span className="stat-value success">
            {Math.round(((summary.total - summary.failed) / summary.total) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeocodingSummary;
