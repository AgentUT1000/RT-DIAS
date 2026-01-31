import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

// Kafka Context for sharing state across components
const KafkaContext = createContext(null);

// Indian cities data
const LOCATIONS = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 }
];

const DISASTER_TYPES = ['flood', 'cyclone', 'earthquake', 'fire', 'landslide', 'heatwave'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const TOPICS = ['raw_tweets', 'raw_news', 'sensor_data', 'processed_alerts'];

function generateDemoEvent() {
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const disasterType = DISASTER_TYPES[Math.floor(Math.random() * DISASTER_TYPES.length)];
  const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  const tweetTemplates = [
    `🚨 URGENT: ${disasterType} reported in ${location.city}! Stay safe everyone.`,
    `Heavy ${disasterType} situation in ${location.city}, ${location.state}. Authorities notified.`,
    `Breaking: ${location.city} facing severe ${disasterType} conditions. Stay indoors!`,
    `🆘 Need help! ${disasterType} situation worsening in ${location.city}. RT to spread awareness!`
  ];

  const event = {
    id: `${topic}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    location: {
      city: location.city,
      state: location.state,
      coordinates: { lat: location.lat, lng: location.lng }
    },
    disaster: {
      type: disasterType,
      severity: severity,
      confidence: Math.random() * 0.3 + 0.7
    },
    _topic: topic
  };

  if (topic === 'raw_tweets') {
    event.source = 'twitter';
    event.content = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    event.user = { handle: `@user_${Math.random().toString(36).substr(2, 6)}`, verified: Math.random() > 0.8 };
    event.engagement = { retweets: Math.floor(Math.random() * 500), likes: Math.floor(Math.random() * 1000) };
  } else if (topic === 'raw_news') {
    event.source = 'gdelt';
    event.title = `${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)} Alert: ${location.city} on High Alert`;
    event.publisher = ['Times of India', 'NDTV', 'The Hindu', 'Indian Express'][Math.floor(Math.random() * 4)];
  } else if (topic === 'sensor_data') {
    event.source = 'imd';
    event.sensorType = disasterType === 'earthquake' ? 'seismograph' : 'water_level';
    event.stationId = `IMD_${location.city.substr(0, 3).toUpperCase()}_${Math.floor(Math.random() * 100)}`;
    event.readings = disasterType === 'earthquake' 
      ? { magnitude: (Math.random() * 4 + 2).toFixed(1), depth_km: Math.floor(Math.random() * 50 + 5) }
      : { water_level_m: (Math.random() * 5 + 1).toFixed(2), danger_level: 'above' };
  }

  return { topic, event };
}

// Kafka Provider Component
export function KafkaProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ tweets: 0, news: 0, sensors: 0, alerts: 0 });
  
  // Aggregated disaster data for dashboard
  const [activeDisasters, setActiveDisasters] = useState([]);
  
  const wsRef = useRef(null);
  const demoIntervalRef = useRef(null);
  const maxEvents = 100;

  // Process event and update all state
  const processEvent = useCallback((topic, data) => {
    const eventWithMeta = { ...data, _topic: topic, _receivedAt: new Date().toISOString() };
    
    // Update events list
    setEvents(prev => [eventWithMeta, ...prev].slice(0, maxEvents));

    // Update stats
    setStats(prev => {
      const newStats = { ...prev };
      if (topic === 'raw_tweets') newStats.tweets++;
      else if (topic === 'raw_news') newStats.news++;
      else if (topic === 'sensor_data') newStats.sensors++;
      else if (topic === 'processed_alerts') {
        newStats.alerts++;
        setAlerts(prevAlerts => [data, ...prevAlerts].slice(0, 20));
      }
      return newStats;
    });

    // Update active disasters (aggregate by location + type)
    setActiveDisasters(prev => {
      const key = `${data.disaster?.type}_${data.location?.city}`;
      const existing = prev.find(d => d.key === key);
      
      if (existing) {
        // Update existing disaster
        return prev.map(d => {
          if (d.key === key) {
            return {
              ...d,
              eventCount: d.eventCount + 1,
              latestEvent: eventWithMeta,
              severity: data.disaster?.severity === 'critical' ? 'critical' : 
                       (data.disaster?.severity === 'high' && d.severity !== 'critical') ? 'high' : d.severity,
              sources: [...new Set([...d.sources, topic])],
              updatedAt: new Date().toISOString()
            };
          }
          return d;
        });
      } else {
        // Add new disaster
        const newDisaster = {
          key,
          id: data.id,
          type: data.disaster?.type || 'unknown',
          location: data.location || { city: 'Unknown', state: 'Unknown' },
          severity: data.disaster?.severity || 'medium',
          confidence: data.disaster?.confidence || 0.5,
          eventCount: 1,
          sources: [topic],
          latestEvent: eventWithMeta,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return [newDisaster, ...prev].slice(0, 20);
      }
    });
  }, []);

  // Start demo mode
  const startDemoMode = useCallback(() => {
    console.log('🎮 Starting Demo Mode - Simulating Kafka events');
    setIsConnected(true);
    setConnectionStatus('demo');

    demoIntervalRef.current = setInterval(() => {
      const { topic, event } = generateDemoEvent();
      processEvent(topic, event);
    }, 2000 + Math.random() * 3000);
  }, [processEvent]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');

    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log('✅ Connected to RT-DIAS Kafka Stream');
        setIsConnected(true);
        setConnectionStatus('connected');
        if (demoIntervalRef.current) {
          clearInterval(demoIntervalRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'disaster_event') {
            processEvent(message.topic, message.data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        startDemoMode();
      };

      wsRef.current.onerror = () => {
        setConnectionStatus('error');
        if (!demoIntervalRef.current) {
          wsRef.current?.close();
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      startDemoMode();
    }
  }, [processEvent, startDemoMode]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Clear all data
  const clearEvents = useCallback(() => {
    setEvents([]);
    setAlerts([]);
    setActiveDisasters([]);
    setStats({ tweets: 0, news: 0, sensors: 0, alerts: 0 });
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const value = {
    isConnected,
    connectionStatus,
    events,
    alerts,
    stats,
    activeDisasters,
    connect,
    disconnect,
    clearEvents
  };

  return (
    <KafkaContext.Provider value={value}>
      {children}
    </KafkaContext.Provider>
  );
}

// Hook to use Kafka context
export function useKafka() {
  const context = useContext(KafkaContext);
  if (!context) {
    throw new Error('useKafka must be used within a KafkaProvider');
  }
  return context;
}

export default KafkaProvider;
