# RT-DIAS: Real-Time Disaster Information Aggregation System

> 🌊 A production-ready, real-time disaster monitoring and alerting system powered by **Apache Kafka**, **React**, and **AI/ML** services.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-2.8+-red.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         INGESTION LAYER                              │
│   [Twitter/X API]  [GDELT News]  [IMD Sensors]  [Web Scrapers]       │
└────────────────────────────┬─────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    STREAMING BACKBONE (Apache Kafka)                  │
│  Topics: raw_tweets | raw_news | sensor_data | processed_alerts      │
└────────────────────────────┬─────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      PROCESSING LAYER                                │
│   [Apache Flink]  →  [NLP Service]  →  [Vision AI]  →  [Geoparsing] │
└────────────────────────────┬─────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       STORAGE LAYER                                  │
│   [PostgreSQL + PostGIS]     [MinIO/S3]      [CouchDB Sync]         │
└────────────────────────────┬─────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                                │
│              [React Dashboard]  ←  [WebSocket]  ←  [API Gateway]    │
└──────────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (for Kafka, backend services)
- **Node.js 20+** (for frontend development)

### 1. Start Kafka & Backend Services

```bash
# Start all services (Kafka, Zookeeper, Backend, Ingestion)
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Start Frontend Development Server

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### 3. Access the Application

| Service          | URL                          |
|------------------|------------------------------|
| 🌐 Dashboard     | http://localhost:5173        |
| 🔌 WebSocket API | ws://localhost:3001          |
| 📊 Kafka UI      | http://localhost:8080        |
| 🩺 Health Check  | http://localhost:3001/api/health |

---

## 📁 Project Structure

```
RT-DIAS/
├── src/                      # React Frontend
│   ├── components/
│   │   ├── KafkaStatus.jsx   # Real-time Kafka connection indicator
│   │   ├── LiveEventFeed.jsx # Live disaster event stream
│   │   ├── DisasterCards.jsx # Disaster summary cards
│   │   └── ...
│   ├── hooks/
│   │   └── useKafkaStream.js # WebSocket hook for Kafka events
│   └── ...
│
├── backend/                  # Node.js Backend
│   ├── server.js             # Kafka Consumer + WebSocket Server
│   ├── package.json
│   └── Dockerfile
│
├── ingestion/                # Data Ingestion Service
│   ├── kafkaClient.js        # Kafka producer utilities
│   ├── simulateDisasters.js  # Disaster event simulator
│   ├── producers/            # Source-specific producers
│   └── Dockerfile
│
├── docker-compose.yml        # Full stack orchestration
└── README.md
```

---

## 🔥 Kafka Topics

| Topic               | Description                                    | Producer           |
|---------------------|------------------------------------------------|--------------------|
| `raw_tweets`        | Raw Twitter/X posts about disasters            | Twitter Connector  |
| `raw_news`          | News articles from GDELT and scrapers          | News Connector     |
| `sensor_data`       | IMD weather stations, seismograph readings     | Sensor Connector   |
| `processed_alerts`  | NLP-processed and verified disaster alerts     | Flink Processor    |
| `verified_incidents`| Human-verified incidents for dashboard         | Verification Service|

---

## 🛠️ Development

### Run Individual Services

```bash
# Backend only (requires Kafka running)
cd backend && npm install && npm run dev

# Ingestion simulator only
cd ingestion && npm install && npm run simulate

# Frontend only
npm run dev
```

### Environment Variables

Create a `.env` file for the frontend:

```env
VITE_WS_URL=ws://localhost:3001
VITE_API_URL=http://localhost:3001/api
```

---

## 🔌 API Endpoints

### REST API

| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | `/api/health`   | System health status     |
| GET    | `/api/topics`   | Available Kafka topics   |
| GET    | `/api/alerts`   | Recent disaster alerts   |

### WebSocket Events

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001');

// Receive events
ws.onmessage = (event) => {
  const { type, topic, data } = JSON.parse(event.data);
  // type: 'disaster_event'
  // topic: 'raw_tweets' | 'raw_news' | 'sensor_data' | 'processed_alerts'
  // data: Event payload
};
```

---

## 📊 Sample Event Payloads

### Tweet Event
```json
{
  "id": "tweet_1706789234_abc123",
  "timestamp": "2026-01-31T10:30:00Z",
  "source": "twitter",
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "coordinates": { "lat": 19.076, "lng": 72.877 }
  },
  "disaster": {
    "type": "flood",
    "severity": "high",
    "confidence": 0.92
  },
  "content": "🚨 Heavy flooding in Mumbai! Water levels rising. #MumbaiFloods"
}
```

### Sensor Data Event
```json
{
  "id": "sensor_1706789234_xyz456",
  "source": "imd",
  "sensorType": "water_level",
  "stationId": "IMD_MUM_042",
  "readings": {
    "water_level_m": 3.45,
    "flow_rate_cumecs": 2500,
    "danger_level": "above"
  }
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Apache Kafka** - Distributed streaming platform
- **Confluent** - Kafka Docker images
- **IMD (India Meteorological Department)** - Weather data reference
- **NDRF** - National Disaster Response Force guidelines

---

<p align="center">
  <strong>Built with ❤️ for Disaster Resilience</strong><br>
  <em>RT-DIAS - Real-Time Disaster Information Aggregation System</em>
</p>
