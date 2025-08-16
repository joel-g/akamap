import React, { useState } from 'react';
import { fetchRegionAvailability } from '../services/linodeApi';
import './Sidebar.css';

const Sidebar = ({ region, onClose }) => {
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [expandedResolvers, setExpandedResolvers] = useState({
    ipv4: false,
    ipv6: false
  });

  // Handle ESC key for availability sidebar
  React.useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showAvailability) {
        setShowAvailability(false);
        event.stopPropagation(); // Prevent closing main sidebar
      }
    };

    if (showAvailability) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [showAvailability]);

  const handleGetAvailability = async () => {
    if (availability && showAvailability) {
      setShowAvailability(false);
      return;
    }

    if (availability && !showAvailability) {
      setShowAvailability(true);
      return;
    }

    setLoadingAvailability(true);
    setAvailabilityError(null);

    try {
      const availabilityData = await fetchRegionAvailability(region.id);
      setAvailability(availabilityData);
      setShowAvailability(true);
    } catch (error) {
      setAvailabilityError(error.message);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const formatCapabilities = (capabilities) => {
    return capabilities.map(capability => ({
      name: capability,
      category: getCategoryForCapability(capability)
    }));
  };

  const getCategoryForCapability = (capability) => {
    const categories = {
      'Compute': ['Linodes', 'GPU Linodes', 'Premium Plans'],
      'Storage': ['Block Storage', 'Object Storage', 'Block Storage Encryption', 'Disk Encryption', 'Block Storage Migrations'],
      'Networking': ['NodeBalancers', 'Cloud Firewall', 'Vlans', 'VPCs'],
      'Platform': ['Kubernetes', 'Managed Databases', 'Backups', 'Metadata', 'Placement Group'],
      'Developer Tools': ['StackScripts'],
      'Hardware': ['NETINT Quadra T1U']
    };

    for (const [category, caps] of Object.entries(categories)) {
      if (caps.includes(capability)) return category;
    }
    return 'Other';
  };

  const groupCapabilitiesByCategory = (capabilities) => {
    const formattedCaps = formatCapabilities(capabilities);
    return formattedCaps.reduce((groups, cap) => {
      const category = cap.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(cap.name);
      return groups;
    }, {});
  };

  const capabilityGroups = groupCapabilitiesByCategory(region.capabilities || []);

  // Toggle resolver expansion
  const toggleResolverExpansion = (type) => {
    setExpandedResolvers(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Render resolver list with expand/collapse functionality
  const renderResolverList = (resolverString, type, displayLimit) => {
    const resolvers = resolverString.split(',').map(ip => ip.trim());
    const isExpanded = expandedResolvers[type];
    const displayResolvers = isExpanded ? resolvers : resolvers.slice(0, displayLimit);
    const hasMore = resolvers.length > displayLimit;

    return (
      <div className="resolver-list">
        {displayResolvers.map((ip, index) => (
          <code key={index} className={`resolver-ip ${type}`}>{ip}</code>
        ))}
        {hasMore && (
          <button 
            className="more-resolvers-btn"
            onClick={() => toggleResolverExpansion(type)}
          >
            {isExpanded 
              ? `− Show less` 
              : `+ ${resolvers.length - displayLimit} more`
            }
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}>
        <div className="sidebar" onClick={(e) => e.stopPropagation()}>
          <div className="sidebar-header">
            <div className="region-title">
              <h2>
                {region.label}
                {region.isNewRegion && <span className="new-badge">NEW</span>}
              </h2>
              <p className="region-id">{region.id}</p>
            </div>
            <div className="header-actions">
              <button 
                className="availability-header-btn"
                onClick={handleGetAvailability}
                disabled={loadingAvailability}
              >
                {loadingAvailability ? (
                  <>
                    <div className="btn-spinner"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    📊 {showAvailability ? 'Hide' : 'Get'} Availability
                  </>
                )}
              </button>
              <button className="close-btn" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          {availabilityError && (
            <div className="availability-error">
              ⚠️ {availabilityError}
            </div>
          )}

          <div className="sidebar-content">
            {/* Basic Info */}
            <div className="info-section">
              <h3>📍 Location Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Country:</span>
                  <span className="value">{region.country?.toUpperCase()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className={`value status ${region.status}`}>
                    {region.status === 'ok' ? '🟢' : '🟡'} {region.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Site Type:</span>
                  <span className="value">{region.site_type}</span>
                </div>
                {region.coordinates && (
                  <div className="info-item">
                    <span className="label">Coordinates:</span>
                    <span className="value">
                      {region.coordinates.lat.toFixed(4)}, {region.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Capabilities */}
            <div className="info-section">
              <h3>🛠️ Capabilities</h3>
              <div className="capabilities-container">
                {Object.entries(capabilityGroups).map(([category, capabilities]) => (
                  <div key={category} className="capability-group">
                    <h4 className="capability-category">{category}</h4>
                    <div className="capability-tags">
                      {capabilities.map((capability) => (
                        <span key={capability} className="capability-tag">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DNS Resolvers */}
            {region.resolvers && (
              <div className="info-section">
                <h3>🌐 DNS Resolvers</h3>
                <div className="resolvers">
                  <div className="resolver-group">
                    <h4>IPv4</h4>
                    {renderResolverList(region.resolvers.ipv4, 'ipv4', 3)}
                  </div>
                  <div className="resolver-group">
                    <h4>IPv6</h4>
                    {renderResolverList(region.resolvers.ipv6, 'ipv6', 2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Availability Sidebar */}
      {showAvailability && availability && (
        <div className="availability-sidebar-overlay" onClick={() => setShowAvailability(false)}>
          <div className="availability-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="availability-sidebar-header">
              <h3>📊 Plan Availability - {region.label}</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowAvailability(false)}
              >
                ✕
              </button>
            </div>
            <div className="availability-sidebar-content">
              <div className="availability-grid">
                {availability.map((plan, index) => (
                  <div key={index} className={`availability-item ${plan.available ? 'available' : 'unavailable'}`}>
                    <span className="plan-name">{plan.plan}</span>
                    <span className="availability-status">
                      {plan.available ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="availability-summary">
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="stat-label">Available Plans</span>
                    <span className="stat-value success">
                      {availability.filter(p => p.available).length}
                    </span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Unavailable Plans</span>
                    <span className="stat-value error">
                      {availability.filter(p => !p.available).length}
                    </span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Total Plans</span>
                    <span className="stat-value">{availability.length}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Availability Rate</span>
                    <span className="stat-value success">
                      {Math.round((availability.filter(p => p.available).length / availability.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
