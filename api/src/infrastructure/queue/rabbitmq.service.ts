import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

const DELAY_QUEUE = 'reminder.delay';
const READY_EXCHANGE = 'reminder.ready';
const READY_QUEUE = 'reminder.ready';

@Injectable()
export class RabbitMQService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async onApplicationBootstrap(): Promise<void> {
    const url = this.config.get<string>('rabbitmq.url') ?? 'amqp://localhost';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.setupTopology();
      this.logger.log('RabbitMQ connected');
    } catch (err) {
      this.logger.error('RabbitMQ connection failed', err);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  getChannel(): amqp.Channel {
    if (!this.channel) throw new Error('RabbitMQ channel not ready');
    return this.channel;
  }

  private async setupTopology(): Promise<void> {
    const ch = this.channel!;
    await ch.assertExchange(READY_EXCHANGE, 'fanout', { durable: true });
    await ch.assertQueue(READY_QUEUE, { durable: true });
    await ch.bindQueue(READY_QUEUE, READY_EXCHANGE, '');
    await ch.assertQueue(DELAY_QUEUE, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': READY_EXCHANGE },
    });
  }
}
