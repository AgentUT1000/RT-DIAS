import { useState, useEffect, useCallback, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
const DEMO_MODE = false; // Kafka backend is now running!

// Demo data generators
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

/**
 * Custom hook to connect to RT-DIAS Kafka stream via WebSocket
 * Provides real-time disaster alerts from Kafka topics
 */
export function useKafkaStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [stats, setStats] = useState({
    tweets: 0,
    news: 0,
    sensors: 0,
    alerts: 0
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const demoIntervalRef = useRef(null);
  const maxEvents = 100; // Keep last 100 events in memory

  // Process incoming event (from WebSocket or demo)
  const processEvent = useCallback((topic, data) => {
    setEvents(prev => {
      const newEvents = [{ ...data, _topic: topic, _receivedAt: new Date().toISOString() }, ...prev];
      return newEvents.slice(0, maxEvents);
    });

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
  }, []);

  // Start demo mode with simulated events
  const startDemoMode = useCallback(() => {
    console.log('🎮 Starting Demo Mode - Simulating Kafka events');
    setIsConnected(true);
    setConnectionStatus('demo');

    demoIntervalRef.current = setInterval(() => {
      const { topic, event } = generateDemoEvent();
      processEvent(topic, event);
    }, 2000 + Math.random() * 3000); // Random interval 2-5 seconds
  }, [processEvent]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');

    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log('✅ Connected to RT-DIAS Kafka Stream');
        setIsConnected(true);
        setConnectionStatus('connected');
        // Clear demo mode if it was running
        if (demoIntervalRef.current) {
          clearInterval(demoIntervalRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'connection') {
            console.log('📡 Kafka topics available:', message.topics);
            return;
          }

          if (message.type === 'disaster_event') {
            const { topic, data } = message;
            processEvent(topic, data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('📴 Disconnected from Kafka stream');
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // If DEMO_MODE is enabled, start demo instead of reconnecting
        if (DEMO_MODE) {
          startDemoMode();
        } else {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        // Start demo mode on error if enabled
        if (DEMO_MODE && !demoIntervalRef.current) {
          wsRef.current?.close();
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      if (DEMO_MODE) {
        startDemoMode();
      }
    }
  }, [processEvent, startDemoMode]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setAlerts([]);
    setStats({ tweets: 0, news: 0, sensors: 0, alerts: 0 });
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // Try WebSocket first, fall back to demo mode
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    events,
    alerts,
    stats,
    connect,
    disconnect,
    clearEvents
  };
}

/**
 * Filter events by disaster type
 */
export function filterByDisasterType(events, type) {
  if (!type || type === 'all') return events;
  return events.filter(event => event.disaster?.type === type);
}

/**
 * Filter events by severity
 */
export function filterBySeverity(events, severity) {
  if (!severity || severity === 'all') return events;
  return events.filter(event => event.disaster?.severity === severity);
}

/**
 * Filter events by location
 */
export function filterByLocation(events, city) {
  if (!city || city === 'all') return events;
  return events.filter(event => 
    event.location?.city?.toLowerCase() === city.toLowerCase()
  );
}

export default useKafkaStream;
