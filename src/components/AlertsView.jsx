import { useApp } from '../context/AppContext';
import { formatTimeAgo, getSeverityColor } from '../utils/helpers';

export const AlertsView = () => {
    const { alerts, disasters } = useApp();

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical':
                return '🚨';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case 'critical':
                return '#ef4444';
            case 'warning':
                return '#f97316';
            case 'info':
                return '#3b82f6';
            default:
                return '#64748b';
        }
    };

    return (
        <div className="alerts-container">
            <div className="alerts-header">
                <h2 className="alerts-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    Alerts & Notifications
                </h2>
                <span className="alerts-count">{alerts.length} active alerts</span>
            </div>

            <div className="alerts-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Critical</button>
                <button className="filter-btn">Warnings</button>
                <button className="filter-btn">Info</button>
            </div>

            <div className="alerts-list">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="alert-card"
                        style={{ borderLeftColor: getAlertColor(alert.type) }}
                    >
                        <div className="alert-icon" style={{ backgroundColor: `${getAlertColor(alert.type)}20` }}>
                            {getAlertIcon(alert.type)}
                        </div>
                        <div className="alert-content">
                            <div className="alert-header">
                                <h4 className="alert-title">{alert.title}</h4>
                                <span className="alert-time">{formatTimeAgo(alert.timestamp)}</span>
                            </div>
                            <p className="alert-message">{alert.message}</p>
                            <span className="alert-location">📍 {alert.location}</span>
                        </div>
                        <button className="alert-dismiss" aria-label="Dismiss">×</button>
                    </div>
                ))}
            </div>

            <div className="alerts-section">
                <h3 className="section-title">Recent Activity</h3>
                <div className="activity-list">
                    {disasters.slice(0, 3).map((disaster) => (
                        <div key={disaster.id} className="activity-item">
                            <div
                                className="activity-indicator"
                                style={{ backgroundColor: getSeverityColor(disaster.severity) }}
                            ></div>
                            <div className="activity-content">
                                <p className="activity-text">
                                    <strong>{disaster.type}</strong> reported in {disaster.location}
                                </p>
                                <span className="activity-time">{formatTimeAgo(disaster.reportedAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
