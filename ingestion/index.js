import { createTopics } from './kafkaClient.js';
import './simulateDisasters.js';

// Entry point for ingestion service
console.log('RT-DIAS Ingestion Service Starting...');

// Initialize topics
createTopics().then(() => {
  console.log('Kafka topics initialized');
}).catch(console.error);
