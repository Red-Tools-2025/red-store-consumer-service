import { Consumer } from "kafkajs";
import { InventoryMessage } from "../types/events";
import { SalesMessage } from "../types/events";
import { redis } from "../lib/redis-cache-client";

import { SalesEventQueue } from "../lib/bullmq-client";

// Script to run workers for cache + db updates
export const mQService = async (consumerRegistery: Set<Consumer>) => {
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
            if (!message.value) console.log("Incoming Event Message corrupted");
            const parsed = JSON.parse(
              message.value?.toString() || "{}"
            ) as InventoryMessage;

            // Identify and publish to channel accordingly
            const channel_name = `updates_channel_inventory:${parsed.user_id}:${parsed.store_id}`;
            console.log(`⚙️ Publishing updates to ${channel_name}`);

            await redis.publish(channel_name, JSON.stringify(parsed));

            // Perform Cache update

            // Return product from cache
          } else if (topic_type === "sales-event") {
            // MQ Queuing action for sales worker process (Updated Timeseries DB + Inventory DB)
            if (!message.value) console.log("Incoming Event Message corrupted");
            const parsed = JSON.parse(
              message.value?.toString() || "{}"
            ) as SalesMessage;
            console.log({ sale_event_records: parsed.sales_records });
            await SalesEventQueue.add("sales-worker", parsed);
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
