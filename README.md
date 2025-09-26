# Red Store Consumer Service

Consumer Service for ingesting all event messages across systems and updating caches and databases. Processes Kafka messages and handles database operations.

## Key Components

### 1. Discovery Service
- Automatic topic discovery
- Consumer registration

### 2. Message Queue Service
- Event processing
- Job queuing

### 3. Inventory Handler
- Real-time cache updates
- Redis pub/sub integration

### 4. Sales Worker
- Asynchronous sales processing
