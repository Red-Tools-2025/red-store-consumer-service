import { Consumer } from "kafkajs";
import { discoveryService } from "./services/discovery-service";
import { mqService } from "./services/mq-service";

// Kafka topic and consumer registry
const topicRegistry: Record<string, Set<string>> = {};
const consumerRegistry: Set<Consumer> = new Set();

(async () => {
  console.log("🚀 Starting Kafka-Redis Integration Service");

  // Discovery service to auto-subscribe to topics
  await discoveryService(topicRegistry, consumerRegistry);

  // MQ service to process messages using registered consumers
  await mqService(consumerRegistry);

  console.log("✅ Service is up and running 🚀");
})();
