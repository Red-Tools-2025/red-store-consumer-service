import Redis from "ioredis";

// Client for products cache redis client
const redis = new Redis({
  host: "localhost",
  port: 6379,
});
