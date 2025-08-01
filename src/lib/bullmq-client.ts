import { Queue } from "bullmq";

// A custom client/library file built for defining queues and worker definitions

export const SalesEventQueue = new Queue("SalesEventQueue");
export const InventoryEventQueue = new Queue("InventoryEventQueue");
