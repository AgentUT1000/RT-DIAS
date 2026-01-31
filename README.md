# RT-DIAS: Real-Time Disaster Information Aggregation System

<p align="center">
  <img src="https://img.shields.io/badge/Apache%20Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
</p>

<p align="center">
  <strong>🌊 A production-ready, real-time disaster monitoring and alerting system for India</strong><br>
  Powered by Apache Kafka streaming, React 19 dashboard, and microservices architecture
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [API Reference](#-api-reference)
- [Kafka Topics](#-kafka-topics)
- [Contributing](#-contributing)

---

## 🎯 Overview

**RT-DIAS** (Real-Time Disaster Information Aggregation System) is a comprehensive disaster monitoring platform that aggregates data from multiple sources (social media, news, government sensors) and provides real-time alerts to emergency responders and citizens.

### Problem Statement
During disasters, information is scattered across Twitter, news sites, and government portals. Emergency responders need a **single unified dashboard** with real-time updates.

### Solution
RT-DIAS uses **Apache Kafka** as a central streaming backbone to:
1. **Ingest** data from multiple sources simultaneously
2. **Process** and classify disaster events by type and severity
3. **Deliver** real-time alerts via WebSocket to dashboards

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔄 **Real-Time Streaming** | Apache Kafka processes thousands of events/second |
| 🌐 **Multi-Source Ingestion** | Twitter, News (GDELT), IMD Sensors, Web Scrapers |
| 🎯 **Live Dashboard** | React 19 with WebSocket for instant updates |
| 🗺️ **India-Focused** | 10+ major cities with disaster-prone area mapping |
| 📊 **Kafka UI** | Visual monitoring of all Kafka topics and messages |
| 🐳 **Docker Ready** | One command to start entire stack |
| 🔌 **WebSocket API** | Real-time event streaming to any client |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA SOURCES                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Twitter/X│  │  GDELT  │  │   IMD   │  │  USGS   │  │Scrapers │       │
│  │   API   │  │  News   │  │ Sensors │  │Earthquake│ │         │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
└───────┼────────────┼────────────┼────────────┼────────────┼─────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     INGESTION LAYER (Kafka Producers)                   │
│                         ingestion/simulateDisasters.js                  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ███ APACHE KAFKA CLUSTER ███                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │  raw_tweets  │ │   raw_news   │ │ sensor_data  │ │processed_alerts│  │
│  │   (Topic)    │ │   (Topic)    │ │   (Topic)    │ │    (Topic)     │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────────┘  │
│                         Zookeeper :2181                                 │
│                         Broker    :9092                                 │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICE (Kafka Consumer)                    │
│                          backend/server.js                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  KafkaJS Consumer  →  Process Events  →  WebSocket Broadcast    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                         Express API :3001                               │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  │ WebSocket (ws://localhost:3001)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      REACT DASHBOARD (Frontend)                         │
│                          src/components/                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │KafkaStatus  │ │LiveEventFeed│ │DisasterCards│ │DisasterDetail│      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│                         Vite Dev Server :5173                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend & Streaming
| Technology | Purpose |
|------------|---------|
| **Apache Kafka 7.5** | Distributed event streaming platform |
| **Zookeeper** | Kafka cluster coordination |
| **KafkaJS** | Node.js Kafka client library |
| **Express.js** | REST API server |
| **WebSocket (ws)** | Real-time bidirectional communication |
| **Docker Compose** | Container orchestration |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | Latest React with compiler optimization |
| **Vite 7** | Next-gen frontend build tool |
| **CSS3** | Custom styling with animations |

### Monitoring
| Technology | Purpose |
|------------|---------|
| **Kafka UI** | Visual Kafka topic monitoring (port 8080) |

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/AgentUT1000/RT-DIAS.git
cd RT-DIAS
git checkout Test-branch-1
```

### Step 2: Start Kafka & Backend Services

```bash
# Start all Docker services (Kafka, Zookeeper, Backend, Ingestion)
docker compose up -d

# Verify all services are running
docker compose ps
```

You should see 5 containers running:
- `rtdias-zookeeper`
- `rtdias-kafka`
- `rtdias-kafka-ui`
- `rtdias-backend`
- `rtdias-ingestion`

### Step 3: Start Frontend

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### Step 4: Open the Application

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Dashboard** | http://localhost:5173 | Main React application |
| 📊 **Kafka UI** | http://localhost:8080 | Monitor Kafka topics |
| 🔌 **Backend API** | http://localhost:3001/api/health | Health check |
| 📡 **WebSocket** | ws://localhost:3001 | Real-time events |

---

## 📁 Project Structure

```
RT-DIAS/
│
├── 📂 src/                          # React Frontend
│   ├── 📂 components/
│   │   ├── KafkaStatus.jsx          # Shows Kafka connection status
│   │   ├── KafkaStatus.css
│   │   ├── LiveEventFeed.jsx        # Real-time event stream display
│   │   ├── LiveEventFeed.css
│   │   ├── DisasterCards.jsx        # Disaster summary cards
│   │   ├── DisasterDetail.jsx       # Detailed disaster view
│   │   ├── Layout.jsx               # Main layout component
│   │   ├── Header.jsx               # Top navigation
│   │   ├── Sidebar.jsx              # Side navigation
│   │   └── BackgroundAnimation.jsx  # Animated background
│   │
│   ├── 📂 hooks/
│   │   └── useKafkaStream.js        # WebSocket hook for Kafka events
│   │
│   ├── App.jsx                      # Root component
│   ├── App.css                      # Global styles
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Base styles
│
├── 📂 backend/                      # Node.js Backend Service
│   ├── server.js                    # Kafka Consumer + WebSocket + Express
│   ├── package.json                 # Backend dependencies
│   └── Dockerfile                   # Docker build instructions
│
├── 📂 ingestion/                    # Data Ingestion Service
│   ├── kafkaClient.js               # Kafka producer utilities
│   ├── simulateDisasters.js         # Disaster event generator
│   ├── index.js                     # Entry point
│   ├── package.json                 # Ingestion dependencies
│   └── Dockerfile                   # Docker build instructions
│
├── 📂 public/                       # Static assets
│
├── docker-compose.yml               # Docker orchestration config
├── package.json                     # Frontend dependencies
├── vite.config.js                   # Vite configuration
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## ⚙️ How It Works

### Data Flow

```
1️⃣ INGESTION (simulateDisasters.js)
   │
   │  Generates realistic disaster events:
   │  - Tweets about floods, cyclones, earthquakes
   │  - News articles from major publications
   │  - Sensor data from IMD stations
   │
   ▼
2️⃣ KAFKA BROKER
   │
   │  Routes messages to appropriate topics:
   │  - raw_tweets → Twitter-like posts
   │  - raw_news → News articles
   │  - sensor_data → Government sensor readings
   │  - processed_alerts → Verified alerts
   │
   ▼
3️⃣ BACKEND CONSUMER (server.js)
   │
   │  - Subscribes to all Kafka topics
   │  - Parses and validates messages
   │  - Broadcasts to WebSocket clients
   │
   ▼
4️⃣ REACT DASHBOARD
   │
   │  - useKafkaStream hook connects via WebSocket
   │  - LiveEventFeed displays real-time events
   │  - KafkaStatus shows connection health
   │
   ▼
5️⃣ USER SEES REAL-TIME DISASTER ALERTS! 🚨
```

---

## 🔌 API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health status |
| GET | `/api/topics` | List available Kafka topics |

### WebSocket Events

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001');

// Receive events
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  // message structure:
  // {
  //   type: 'disaster_event',
  //   topic: 'raw_tweets' | 'raw_news' | 'sensor_data' | 'processed_alerts',
  //   data: { ... event payload ... }
  // }
};
```

---

## 📊 Kafka Topics

| Topic | Description | Event Type |
|-------|-------------|------------|
| `raw_tweets` | Social media posts about disasters | Tweet events |
| `raw_news` | News articles from GDELT/scrapers | News events |
| `sensor_data` | IMD weather/seismic readings | Sensor events |
| `processed_alerts` | AI-verified disaster alerts | Alert events |
| `verified_incidents` | Human-verified incidents | Incident events |

### Sample Event Payloads

**Tweet Event:**
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
  "content": "🚨 Heavy flooding in Mumbai! Stay safe! #MumbaiFloods"
}
```

**Sensor Event:**
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

## 🛑 Stopping the Application

```bash
# Stop all Docker containers
docker compose down

# Stop frontend (Ctrl+C in terminal)

# Remove all data (including Kafka messages)
docker compose down -v
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

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Apache Kafka** - Distributed streaming platform
- **Confluent** - Kafka Docker images
- **IMD (India Meteorological Department)** - Weather data reference
- **NDRF** - National Disaster Response Force guidelines

---

<p align="center">
  <strong>Built with ❤️ for Disaster Resilience in India</strong><br>
  <em>RT-DIAS - Real-Time Disaster Information Aggregation System</em>
</p>
