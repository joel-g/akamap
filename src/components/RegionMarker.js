import React, { useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const RegionMarker = ({ region, onClick, isSelected }) => {
  const { coordinates, label, country, status, isNewRegion } = region;
  const markerRef = useRef(null);

  if (!coordinates) return null;

  // Create custom icon based on region state
  const getMarkerClass = () => {
    let classes = 'custom-marker';
    if (isSelected) classes += ' selected';
    if (isNewRegion) classes += ' new';
    return classes;
  };

  const customIcon = L.divIcon({
    html: `<div class="${getMarkerClass()}"></div>`,
    className: 'custom-div-icon',
    iconSize: [25, 25],
    iconAnchor: [12, 12]
  });

  return (
    <Marker
      position={[coordinates.lat, coordinates.lng]}
      icon={customIcon}
      ref={markerRef}
      eventHandlers={{
        click: (e) => {
          e.originalEvent?.stopPropagation();
          onClick(region);
        },
        mouseover: () => {
          markerRef.current?.openPopup();
        },
        mouseout: () => {
          markerRef.current?.closePopup();
        }
      }}
    >
      <Popup closeButton={false} className="hover-popup">
        <div className="marker-popup">
          <h4>
            {label}
            {isNewRegion && <span className="new-badge">NEW</span>}
          </h4>
          <div className="popup-details">
            <p><strong>Country:</strong> {country?.toUpperCase()}</p>
            <p><strong>Status:</strong> 
              <span className={`status ${status}`}>
                {status === 'ok' ? '🟢' : '🟡'} {status}
              </span>
            </p>
            <p><strong>Region ID:</strong> {region.id}</p>
          </div>
          <div className="popup-hint">
            <p>💡 Click marker for full details</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default RegionMarker;
