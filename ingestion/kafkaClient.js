import { Kafka } from 'kafkajs';

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'rtdias-ingestion',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 1000,
    retries: 10
  }
});

// Topics
export const TOPICS = {
  RAW_TWEETS: 'raw_tweets',
  RAW_NEWS: 'raw_news',
  SENSOR_DATA: 'sensor_data',
  PROCESSED_ALERTS: 'processed_alerts',
  VERIFIED_INCIDENTS: 'verified_incidents'
};

// Create admin client to manage topics
const admin = kafka.admin();

// Create all required topics
export async function createTopics() {
  try {
    await admin.connect();
    
    const topicsToCreate = Object.values(TOPICS).map(topic => ({
      topic,
      numPartitions: 3,
      replicationFactor: 1
    }));

    await admin.createTopics({
      topics: topicsToCreate,
      waitForLeaders: true
    });

    console.log('✅ Kafka topics created:', Object.values(TOPICS));
    await admin.disconnect();
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('📋 Topics already exist');
    } else {
      console.error('❌ Error creating topics:', error);
    }
  }
}

// Producer singleton
let producer = null;

export async function getProducer() {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    console.log('✅ Kafka producer connected');
  }
  return producer;
}

// Send message to a topic
export async function sendMessage(topic, message) {
  const prod = await getProducer();
  
  await prod.send({
    topic,
    messages: [
      {
        key: message.id || String(Date.now()),
        value: JSON.stringify(message),
        timestamp: String(Date.now())
      }
    ]
  });

  console.log(`📤 [${topic}] Sent:`, message.id || message.title);
}

// Batch send messages
export async function sendBatch(topic, messages) {
  const prod = await getProducer();
  
  await prod.send({
    topic,
    messages: messages.map(msg => ({
      key: msg.id || String(Date.now()),
      value: JSON.stringify(msg),
      timestamp: String(Date.now())
    }))
  });

  console.log(`📤 [${topic}] Batch sent: ${messages.length} messages`);
}

export { kafka };
