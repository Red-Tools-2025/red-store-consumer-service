import { Consumer } from "kafkajs";
import { admin, kafka } from "../lib/kafka-client";

// Script to handle discovery service to ensure all topics are consumed efficiently
export const discoveryService = async (
  topicRegistery: Record<string, Set<string>>,
  consumerRegistery: Set<Consumer>
) => {
  try {
    // Conduct a metadata search for all topics using kafka admin
    console.log("Initiating connection with kafka service admin 🔃 ...");
    await admin.connect();

    // Pull topics running on service
    console.log("Established Connection to admin 💯 + Pulling topics 🔃 ...");
    const topics = await admin.listTopics();

    // Validate topic registery
    console.log("Pulled Topics, Now validating topic registery");
    const registered_topics = new Set<string>();
    for (const topicSet of Object.values(topicRegistery)) {
      for (const topic of topicSet) {
        registered_topics.add(topic);
      }
    }

    // Finding topics that are running on Kafka but not registered (Avoiding system topics)
    const isSystemTopic = (topic: string) => topic.startsWith("__");
    const unregisteredTopics = topics.filter(
      (t) => !registered_topics.has(t) && !isSystemTopic(t)
    );

    if (unregisteredTopics.length > 0) {
      console.log("Unregistered topics detected ⚠️ ", unregisteredTopics);
      console.log("Initiating new consumer registration process 🔃 ...");

      // Initiate consumer connection for main consumer group
      // Validate consumer topic for duplicates (not really needed for a Set of consumers)
      // Here we assume a single consumer subscribing to multiple topics for convience and reduction in the number for consumers running on one service
      console.log("Initiating connection with consumer group 🔃 ...");
      const consumer: Consumer = kafka.consumer({
        groupId: "consumer-service-group-1",
      });

      console.log("Creating new consumer subscription to topics 💯");
      await consumer.connect();
      await consumer.subscribe({ topics: unregisteredTopics });

      // Add new topics to registry
      if (!topicRegistery["default"]) topicRegistery["default"] = new Set();
      for (const topic of unregisteredTopics) {
        topicRegistery["default"].add(topic);
      }

      // Register this consumer instance in the consumer registry
      consumerRegistery.add(consumer);

      console.log(
        `✅ Registered consumer for topics: ${unregisteredTopics.join(", ")}`
      );
    } else {
      console.log("✅ All topics are registered and accounted for.");
    }
  } catch (err) {
    console.log(`Error during discovery service run ❌🥲`, err);
  } finally {
    await admin.disconnect();
  }
};
