import { Consumer } from "kafkajs";

// Script to run workers for cache + db updates
export const mqService = async (consumerRegistery: Set<Consumer>) => {
  try {
    // Running Each consumer from registery & Mapping Jobs to relevant topic messages
    for (const consumer of consumerRegistery) {
      await consumer.connect();
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log(
            `📩 ${topic} - ${message.value?.toString()} [${partition}]`
          );

          // Split on topic basis
          const [topic_type, userId] = topic.split("_");
          if (topic_type === "inventory-updates-event") {
            // Publish Event to redis channel for + Update Redis cache products to keep cache active (cheaper than pull)
          } else if (topic_type === "sales-event") {
            // MQ Queuing action for sales worker process (Updated Timeseries DB + Inventory DB)
          } else {
            console.log(
              `Unknown topic type discovered - ${topic_type}, unsure on how to furter proceed 😶`
            );
          }
        },
      });
    }
    console.log("MQ Consumers started successfully 😀");
  } catch (err) {
    console.log(`Error during MQ service run ❌🥲`, err);
  }
};
