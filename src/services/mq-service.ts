import { Consumer } from "kafkajs";
import { InventoryMessage } from "../types/events";
import { SalesMessage } from "../types/events";

import { SalesEventQueue } from "../lib/bullmq-client";
import { handleInventoryUpdateOnSale } from "./handlers/inventory-update-handler";

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

            // Run Handler for inventory updates on sale
            handleInventoryUpdateOnSale(parsed);
          } else if (topic_type === "sales-event") {
            // MQ Queuing action for sales worker process (Updated Timeseries DB + Inventory DB)
            if (!message.value) console.log("Incoming Event Message corrupted");
            const parsed = JSON.parse(
              message.value?.toString() || "{}"
            ) as SalesMessage;
            console.log({ sale_event_records: parsed.sales_records });
            await SalesEventQueue.add(
              `sales_update_job-${parsed.store_id}-${parsed.user_id}`,
              parsed
            );
            console.log(
              `📋 Job queued: sales_update_job-${parsed.store_id}-${userId}`
            );
            const waiting = await SalesEventQueue.getWaiting();
            console.log(`Jobs waiting: ${waiting.length}`);
          } else {
            console.log(
              `Unknown topic type discovered - ${topic_type}, cant proceed bruhh 😶`
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
