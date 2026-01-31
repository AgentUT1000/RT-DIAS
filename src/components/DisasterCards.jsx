import { useKafka } from '../context/KafkaContext';
import './DisasterCards.css';

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

const getSeverityColor = (severity) => {
  const colors = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#16a34a'
  };
  return colors[severity] || '#6b7280';
};

const Card = ({ disaster, onClick }) => {
  const severityColor = getSeverityColor(disaster.severity);
  const icon = getDisasterIcon(disaster.type);
  
  return (
    <div 
      className="disaster-card-wrapper" 
      onClick={() => onClick(disaster)} 
      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
    >
      <div className="disaster-card-glow" style={{ backgroundColor: severityColor }}></div>
      <div className="disaster-card" style={{ borderColor: severityColor }}>
        <div className="disaster-card-header">
          <span className="disaster-icon">{icon}</span>
          <span className="disaster-type">
            {disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}
          </span>
          <span className="disaster-separator">|</span>
          <span className="disaster-location">{disaster.location?.city}</span>
          <span 
            className="severity-badge" 
            style={{ backgroundColor: severityColor }}
          >
            {disaster.severity?.toUpperCase()}
          </span>
        </div>

        <div className="disaster-card-stats">
          <div className="stat">
            <span className="stat-value">{disaster.eventCount}</span>
            <span className="stat-label">Reports</span>
          </div>
          <div className="stat">
            <span className="stat-value">{disaster.sources?.length || 1}</span>
            <span className="stat-label">Sources</span>
          </div>
          <div className="stat">
            <span className="stat-value">{Math.round((disaster.confidence || 0.7) * 100)}%</span>
            <span className="stat-label">Confidence</span>
          </div>
        </div>

        <div className="disaster-card-footer">
          <span className="source-tags">
            {disaster.sources?.map(src => (
              <span key={src} className="source-tag">
                {src === 'raw_tweets' ? '🐦' : src === 'raw_news' ? '📰' : src === 'sensor_data' ? '📡' : '🚨'}
              </span>
            ))}
          </span>
          <span className="time-ago">
            {getTimeAgo(disaster.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

function getTimeAgo(timestamp) {
  if (!timestamp) return 'just now';
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export const DisasterCards = ({ onSelect }) => {
  const { activeDisasters, isConnected, connectionStatus } = useKafka();

  if (!isConnected && activeDisasters.length === 0) {
    return (
      <div className="cards-container empty-state">
        <div className="connecting-message">
          <div className="spinner"></div>
          <p>Connecting to Kafka stream...</p>
          <span className="status">{connectionStatus}</span>
        </div>
      </div>
    );
  }

  if (activeDisasters.length === 0) {
    return (
      <div className="cards-container empty-state">
        <div className="waiting-message">
          <span className="pulse-icon">📡</span>
          <p>Monitoring for disasters...</p>
          <span className="status">Events will appear here in real-time</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cards-container">
      {activeDisasters.map((disaster) => (
        <Card 
          key={disaster.key} 
          disaster={disaster} 
          onClick={onSelect}
        />
      ))}
    </div>
  );
};

