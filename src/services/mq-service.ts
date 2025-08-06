import { Consumer } from "kafkajs";
import { InventoryMessage } from "../types/events";
import { SalesMessage } from "../types/events";
import { redis } from "../lib/redis-cache-client";

import { SalesEventQueue } from "../lib/bullmq-client";
import { CachedInventoryProduct } from "../types/redis";

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

            const cache_fetch_pipeline = redis.pipeline();
            const cache_update_pipeline = redis.pipeline();
            const cache_keys: string[] = [];

            // Perform Cache update + Pubishing to relevant channels [safety: Update cache, --> then : Publish changes]
            // Retrieve product

            parsed.inv_update.forEach((update_event) => {
              const product_cache_key = `inv_products:${parsed.store_id}:${update_event.p_id}`;
              cache_keys.push(product_cache_key);
              cache_fetch_pipeline.get(product_cache_key);
            });

            console.log(
              `🪈 Commencing Fetch Pipeline for Store[User] : ${parsed.store_id}[${parsed.user_id}]`
            );
            const fetched_cache_products = await cache_fetch_pipeline.exec();
            fetched_cache_products?.forEach(([err, result], index) => {
              if (err) {
                console.error(`Fetch error for ${cache_keys[index]}`, err);
                return;
              }

              // Parse cache string
              const parsed_product =
                typeof result === "string" && result
                  ? (JSON.parse(result) as CachedInventoryProduct)
                  : ({} as CachedInventoryProduct);
              // Observation
              console.log({ parsed_product });
            });

            await redis.publish(channel_name, JSON.stringify(parsed));
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
