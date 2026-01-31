import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { Kafka } from 'kafkajs';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'rtdias-backend',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 1000,
    retries: 10
  }
});

const consumer = kafka.consumer({ groupId: 'rtdias-dashboard-group' });

// Store connected WebSocket clients
const clients = new Set();

// Kafka Topics for RT-DIAS
const TOPICS = {
  RAW_TWEETS: 'raw_tweets',
  RAW_NEWS: 'raw_news',
  SENSOR_DATA: 'sensor_data',
  PROCESSED_ALERTS: 'processed_alerts',
  VERIFIED_INCIDENTS: 'verified_incidents'
};

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  console.log('📡 New dashboard client connected');
  clients.add(ws);

  // Send welcome message with current system status
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to RT-DIAS Kafka Stream',
    topics: Object.values(TOPICS),
    timestamp: new Date().toISOString()
  }));

  ws.on('close', () => {
    console.log('📴 Dashboard client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast message to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
    }
  });
}

// Kafka Consumer - Listen to all disaster-related topics
async function startKafkaConsumer() {
  try {
    await consumer.connect();
    console.log('✅ Connected to Kafka broker');

    // Subscribe to all topics
    await consumer.subscribe({ 
      topics: Object.values(TOPICS), 
      fromBeginning: false 
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        
        try {
          const data = JSON.parse(value);
          
          console.log(`📨 [${topic}] Received:`, data.id || data.title || 'event');

          // Broadcast to all connected dashboard clients
          broadcast({
            type: 'disaster_event',
            topic: topic,
            partition: partition,
            offset: message.offset,
            timestamp: message.timestamp,
            data: data
          });

        } catch (parseError) {
          console.error('Failed to parse message:', parseError);
        }
      },
    });

  } catch (error) {
    console.error('❌ Kafka Consumer Error:', error);
    // Retry connection after 5 seconds
    setTimeout(startKafkaConsumer, 5000);
  }
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    kafka: 'connected',
    clients: clients.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/topics', (req, res) => {
  res.json({ topics: TOPICS });
});

// Get recent alerts (would connect to PostgreSQL in production)
app.get('/api/alerts', (req, res) => {
  res.json({
    message: 'Connect to PostgreSQL for historical alerts',
    realtimeEndpoint: 'ws://localhost:3001'
  });
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           RT-DIAS Backend Server Started                 ║
╠══════════════════════════════════════════════════════════╣
║  🚀 HTTP API:    http://localhost:${PORT}                   ║
║  🔌 WebSocket:   ws://localhost:${PORT}                     ║
║  📊 Kafka UI:    http://localhost:8080                   ║
╚══════════════════════════════════════════════════════════╝
  `);

  // Start Kafka consumer
  await startKafkaConsumer();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await consumer.disconnect();
  server.close();
  process.exit(0);
});
