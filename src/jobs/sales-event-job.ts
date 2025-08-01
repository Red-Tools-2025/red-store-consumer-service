import { Job } from "bullmq";

export const salesEventJob = async (job: Job) => {
  try {
    const payload = job.data;
    console.log("Processing sales job with data:", payload);

    return { status: "success" };
  } catch (error) {
    console.error("Sales job failed:", error);
    throw error;
  }
};
