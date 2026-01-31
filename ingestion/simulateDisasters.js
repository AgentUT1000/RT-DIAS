import { createTopics, sendMessage, TOPICS } from './kafkaClient.js';

// Indian cities with disaster-prone areas
const LOCATIONS = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 }
];

const DISASTER_TYPES = [
  { type: 'flood', severity: ['low', 'medium', 'high', 'critical'], keywords: ['flood', 'waterlogging', 'submerged', 'inundation'] },
  { type: 'cyclone', severity: ['medium', 'high', 'critical'], keywords: ['cyclone', 'storm', 'wind', 'landfall'] },
  { type: 'earthquake', severity: ['low', 'medium', 'high', 'critical'], keywords: ['earthquake', 'tremor', 'seismic', 'magnitude'] },
  { type: 'fire', severity: ['low', 'medium', 'high'], keywords: ['fire', 'blaze', 'flames', 'burning'] },
  { type: 'landslide', severity: ['medium', 'high', 'critical'], keywords: ['landslide', 'mudslide', 'debris', 'collapse'] },
  { type: 'drought', severity: ['low', 'medium', 'high'], keywords: ['drought', 'water scarcity', 'crop failure'] },
  { type: 'heatwave', severity: ['low', 'medium', 'high'], keywords: ['heatwave', 'temperature', 'heat stroke'] }
];

// Generate random disaster event
function generateDisasterEvent(type = 'tweet') {
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const disaster = DISASTER_TYPES[Math.floor(Math.random() * DISASTER_TYPES.length)];
  const severity = disaster.severity[Math.floor(Math.random() * disaster.severity.length)];
  const keyword = disaster.keywords[Math.floor(Math.random() * disaster.keywords.length)];

  const baseEvent = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    location: {
      city: location.city,
      state: location.state,
      coordinates: {
        lat: location.lat + (Math.random() - 0.5) * 0.1,
        lng: location.lng + (Math.random() - 0.5) * 0.1
      }
    },
    disaster: {
      type: disaster.type,
      severity: severity,
      confidence: Math.random() * 0.3 + 0.7 // 0.7 - 1.0
    }
  };

  if (type === 'tweet') {
    return {
      ...baseEvent,
      source: 'twitter',
      content: generateTweetContent(location, disaster, keyword),
      user: {
        handle: `@user_${Math.random().toString(36).substr(2, 8)}`,
        followers: Math.floor(Math.random() * 10000),
        verified: Math.random() > 0.8
      },
      engagement: {
        retweets: Math.floor(Math.random() * 500),
        likes: Math.floor(Math.random() * 1000),
        replies: Math.floor(Math.random() * 100)
      }
    };
  } else if (type === 'news') {
    return {
      ...baseEvent,
      source: 'gdelt',
      title: generateNewsTitle(location, disaster),
      content: generateNewsContent(location, disaster),
      publisher: ['Times of India', 'NDTV', 'The Hindu', 'Indian Express', 'PTI'][Math.floor(Math.random() * 5)],
      url: `https://news.example.com/disaster/${baseEvent.id}`
    };
  } else if (type === 'sensor') {
    return {
      ...baseEvent,
      source: 'imd',
      sensorType: disaster.type === 'earthquake' ? 'seismograph' : disaster.type === 'flood' ? 'water_level' : 'weather_station',
      readings: generateSensorReadings(disaster.type),
      stationId: `IMD_${location.city.toUpperCase().substr(0, 3)}_${Math.floor(Math.random() * 100)}`
    };
  }
}

