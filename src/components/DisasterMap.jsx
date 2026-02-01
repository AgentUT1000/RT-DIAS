import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useApp } from '../context/AppContext';
import { getSeverityColor, getDisasterIcon, formatTimeAgo, formatNumber } from '../utils/helpers';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon creator
const createCustomIcon = (severity, type) => {
    const color = getSeverityColor(severity);
    const icon = getDisasterIcon(type);
    
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="marker-pin" style="background-color: ${color}; box-shadow: 0 0 20px ${color}80;">
                <span class="marker-icon">${icon}</span>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};

// Component to fit bounds
const FitBounds = ({ disasters }) => {
    const map = useMap();
    
    useEffect(() => {
        if (disasters.length > 0) {
            const bounds = disasters.map(d => [d.coordinates.lat, d.coordinates.lng]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [disasters, map]);
    
    return null;
};

export const DisasterMap = () => {
    const { disasters, setSelectedDisaster, selectedDisaster } = useApp();
    const mapRef = useRef(null);

    // Center of India
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    const handleMarkerClick = (disaster) => {
        setSelectedDisaster(disaster);
    };

    return (
        <div className="map-container">
            <div className="map-header">
                <h2 className="map-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                        <line x1="8" y1="2" x2="8" y2="18"></line>
                        <line x1="16" y1="6" x2="16" y2="22"></line>
                    </svg>
                    Live Disaster Map
                </h2>
                <div className="map-legend">
                    <div className="legend-item">
                        <span className="legend-dot critical"></span>
                        Critical
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot high"></span>
                        High
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot medium"></span>
                        Medium
                    </div>
                </div>
            </div>

            <div className="map-wrapper">
                <MapContainer
                    center={defaultCenter}
                    zoom={defaultZoom}
                    ref={mapRef}
                    className="leaflet-map"
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    
                    <FitBounds disasters={disasters} />

                    {disasters.map((disaster) => (
                        <div key={disaster.id}>
                            {/* Pulse circle for affected area */}
                            <Circle
                                center={[disaster.coordinates.lat, disaster.coordinates.lng]}
                                radius={disaster.severity === 'critical' ? 50000 : disaster.severity === 'high' ? 35000 : 20000}
                                pathOptions={{
                                    color: getSeverityColor(disaster.severity),
                                    fillColor: getSeverityColor(disaster.severity),
                                    fillOpacity: 0.15,
                                    weight: 1
                                }}
                            />
                            
                            {/* Custom marker */}
                            <Marker
                                position={[disaster.coordinates.lat, disaster.coordinates.lng]}
                                icon={createCustomIcon(disaster.severity, disaster.type)}
                                eventHandlers={{
                                    click: () => handleMarkerClick(disaster)
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="popup-content">
                                        <div className="popup-header">
                                            <span className="popup-icon">{getDisasterIcon(disaster.type)}</span>
                                            <h3>{disaster.type}</h3>
                                        </div>
                                        <p className="popup-location">{disaster.location}, {disaster.district}</p>
                                        <div className="popup-stats">
                                            <div>
                                                <span className="popup-label">Severity</span>
                                                <span className="popup-value" style={{ color: getSeverityColor(disaster.severity) }}>
                                                    {disaster.severityIndex.toFixed(1)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="popup-label">Affected</span>
                                                <span className="popup-value">{formatNumber(disaster.affectedPopulation)}</span>
                                            </div>
                                        </div>
                                        <p className="popup-time">{formatTimeAgo(disaster.reportedAt)}</p>
                                        <button 
                                            className="popup-btn"
                                            onClick={() => handleMarkerClick(disaster)}
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        </div>
                    ))}
                </MapContainer>
            </div>

            {/* Side panel for selected disaster */}
            {selectedDisaster && (
                <div className="map-side-panel">
                    <button className="panel-close" onClick={() => setSelectedDisaster(null)}>×</button>
                    <div className="panel-header">
                        <span className="panel-icon">{getDisasterIcon(selectedDisaster.type)}</span>
                        <div>
                            <h3>{selectedDisaster.type}</h3>
                            <p>{selectedDisaster.location}, {selectedDisaster.district}</p>
                        </div>
                    </div>
                    <div className="panel-body">
                        <div className="panel-stat">
                            <span className="stat-label">Status</span>
                            <span className={`status-badge ${selectedDisaster.status}`}>
                                {selectedDisaster.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="panel-stat">
                            <span className="stat-label">Severity Index</span>
                            <span className="stat-value" style={{ color: getSeverityColor(selectedDisaster.severity) }}>
                                {selectedDisaster.severityIndex.toFixed(1)}
                            </span>
                        </div>
                        <div className="panel-stat">
                            <span className="stat-label">Affected Population</span>
                            <span className="stat-value">{formatNumber(selectedDisaster.affectedPopulation)}</span>
                        </div>
                        <div className="panel-stat">
                            <span className="stat-label">Coordinates</span>
                            <span className="stat-value">
                                {selectedDisaster.coordinates.lat.toFixed(4)}, {selectedDisaster.coordinates.lng.toFixed(4)}
                            </span>
                        </div>
                        <p className="panel-description">{selectedDisaster.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
