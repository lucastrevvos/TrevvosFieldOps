import { Pool } from 'pg';

import { getDatabaseConfig } from '../infrastructure/database/database.config.js';
import { DispatchPreparationHandler } from './dispatch-preparation.handler.js';
import { OutboxRelay } from './outbox-relay.js';
import { OutboxStore } from './outbox-store.js';
import { RabbitMqBroker } from './rabbitmq-broker.js';

const pool = new Pool(getDatabaseConfig());
const rabbitUrl = process.env.RABBITMQ_URL ?? 'amqp://fieldops:fieldops_local_only@127.0.0.1:5672';
const broker = await RabbitMqBroker.connect(rabbitUrl);
const relay = new OutboxRelay(new OutboxStore(pool), broker);

await broker.consume(new DispatchPreparationHandler(pool));
const interval = setInterval(() => void relay.publishBatch(), 1_000);
await relay.publishBatch();
process.stdout.write('Messaging worker started.\n');

async function shutdown(): Promise<void> {
  clearInterval(interval);
  await broker.close();
  await pool.end();
  process.exit(0);
}

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
