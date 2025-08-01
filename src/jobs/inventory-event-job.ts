import { Job } from "bullmq";

export const inventoryEventJob = async (job: Job) => {
  try {
    const payload = job.data;
    console.log("Processing inventory job with data:", payload);
  } catch (error) {
    console.error("Sales job failed:", error);
    throw error;
  }
};
