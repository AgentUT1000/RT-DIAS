import { useApp } from '../context/AppContext';
import { getSeverityColor, getSeverityLabel, getDisasterIcon, formatTimeAgo, formatNumber } from '../utils/helpers';

const Card = ({ disaster, onClick }) => {
    const severityColor = getSeverityColor(disaster.severity);
    const icon = getDisasterIcon(disaster.type);

    return (
        <div className="card-wrapper" onClick={onClick} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
            <div className="card-glow" style={{ background: `linear-gradient(90deg, ${severityColor}40, ${severityColor}20)` }}></div>
            <div className="card">
                {/* Severity Badge */}
                <div className="card-severity-badge" style={{ backgroundColor: `${severityColor}20`, color: severityColor }}>
                    <span className="severity-dot" style={{ backgroundColor: severityColor }}></span>
                    {getSeverityLabel(disaster.severity)}
                </div>

                {/* Header with Icon and Type */}
                <div className="card-header">
                    <span className="disaster-icon">{icon}</span>
                    <span className="disaster-type">{disaster.type}</span>
                    <span className="separator">|</span>
                    <span className="location">{disaster.location}</span>
                </div>

                {/* District/Sub-location */}
                <div className="card-district">{disaster.district}</div>

                {/* Stats Grid */}
                <div className="card-stats">
                    <div className="stat-item">
                        <span className="stat-label">Severity Index</span>
                        <span className="stat-value" style={{ color: severityColor }}>{disaster.severityIndex.toFixed(1)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Affected</span>
                        <span className="stat-value">{formatNumber(disaster.affectedPopulation)}</span>
                    </div>
                </div>

                {/* Status and Time */}
                <div className="card-footer">
                    <span className={`status-tag ${disaster.status}`}>
                        {disaster.status === 'active' ? '● ACTIVE' : '○ CONTAINED'}
                    </span>
                    <span className="time-ago">{formatTimeAgo(disaster.reportedAt)}</span>
                </div>
            </div>
        </div>
    );
};

export const DisasterCards = () => {
    const { disasters, setSelectedDisaster } = useApp();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Active Disasters</h2>
                <p className="dashboard-subtitle">Monitoring {disasters.length} incidents across India</p>
            </div>

            <div className="cards-grid">
                {disasters.map((disaster) => (
                    <Card
                        key={disaster.id}
                        disaster={disaster}
                        onClick={() => setSelectedDisaster(disaster)}
                    />
                ))}
            </div>
        </div>
    );
};
