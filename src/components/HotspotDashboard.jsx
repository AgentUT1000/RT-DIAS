import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useApp } from '../context/AppContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Severity colors
const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

// Disaster type icons
const DISASTER_ICONS = {
  earthquake: '🌍',
  flood: '🌊',
  cyclone: '🌀',
  tsunami: '🌊',
  wildfire: '🔥',
  landslide: '⛰️',
  drought: '☀️',
  volcano: '🌋',
  tornado: '🌪️',
  heatwave: '🔥',
  storm: '⛈️',
  default: '⚠️',
};

// Custom marker icon
const createCustomIcon = (severity, type) => {
  const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium;
  const icon = DISASTER_ICONS[type?.toLowerCase()] || DISASTER_ICONS.default;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="hotspot-marker" style="background: ${color}; box-shadow: 0 0 20px ${color}80;">
        <span class="marker-emoji">${icon}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Custom cluster icon based on severity
const createClusterIcon = (cluster) => {
  const childCount = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();
  
  // Calculate average severity
  let criticalCount = 0;
  let highCount = 0;
  
  markers.forEach(marker => {
    const severity = marker.options.severity;
    if (severity === 'critical') criticalCount++;
    else if (severity === 'high') highCount++;
  });
  
  // Determine cluster color based on contents
  let color = SEVERITY_COLORS.medium;
  let size = 'small';
  
  if (criticalCount > 0) {
    color = SEVERITY_COLORS.critical;
    size = 'large';
  } else if (highCount > 0) {
    color = SEVERITY_COLORS.high;
    size = 'medium';
  }
  
  const sizeClass = childCount < 10 ? 'small' : childCount < 50 ? 'medium' : 'large';
  
  return L.divIcon({
    html: `
      <div class="cluster-marker ${sizeClass}" style="background: ${color}; box-shadow: 0 0 30px ${color};">
        <span class="cluster-count">${childCount}</span>
        <span class="cluster-label">incidents</span>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(60, 60, true),
  });
};

// Map controller component
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom, map]);
  
  return null;
};

// Hotspot analysis component
const HotspotAnalysis = ({ disasters, onHotspotClick }) => {
  const hotspots = useMemo(() => {
    // Group disasters by region (using grid cells)
    const gridSize = 1; // 1 degree grid
    const grid = {};
    
    disasters.forEach(d => {
      const gridX = Math.floor(d.coordinates.lng / gridSize);
      const gridY = Math.floor(d.coordinates.lat / gridSize);
      const key = `${gridX},${gridY}`;
      
      if (!grid[key]) {
        grid[key] = {
          incidents: [],
          center: {
            lat: (gridY + 0.5) * gridSize,
            lng: (gridX + 0.5) * gridSize,
          },
          totalAffected: 0,
          criticalCount: 0,
        };
      }
      
      grid[key].incidents.push(d);
      grid[key].totalAffected += d.affectedPopulation || 0;
      if (d.severity === 'critical') grid[key].criticalCount++;
    });
    
    // Convert to array and sort by incident count
    return Object.entries(grid)
      .map(([key, data]) => ({
        id: key,
        ...data,
        intensity: data.incidents.length + (data.criticalCount * 2),
      }))
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 5); // Top 5 hotspots
  }, [disasters]);

  if (hotspots.length === 0) return null;

  return (
    <div className="hotspot-analysis">
      <h3 className="analysis-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        Identified Hotspots
      </h3>
      <div className="hotspot-list">
        {hotspots.map((hotspot, index) => (
          <div 
            key={hotspot.id} 
            className={`hotspot-item ${index === 0 ? 'primary' : ''}`}
            onClick={() => onHotspotClick(hotspot)}
          >
            <div className="hotspot-rank">#{index + 1}</div>
            <div className="hotspot-info">
              <span className="hotspot-count">{hotspot.incidents.length} incidents</span>
              <span className="hotspot-affected">
                {(hotspot.totalAffected / 1000).toFixed(0)}K affected
              </span>
            </div>
            <div className="hotspot-severity">
              {hotspot.criticalCount > 0 && (
                <span className="critical-badge">{hotspot.criticalCount} critical</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stats panel component
const StatsPanel = ({ disasters }) => {
  const stats = useMemo(() => {
    const total = disasters.length;
    const critical = disasters.filter(d => d.severity === 'critical').length;
    const high = disasters.filter(d => d.severity === 'high').length;
    const totalAffected = disasters.reduce((sum, d) => sum + (d.affectedPopulation || 0), 0);
    const byType = {};
    
    disasters.forEach(d => {
      byType[d.type] = (byType[d.type] || 0) + 1;
    });
    
    return { total, critical, high, totalAffected, byType };
  }, [disasters]);

  return (
    <div className="dashboard-stats">
      <div className="stat-card total">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Incidents</span>
        </div>
      </div>
      <div className="stat-card critical">
        <div className="stat-icon">🚨</div>
        <div className="stat-content">
          <span className="stat-value">{stats.critical}</span>
          <span className="stat-label">Critical</span>
        </div>
      </div>
      <div className="stat-card high">
        <div className="stat-icon">⚠️</div>
        <div className="stat-content">
          <span className="stat-value">{stats.high}</span>
          <span className="stat-label">High Severity</span>
        </div>
      </div>
      <div className="stat-card affected">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <span className="stat-value">{(stats.totalAffected / 1000).toFixed(0)}K</span>
          <span className="stat-label">People Affected</span>
        </div>
      </div>
    </div>
  );
};

// Filter panel
const FilterPanel = ({ filters, setFilters, disasterTypes }) => {
  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label>Severity</label>
        <div className="filter-buttons">
          {['all', 'critical', 'high', 'medium'].map(sev => (
            <button
              key={sev}
              className={`filter-btn ${filters.severity === sev ? 'active' : ''}`}
              onClick={() => setFilters(f => ({ ...f, severity: sev }))}
            >
              {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <label>Type</label>
        <select
          value={filters.type}
          onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
          className="filter-select"
        >
          <option value="all">All Types</option>
          {disasterTypes.map(type => (
            <option key={type} value={type}>
              {DISASTER_ICONS[type.toLowerCase()] || '⚠️'} {type}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Time Range</label>
        <select
          value={filters.timeRange}
          onChange={(e) => setFilters(f => ({ ...f, timeRange: e.target.value }))}
          className="filter-select"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>
    </div>
  );
};

// Main Dashboard Component
const HotspotDashboard = () => {
  const { disasters } = useApp();
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    timeRange: '24h',
  });
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showClusters, setShowClusters] = useState(true);
  const [mapStyle, setMapStyle] = useState('dark');

  // Get unique disaster types
  const disasterTypes = useMemo(() => {
    return [...new Set(disasters.map(d => d.type))];
  }, [disasters]);

  // Filter disasters
  const filteredDisasters = useMemo(() => {
    return disasters.filter(d => {
      if (filters.severity !== 'all' && d.severity !== filters.severity) return false;
      if (filters.type !== 'all' && d.type !== filters.type) return false;
      // Time range filtering would go here with real data
      return true;
    });
  }, [disasters, filters]);

  // Handle hotspot click
  const handleHotspotClick = useCallback((hotspot) => {
    setMapCenter([hotspot.center.lat, hotspot.center.lng]);
    setMapZoom(8);
  }, []);

  // Map tile layers
  const tileLayers = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap',
    },
  };

  return (
    <div className="hotspot-dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              <path d="M2 12h20"/>
            </svg>
            Disaster Hotspot Dashboard
          </h1>
          <p>Real-time incident clustering and analysis</p>
        </div>
        <div className="header-controls">
          <div className="toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showClusters}
                onChange={(e) => setShowClusters(e.target.checked)}
              />
              <span className="toggle-switch"></span>
              Enable Clustering
            </label>
          </div>
          <div className="map-style-selector">
            <button
              className={`style-btn ${mapStyle === 'dark' ? 'active' : ''}`}
              onClick={() => setMapStyle('dark')}
              title="Dark Mode"
            >
              🌙
            </button>
            <button
              className={`style-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
              onClick={() => setMapStyle('satellite')}
              title="Satellite"
            >
              🛰️
            </button>
            <button
              className={`style-btn ${mapStyle === 'terrain' ? 'active' : ''}`}
              onClick={() => setMapStyle('terrain')}
              title="Terrain"
            >
              🏔️
            </button>
          </div>
        </div>
      </div>

      <StatsPanel disasters={filteredDisasters} />
      
      <FilterPanel 
        filters={filters} 
        setFilters={setFilters} 
        disasterTypes={disasterTypes}
      />

      <div className="dashboard-content">
        <div className="map-section">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            zoomControl={false}
            className="hotspot-map"
            style={{ height: '100%', width: '100%' }}
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              url={tileLayers[mapStyle].url}
              attribution={tileLayers[mapStyle].attribution}
            />
            <MapController center={mapCenter} zoom={mapZoom} />

            {showClusters ? (
              <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createClusterIcon}
                maxClusterRadius={60}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={true}
                animate={true}
              >
                {filteredDisasters.map((disaster) => (
                  <Marker
                    key={disaster.id}
                    position={[disaster.coordinates.lat, disaster.coordinates.lng]}
                    icon={createCustomIcon(disaster.severity, disaster.type)}
                    severity={disaster.severity}
                    eventHandlers={{
                      click: () => setSelectedIncident(disaster),
                    }}
                  >
                    <Popup className="hotspot-popup">
                      <div className="popup-inner">
                        <div className="popup-header">
                          <span className="popup-icon">
                            {DISASTER_ICONS[disaster.type?.toLowerCase()] || '⚠️'}
                          </span>
                          <div>
                            <h4>{disaster.type}</h4>
                            <span className={`severity-badge ${disaster.severity}`}>
                              {disaster.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="popup-body">
                          <p className="popup-location">
                            📍 {disaster.location}, {disaster.district}
                          </p>
                          <div className="popup-stats">
                            <span>👥 {(disaster.affectedPopulation / 1000).toFixed(0)}K affected</span>
                            <span>📊 Severity: {disaster.severityIndex?.toFixed(1)}</span>
                          </div>
                          <p className="popup-desc">{disaster.description?.slice(0, 100)}...</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            ) : (
              filteredDisasters.map((disaster) => (
                <div key={disaster.id}>
                  <Circle
                    center={[disaster.coordinates.lat, disaster.coordinates.lng]}
                    radius={disaster.severity === 'critical' ? 40000 : disaster.severity === 'high' ? 25000 : 15000}
                    pathOptions={{
                      color: SEVERITY_COLORS[disaster.severity],
                      fillColor: SEVERITY_COLORS[disaster.severity],
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                  />
                  <Marker
                    position={[disaster.coordinates.lat, disaster.coordinates.lng]}
                    icon={createCustomIcon(disaster.severity, disaster.type)}
                    eventHandlers={{
                      click: () => setSelectedIncident(disaster),
                    }}
                  >
                    <Popup className="hotspot-popup">
                      <div className="popup-inner">
                        <div className="popup-header">
                          <span className="popup-icon">
                            {DISASTER_ICONS[disaster.type?.toLowerCase()] || '⚠️'}
                          </span>
                          <div>
                            <h4>{disaster.type}</h4>
                            <span className={`severity-badge ${disaster.severity}`}>
                              {disaster.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="popup-body">
                          <p className="popup-location">
                            📍 {disaster.location}, {disaster.district}
                          </p>
                          <div className="popup-stats">
                            <span>👥 {(disaster.affectedPopulation / 1000).toFixed(0)}K affected</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              ))
            )}
          </MapContainer>

          {/* Map Legend */}
          <div className="map-legend-overlay">
            <h4>Legend</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color" style={{ background: SEVERITY_COLORS.critical }}></span>
                Critical
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: SEVERITY_COLORS.high }}></span>
                High
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: SEVERITY_COLORS.medium }}></span>
                Medium
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: SEVERITY_COLORS.low }}></span>
                Low
              </div>
            </div>
          </div>
        </div>

        <div className="analysis-section">
          <HotspotAnalysis 
            disasters={filteredDisasters} 
            onHotspotClick={handleHotspotClick}
          />

          {/* Recent Incidents */}
          <div className="recent-incidents">
            <h3 className="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Recent Incidents
            </h3>
            <div className="incidents-list">
              {filteredDisasters.slice(0, 6).map(disaster => (
                <div 
                  key={disaster.id} 
                  className="incident-item"
                  onClick={() => {
                    setMapCenter([disaster.coordinates.lat, disaster.coordinates.lng]);
                    setMapZoom(10);
                    setSelectedIncident(disaster);
                  }}
                >
                  <span className="incident-icon">
                    {DISASTER_ICONS[disaster.type?.toLowerCase()] || '⚠️'}
                  </span>
                  <div className="incident-info">
                    <span className="incident-type">{disaster.type}</span>
                    <span className="incident-location">{disaster.location}</span>
                  </div>
                  <span className={`incident-severity ${disaster.severity}`}>
                    {disaster.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Incident Detail Modal */}
      {selectedIncident && (
        <div className="incident-modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="incident-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedIncident(null)}>×</button>
            <div className="modal-header">
              <span className="modal-icon">
                {DISASTER_ICONS[selectedIncident.type?.toLowerCase()] || '⚠️'}
              </span>
              <div>
                <h2>{selectedIncident.type}</h2>
                <span className={`severity-badge large ${selectedIncident.severity}`}>
                  {selectedIncident.severity.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-stat">
                <span className="stat-icon">📍</span>
                <div>
                  <span className="stat-label">Location</span>
                  <span className="stat-value">{selectedIncident.location}, {selectedIncident.district}</span>
                </div>
              </div>
              <div className="modal-stat">
                <span className="stat-icon">👥</span>
                <div>
                  <span className="stat-label">Affected Population</span>
                  <span className="stat-value">{selectedIncident.affectedPopulation?.toLocaleString()}</span>
                </div>
              </div>
              <div className="modal-stat">
                <span className="stat-icon">📊</span>
                <div>
                  <span className="stat-label">Severity Index</span>
                  <span className="stat-value">{selectedIncident.severityIndex?.toFixed(1)}</span>
                </div>
              </div>
              <div className="modal-stat">
                <span className="stat-icon">🗺️</span>
                <div>
                  <span className="stat-label">Coordinates</span>
                  <span className="stat-value">
                    {selectedIncident.coordinates.lat.toFixed(4)}, {selectedIncident.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              <div className="modal-description">
                <h4>Description</h4>
                <p>{selectedIncident.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotspotDashboard;
