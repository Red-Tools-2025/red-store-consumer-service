import { Consumer } from "kafkajs";

// Script to run workers for cache + db updates
export const mqService = async (consumerRegistery: Set<Consumer>) => {
  try {
    // Running Each consumer from registery & Mapping Jobs to relevant topic messages
    for (const consumer of consumerRegistery) {
      await consumer.connect();
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log(`📩 ${topic} - ${message} [${partition}]`);
        },
      });
    }
    console.log("MQ Consumers started successfully 😀");
  } catch (err) {
    console.log(`Error during MQ service run ❌🥲`, err);
  }
};