function generateTweetContent(location, disaster, keyword) {
  const templates = [
    `🚨 URGENT: ${keyword} reported in ${location.city}! Stay safe everyone. #${disaster.type} #DisasterAlert`,
    `Heavy ${keyword} situation in ${location.city}, ${location.state}. Authorities have been notified. #RT_DIAS`,
    `Breaking: ${location.city} facing severe ${disaster.type} conditions. Emergency services responding. Stay indoors!`,
    `${keyword} alert for ${location.city} area. Please follow official guidelines. #IndiaDisasterAlert`,
    `🆘 Need help! ${disaster.type} situation worsening in ${location.city}. RT to spread awareness! #NDRF`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateNewsTitle(location, disaster) {
  const templates = [
    `${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)} Alert: ${location.city} on High Alert`,
    `${location.state}: ${disaster.type.toUpperCase()} Affects Thousands in ${location.city} Region`,
    `NDRF Teams Deployed as ${disaster.type} Hits ${location.city}`,
    `Breaking: ${location.city} Declares Emergency Amid ${disaster.type} Threat`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateNewsContent(location, disaster) {
  return `Authorities in ${location.city}, ${location.state} have issued a ${disaster.type} warning as conditions continue to deteriorate. The National Disaster Response Force (NDRF) has been alerted and teams are being mobilized. Residents are advised to follow safety protocols and stay tuned to official channels for updates. The State Disaster Management Authority (SDMA) is coordinating relief efforts.`;
}

function generateSensorReadings(disasterType) {
  switch (disasterType) {
    case 'earthquake':
      return {
        magnitude: (Math.random() * 4 + 2).toFixed(1),
        depth_km: Math.floor(Math.random() * 50 + 5),
        intensity: ['II', 'III', 'IV', 'V', 'VI'][Math.floor(Math.random() * 5)]
      };
    case 'flood':
      return {
        water_level_m: (Math.random() * 5 + 1).toFixed(2),
        flow_rate_cumecs: Math.floor(Math.random() * 5000 + 500),
        danger_level: Math.random() > 0.5 ? 'above' : 'approaching'
      };
    case 'cyclone':
      return {
        wind_speed_kmph: Math.floor(Math.random() * 150 + 50),
        pressure_hpa: Math.floor(Math.random() * 50 + 950),
        category: ['1', '2', '3', '4'][Math.floor(Math.random() * 4)]
      };
    default:
      return {
        temperature_c: Math.floor(Math.random() * 20 + 25),
        humidity_percent: Math.floor(Math.random() * 50 + 30),
        rainfall_mm: Math.floor(Math.random() * 100)
      };
  }
}

// Main simulation loop
async function startSimulation() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║          RT-DIAS Disaster Data Simulator                 ║
║      Generating realistic disaster events for Kafka      ║
╚══════════════════════════════════════════════════════════╝
  `);

  // Create topics first
  await createTopics();

  // Wait for Kafka to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('🚀 Starting disaster event simulation...\n');

  // Simulate events at random intervals
  async function simulateEvents() {
    try {
      // 60% chance of tweet, 25% chance of news, 15% chance of sensor data
      const rand = Math.random();
      
      if (rand < 0.6) {
        const event = generateDisasterEvent('tweet');
        await sendMessage(TOPICS.RAW_TWEETS, event);
      } else if (rand < 0.85) {
        const event = generateDisasterEvent('news');
        await sendMessage(TOPICS.RAW_NEWS, event);
      } else {
        const event = generateDisasterEvent('sensor');
        await sendMessage(TOPICS.SENSOR_DATA, event);
      }

      // Also randomly generate processed alerts (simulating Flink output)
      if (Math.random() > 0.7) {
        const alert = {
          id: `alert_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'DISASTER_ALERT',
          ...generateDisasterEvent('tweet'),
          verified: Math.random() > 0.5,
          sources_count: Math.floor(Math.random() * 10 + 1),
          nlp_entities: ['location', 'disaster_type', 'severity'],
          action_required: true
        };
        await sendMessage(TOPICS.PROCESSED_ALERTS, alert);
      }

    } catch (error) {
      console.error('Error simulating event:', error);
    }

    // Schedule next event (8-20 seconds - slower for better UX)
    const nextDelay = Math.floor(Math.random() * 12000 + 8000);
    setTimeout(simulateEvents, nextDelay);
  }

  // Start the simulation
  simulateEvents();
}

// Run
startSimulation().catch(console.error);
