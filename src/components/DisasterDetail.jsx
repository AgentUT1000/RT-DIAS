import React, { useState, useEffect } from 'react';
import { SocialFeed } from './SocialFeed';
import { getSeverityColor, getSeverityLabel, getDisasterIcon, formatTimeAgo } from '../utils/helpers';

export const DisasterDetail = ({ onBack, data }) => {
    const [coords, setCoords] = useState({ lat: data.coordinates?.lat || 30.37, lng: data.coordinates?.lng || 79.31 });
    const [selectedPlatform, setSelectedPlatform] = useState(null);

    const severityColor = getSeverityColor(data.severity);

    // Simulate updating telemetry/coordinates
    useEffect(() => {
        const interval = setInterval(() => {
            setCoords({
                lat: ((data.coordinates?.lat || 30) + Math.random() * 0.01).toFixed(4),
                lng: ((data.coordinates?.lng || 79) + Math.random() * 0.01).toFixed(4)
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [data.coordinates]);

    if (selectedPlatform) {
        return (
            <SocialFeed
                platform={selectedPlatform}
                onClose={() => setSelectedPlatform(null)}
            />
        );
    }

    return (
        <div className="detail-container">
            <button className="back-btn" onClick={onBack}>
                ← BACK
            </button>

            <div className="detail-header-section">
                <div className="detail-severity-badge" style={{ backgroundColor: `${severityColor}20`, color: severityColor }}>
                    <span className="severity-dot" style={{ backgroundColor: severityColor }}></span>
                    {getSeverityLabel(data.severity)} ALERT
                </div>
                <h1 className="detail-title">
                    <span className="detail-icon">{getDisasterIcon(data.type)}</span>
                    {data.type} <span className="detail-divider">/</span> {data.location}
                </h1>
                <p className="detail-subtitle">{data.district || 'District'}</p>
                <p className="detail-time">Reported {formatTimeAgo(data.reportedAt)} • Last updated {formatTimeAgo(data.lastUpdate)}</p>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-pill">
                    <div className="stat-icon-box orange">🌡</div>
                    <div className="stat-info">
                        <span className="stat-label">TEMP</span>
                        <span className="stat-value">{data.stats?.temp || '8°C'}</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon-box blue">💨</div>
                    <div className="stat-info">
                        <span className="stat-label">WIND</span>
                        <span className="stat-value">{data.stats?.wind || '45 km/h'}</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon-box green">👁</div>
                    <div className="stat-info">
                        <span className="stat-label">VISIBILITY</span>
                        <span className="stat-value">{data.stats?.visibility || '1.2 km'}</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon-box purple">⏲</div>
                    <div className="stat-info">
                        <span className="stat-label">PRESSURE</span>
                        <span className="stat-value">{data.stats?.pressure || '1004 hPa'}</span>
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
