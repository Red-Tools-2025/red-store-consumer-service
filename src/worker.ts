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
