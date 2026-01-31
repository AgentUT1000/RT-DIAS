import { useState, useMemo } from 'react';
import useKafkaStream, { filterByDisasterType, filterBySeverity } from '../hooks/useKafkaStream';
import './LiveEventFeed.css';

/**
 * Real-time event feed showing Kafka messages as they arrive
 */
function LiveEventFeed() {
  const { events, isConnected, clearEvents } = useKafkaStream();
  const [filter, setFilter] = useState({ type: 'all', severity: 'all' });

  const filteredEvents = useMemo(() => {
    let result = events;
    result = filterByDisasterType(result, filter.type);
    result = filterBySeverity(result, filter.severity);
    return result;
  }, [events, filter]);

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#16a34a'
    };
    return colors[severity] || '#6b7280';
  };

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

  const getTopicBadge = (topic) => {
    const badges = {
      raw_tweets: { label: 'Twitter', color: '#1da1f2' },
      raw_news: { label: 'News', color: '#9333ea' },
      sensor_data: { label: 'Sensor', color: '#059669' },
      processed_alerts: { label: 'Alert', color: '#dc2626' }
    };
    return badges[topic] || { label: 'Event', color: '#6b7280' };
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="live-event-feed">
      <div className="feed-header">
        <h3>
          <span className="live-dot" />
          Live Kafka Feed
        </h3>
        <div className="feed-controls">
          <select 
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="all">All Types</option>
            <option value="flood">🌊 Flood</option>
            <option value="cyclone">🌀 Cyclone</option>
            <option value="earthquake">🌍 Earthquake</option>
            <option value="fire">🔥 Fire</option>
            <option value="landslide">⛰️ Landslide</option>
          </select>
          <select
            value={filter.severity}
            onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={clearEvents} className="clear-btn">
            Clear
          </button>
        </div>
      </div>

      {!isConnected && (
        <div className="connection-warning">
          ⚠️ Not connected to Kafka stream. Start the backend with: <code>docker-compose up</code>
        </div>
      )}

      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            {isConnected 
              ? '⏳ Waiting for events...' 
              : '🔌 Connect to see real-time disaster data'}
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const topicBadge = getTopicBadge(event._topic);
            return (
              <div 
                key={event.id || index} 
                className="event-card"
                style={{ borderLeftColor: getSeverityColor(event.disaster?.severity) }}
              >
                <div className="event-header">
                  <span className="event-icon">
                    {getDisasterIcon(event.disaster?.type)}
                  </span>
                  <span 
                    className="topic-badge"
                    style={{ backgroundColor: topicBadge.color }}
                  >
                    {topicBadge.label}
                  </span>
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(event.disaster?.severity) }}
                  >
                    {event.disaster?.severity?.toUpperCase()}
                  </span>
                  <span className="event-time">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
                
                <div className="event-location">
                  📍 {event.location?.city}, {event.location?.state}
                </div>

                {event.content && (
                  <div className="event-content">
                    {event.content}
                  </div>
                )}

                {event.title && (
                  <div className="event-title">
                    📰 {event.title}
                  </div>
                )}

                {event.readings && (
                  <div className="sensor-readings">
                    {Object.entries(event.readings).map(([key, value]) => (
                      <span key={key} className="reading">
                        {key.replace(/_/g, ' ')}: <strong>{value}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {event.user && (
                  <div className="tweet-meta">
                    {event.user.handle} 
                    {event.user.verified && ' ✓'}
                    • {event.engagement?.retweets} RT
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LiveEventFeed;
