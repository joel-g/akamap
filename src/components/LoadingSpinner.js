import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div className="loading-text">Loading regions...</div>
    </div>
  );
};

export default LoadingSpinner;
