import { Consumer } from "kafkajs";

// Script to run workers for cache + db updates
export const mqService = async (consumerRegistery: Set<Consumer>) => {
  try {
  } catch (err) {
    console.log(`Error during MQ service run ❌🥲`, err);
  }
};
