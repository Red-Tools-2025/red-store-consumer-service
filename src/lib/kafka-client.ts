import dotenv from "dotenv";
import { Kafka, logLevel } from "kafkajs";

dotenv.config();

const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER_1!;
console.log({ KAFKA_BROKER_ADDRESS });

export const kafka = new Kafka({
  clientId: "red-store-consumer-service",
  brokers: [KAFKA_BROKER_ADDRESS],
  logLevel: logLevel.ERROR,
});

export const admin = kafka.admin();
