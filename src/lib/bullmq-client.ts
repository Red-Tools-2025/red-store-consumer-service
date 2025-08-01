import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";

// Jobs
import { salesEventJob } from "../jobs/sales-event-job";
import { inventoryEventJob } from "../jobs/inventory-event-job";

const connection = new IORedis({
  host: "localhost",
  port: 6380,
});

// Defining Queues for processing right events
export const SalesEventQueue = new Queue("SalesEventQueue", { connection });
export const InventoryEventQueue = new Queue("InventoryEventQueue", {
  connection,
});

// Defining workers for Queue Processing Jobs
export const SalesEventWorker = new Worker("SalesEventWorker", salesEventJob, {
  connection,
});
export const InventoryEventWorker = new Worker(
  "InventoryEventWorker",
  inventoryEventJob,
  { connection }
);
