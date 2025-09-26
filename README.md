# red-store-consumer-service
Consumer Service for ingesting all event messages across systems and updating caches and db. Processes Kafka messages and handles database operations.

Key Components:

Discovery Service - Automatic topic discovery and consumer registration
Message Queue Service - Event processing and job queuing
Inventory Handler - Real-time cache updates and Redis pub/sub
Sales Worker - Asynchronous sales processing
