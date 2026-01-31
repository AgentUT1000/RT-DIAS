import { useState, useEffect } from 'react';
import { useKafka } from '../context/KafkaContext';
import './KafkaStatus.css';

/**
 * Real-time Kafka connection status indicator
 * Shows connection state and live event statistics
 */
function KafkaStatus() {
  const { isConnected, connectionStatus, stats, activeDisasters } = useKafka();
  const [pulse, setPulse] = useState(false);

  // Pulse animation when new events arrive
  useEffect(() => {
    const total = stats.tweets + stats.news + stats.sensors + stats.alerts;
    if (total > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [stats]);

  const statusColors = {
    connected: '#10b981',
    connecting: '#f59e0b',
    disconnected: '#6b7280',
    error: '#ef4444'
  };

  return (
    <div className="kafka-status">
      <div className="kafka-status-header">
        <div 
          className={`status-indicator ${pulse ? 'pulse' : ''}`}
          style={{ backgroundColor: statusColors[connectionStatus] }}
        />
        <span className="status-text">
          Kafka: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
        </span>
        {activeDisasters.length > 0 && (
          <span className="active-disasters-badge">
            {activeDisasters.length} Active Disasters
          </span>
        )}
      </div>

      {isConnected && (
        <div className="kafka-stats">
          <div className="stat-item">
            <span className="stat-icon">🐦</span>
            <span className="stat-value">{stats.tweets}</span>
            <span className="stat-label">Tweets</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📰</span>
            <span className="stat-value">{stats.news}</span>
            <span className="stat-label">News</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📡</span>
            <span className="stat-value">{stats.sensors}</span>
            <span className="stat-label">Sensors</span>
          </div>
          <div className="stat-item alert">
            <span className="stat-icon">🚨</span>
            <span className="stat-value">{stats.alerts}</span>
            <span className="stat-label">Alerts</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default KafkaStatus;
