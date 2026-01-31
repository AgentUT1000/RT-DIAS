import React, { useState, useEffect } from 'react';
import { SocialFeed } from './SocialFeed';
import { useKafka } from '../context/KafkaContext';

const getDisasterIcon = (type) => {
  const icons = {
    flood: '🌊',
    cyclone: '🌀',
    earthquake: '🌍',
    fire: '🔥',
    landslide: '⛰️',
    drought: '☀️',
    heatwave: '🌡️'
  };
  return icons[type] || '⚠️';
};

export const DisasterDetail = ({ onBack, data }) => {
    const { events } = useKafka();
    const [coords, setCoords] = useState({ 
        lat: data.location?.coordinates?.lat?.toFixed(4) || '28.6139', 
        lng: data.location?.coordinates?.lng?.toFixed(4) || '77.2090' 
    });
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    
    // Get related events for this disaster (matching city or disaster type)
    const relatedEvents = events.filter(e => {
        const matchCity = e.location?.city?.toLowerCase() === data.location?.city?.toLowerCase();
        const matchType = e.disaster?.type?.toLowerCase() === data.type?.toLowerCase();
        return matchCity || matchType;
    }).slice(0, 15);

    // Simulate updating telemetry/coordinates based on actual location
    useEffect(() => {
        const baseLat = data.location?.coordinates?.lat || 28.6139;
        const baseLng = data.location?.coordinates?.lng || 77.2090;
        const interval = setInterval(() => {
            setCoords({
                lat: (baseLat + (Math.random() - 0.5) * 0.01).toFixed(4),
                lng: (baseLng + (Math.random() - 0.5) * 0.01).toFixed(4)
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [data]);

    if (selectedPlatform) {
        return (
            <SocialFeed
                platform={selectedPlatform}
                onClose={() => setSelectedPlatform(null)}
            />
        );
    }

    // Get severity color
    const severityColors = {
        critical: '#ef4444',
        high: '#f97316',
        medium: '#eab308',
        low: '#22c55e'
    };
    
    const severityColor = severityColors[data.severity] || '#94a3b8';
    const icon = getDisasterIcon(data.type);
    const cityName = data.location?.city || data.location || 'Unknown';
    const stateName = data.location?.state || '';

    return (
        <div className="detail-container">
            <button className="back-btn" onClick={onBack}>
                ← BACK TO DASHBOARD
            </button>

            <div className="detail-header-section">
                <h1 className="detail-title">
                    {icon} {data.type?.charAt(0).toUpperCase() + data.type?.slice(1)} 
                    <span className="detail-divider">/</span> 
                    {cityName}{stateName ? `, ${stateName}` : ''}
                </h1>
                <div className="detail-meta">
                    <span 
                        className="severity-indicator" 
                        style={{ backgroundColor: severityColor }}
                    >
                        {data.severity?.toUpperCase()} SEVERITY
                    </span>
                    <span className="event-count">📊 {data.eventCount || 1} reports tracked</span>
                    <span className="confidence-score">🎯 {Math.round((data.confidence || 0.85) * 100)}% confidence</span>
                </div>
            </div>

            {/* Real-time Event Feed */}
            <div className="live-updates-section">
                <h3>📡 Live Event Stream ({relatedEvents.length} events)</h3>
                {relatedEvents.length > 0 ? (
                    <div className="live-updates-list">
                        {relatedEvents.map((event, idx) => (
                            <div key={idx} className="live-update-item">
                                <span className="update-time">
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="update-source">
                                    {event.source === 'twitter' ? '🐦' : event.source === 'gdelt' ? '📰' : '📡'}
                                    {event.source}
                                </span>
                                <span className="update-text">
                                    {event.content || event.title || 
                                     (event.readings ? `Sensor: ${JSON.stringify(event.readings)}` : 'Event detected')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="waiting-for-events">
                        <p>Waiting for related events...</p>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-pill">
                    <div className="stat-icon-box orange">🌡</div>
                    <div className="stat-info">
                        <span className="stat-label">TEMP</span>
                        <span className="stat-value">8°C</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon-box blue">💨</div>
                    <div className="stat-info">
                        <span className="stat-label">WIND</span>
                        <span className="stat-value">45 km/h</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon-box green">👁</div>
                    <div className="stat-info">
                        <span className="stat-label">VISIBILITY</span>
                        <span className="stat-value">1.2 km</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon-box purple">⏲</div>
                    <div className="stat-info">
                        <span className="stat-label">PRESSURE</span>
                        <span className="stat-value">1004 hPa</span>
                    </div>
                </div>
            </div>

            <div className="telemetry-bar">
                ((•)) Telemetry Updated 30s ago
            </div>

            {/* Content Grid */}
            <div className="feeds-grid">

                {/* Row 1: Socials */}
                <div
                    className="social-card twitter hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => setSelectedPlatform('Twitter')}
                >
                    <div className="card-top-bar">
                        <span className="platform-tag">• X / TWITTER</span>
                        <span className="close-icon">×</span>
                    </div>
                    <div className="social-content">
                        <div className="user-avatar-placeholder"></div>
                        <div className="user-handle">@uttarakhand_watch</div>
                        <p className="tweet-text">
                            "Massive landslide near the tunnel! Avoid the main highway. #Chamoli #Emergency"
                        </p>
                    </div>
                </div>

                <div
                    className="social-card instagram hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => setSelectedPlatform('Instagram')}
                >
                    <div className="card-top-bar">
                        <span className="platform-tag">• INSTAGRAM REEL</span>
                        <span className="platform-icon">📷</span>
                    </div>
                    <div className="social-content">
                        <div className="user-avatar-placeholder"></div>
                        <div className="user-handle">@travel_himalaya</div>
                        <p className="tweet-text">
                            "Road completely blocked. Stay safe everyone! 🚨"
                        </p>
                    </div>
                </div>

                <div
                    className="social-card snapchat hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => setSelectedPlatform('Snapchat')}
                >
                    <div className="card-top-bar">
                        <span className="platform-tag">• SNAP MAP</span>
                        <span className="platform-icon">🔒</span>
                    </div>
                    <div className="social-content">
                        <div className="user-avatar-placeholder"></div>
                        <div className="user-handle">@rahul_peaks</div>
                        <p className="tweet-text">
                            "View from my hotel balcony 🤯"
                        </p>
                    </div>
                </div>

                {/* Row 2: Media / Sat */}
                <div className="news-card">
                    <div className="news-preview animated-noise">
                        <div className="breaking-tag">BREAKING NEWS</div>
                        <div className="play-icon">▶</div>
                    </div>
                    <div className="news-footer">
                        <div className="live-tag">LIVE</div>
                        <span className="news-source">NEWS 24/7</span>
                        <p className="news-headline">Emergency crews dispatched to Chamoli sector following debris reports.</p>
                        <div className="ticker-wrap">
                            <div className="ticker">
                                Updates: Rescue teams deployed • Road closures in effect • Local authorities advise caution •
                            </div>
                        </div>
                    </div>
                </div>

                <div className="satellite-card">
                    <div className="sat-header">🌐 SATELLITE FEED</div>
                    <div className="sat-grid">
                        <div className="scan-line"></div>
                        <div className="focus-brackets">
                            <div className="br tl"></div>
                            <div className="br tr"></div>
                            <div className="br bl"></div>
                            <div className="br br"></div>
                        </div>
                    </div>
                    <div className="sat-coords">LAT: {coords.lat}  |  LNG: {coords.lng}</div>
                    <div className="sat-footer">IMG_SAT_V2_LIVE</div>
                </div>

            </div>
        </div>
    );
};
