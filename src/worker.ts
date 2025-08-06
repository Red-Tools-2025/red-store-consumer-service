import { SalesEventWorker } from "./lib/bullmq-client";

SalesEventWorker.on("active", (job) => {
  console.log(`Sales event processor live & working on job ${job.id}`);
});

SalesEventWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

SalesEventWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

console.log("Sales Event Worker started and listening for jobs...");

process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await SalesEventWorker.close();
  process.exit(0);
});
