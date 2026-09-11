import { connect, type ChannelModel, type ConfirmChannel, type ConsumeMessage } from 'amqplib';

import type { EventPublisher } from './outbox-relay.js';
import type { WorkOrderCreatedEvent } from './work-order-created.event.js';

export interface EventHandler {
  handle(event: WorkOrderCreatedEvent): Promise<unknown>;
}

const eventsExchange = 'fieldops.events';
const retryExchange = 'fieldops.retry';
const deadExchange = 'fieldops.dead-letter';
const routingKey = 'work-order.created.v1';
const queue = 'dispatch.work-order-created.v1';
const retryQueue = `${queue}.retry`;
const deadQueue = `${queue}.dead`;

export class RabbitMqBroker implements EventPublisher {
  private constructor(
    private readonly connection: ChannelModel,
    private readonly channel: ConfirmChannel,
    private readonly maxRetries: number,
  ) {}

  static async connect(url: string, retryDelayMs = 2_000, maxRetries = 3): Promise<RabbitMqBroker> {
    const connection = await connect(url);
    const channel = await connection.createConfirmChannel();
    const broker = new RabbitMqBroker(connection, channel, maxRetries);
    await broker.configure(retryDelayMs);
    return broker;
  }

  private async configure(retryDelayMs: number): Promise<void> {
    await this.channel.assertExchange(eventsExchange, 'topic', { durable: true });
    await this.channel.assertExchange(retryExchange, 'direct', { durable: true });
    await this.channel.assertExchange(deadExchange, 'direct', { durable: true });
    await this.channel.assertQueue(queue, {
      arguments: {
        'x-dead-letter-exchange': deadExchange,
        'x-dead-letter-routing-key': routingKey,
      },
      durable: true,
    });
    await this.channel.assertQueue(retryQueue, {
      arguments: {
        'x-dead-letter-exchange': eventsExchange,
        'x-dead-letter-routing-key': routingKey,
        'x-message-ttl': retryDelayMs,
      },
      durable: true,
    });
    await this.channel.assertQueue(deadQueue, { durable: true });
    await this.channel.bindQueue(queue, eventsExchange, routingKey);
    await this.channel.bindQueue(retryQueue, retryExchange, routingKey);
    await this.channel.bindQueue(deadQueue, deadExchange, routingKey);
    await this.channel.prefetch(10);
  }

  async publish(event: WorkOrderCreatedEvent): Promise<void> {
    this.channel.publish(eventsExchange, routingKey, Buffer.from(JSON.stringify(event)), {
      contentType: 'application/json',
      correlationId: event.correlationId,
      deliveryMode: 2,
      messageId: event.eventId,
      type: event.type,
    });
    await this.channel.waitForConfirms();
  }

  async consume(handler: EventHandler): Promise<void> {
    await this.channel.consume(queue, (message) => void this.process(message, handler), {
      noAck: false,
    });
  }

  private async process(message: ConsumeMessage | null, handler: EventHandler): Promise<void> {
    if (!message) return;
    try {
      await handler.handle(JSON.parse(message.content.toString()) as WorkOrderCreatedEvent);
      this.channel.ack(message);
    } catch {
      const retries = Number(message.properties.headers?.['x-retry-count'] ?? 0);
      if (retries < this.maxRetries) {
        this.channel.publish(retryExchange, routingKey, message.content, {
          ...message.properties,
          headers: { ...message.properties.headers, 'x-retry-count': retries + 1 },
        });
        await this.channel.waitForConfirms();
        this.channel.ack(message);
      } else {
        this.channel.nack(message, false, false);
      }
    }
  }

  async getDeadLetterCount(): Promise<number> {
    return (await this.channel.checkQueue(deadQueue)).messageCount;
  }

  async close(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}
