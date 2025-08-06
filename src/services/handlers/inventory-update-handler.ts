import { redis } from "../../lib/redis-cache-client";
import { InventoryMessage } from "../../types/events";
import { CachedInventoryProduct } from "../../types/redis";

const handleInventoryUpdateOnSale = async (parsed: InventoryMessage) => {
  // Identify and publish to channel accordingly
  const channel_name = `updates_channel_inventory:${parsed.user_id}:${parsed.store_id}`;
  console.log(`⚙️ Publishing updates to ${channel_name}`);

  const cache_fetch_pipeline = redis.pipeline();
  const cache_update_pipeline = redis.pipeline();

  const cache_keys: string[] = []; // For tracking which key fails on retrieval for corrupted or missing cache
  const cache_products: CachedInventoryProduct[] = []; // For Update

  const updateMap = new Map<number, number>(); // For faster update lookups

  // Perform Cache update + Pubishing to relevant channels [safety: Update cache, --> then : Publish changes]

  parsed.inv_update.forEach((update_event) => {
    const product_cache_key = `inv_products:${parsed.store_id}:${update_event.p_id}`;
    cache_keys.push(product_cache_key);
    cache_fetch_pipeline.get(product_cache_key);

    // Build Map
    updateMap.set(update_event.p_id, update_event.quantity);
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

    cache_products.push(parsed_product);
  });

  // Initiate update pipeline for product
  const updated_cache_products = cache_products.map((product) => {
    const delta = updateMap.get(product.invId);
    if (delta !== undefined) {
      return {
        ...product,
        invItemStock: product.invItemStock + delta,
      };
    }
    return product; // no update needed
  });

  // Buid & Execute update pipeline
  updated_cache_products.forEach((product) => {
    const product_cache_key = `inv_products:${parsed.store_id}:${product.invId}`;
    const new_cache_payload = JSON.stringify(product);
    cache_update_pipeline.set(product_cache_key, new_cache_payload);
  });

  console.log(
    `🪈 Commencing Update Pipeline for Store[User] : ${parsed.store_id}[${parsed.user_id}]`
  );
  await cache_update_pipeline.exec();

  console.log(`📺 Publishing updateds to Channel : ${channel_name}`);
  await redis.publish(channel_name, JSON.stringify(parsed));
};

export { handleInventoryUpdateOnSale };
