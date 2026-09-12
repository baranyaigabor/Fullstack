import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  Job,
  JobsOptions,
  Processor,
  Queue,
  QueueEvents,
  QueueOptions,
  Worker,
  WorkerOptions,
} from 'bullmq';
import type { Redis } from 'ioredis';
import { CacheService } from '../cache/cache.service.js';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();
  private readonly workerConnections = new Map<string, Redis>();
  private readonly queueEvents = new Map<string, QueueEvents>();
  private readonly queueEventConnections = new Map<string, Redis>();

  constructor(private readonly cacheService: CacheService) {}

  getQueue<TData = unknown, TResult = unknown>(
    name: string,
    options?: QueueOptions,
  ): Queue {
    const existing: Queue | undefined = this.queues.get(name);
    if (existing) {
      return existing;
    }

    const queue: Queue = new Queue(name, {
      connection: this.cacheService.client,
      ...options,
    });

    this.queues.set(name, queue);
    return queue;
  }

  add<TData = unknown>(
    queueName: string,
    jobName: string,
    data: TData,
    options?: JobsOptions,
  ): Promise<Job> {
    const queue: Queue = this.getQueue(queueName);
    const job: Promise<Job> = queue.add(jobName, data, options);
    return job;
  }

  createWorker<TData = unknown, TResult = unknown>(
    queueName: string,
    processor: Processor<TData, TResult, string>,
    options?: WorkerOptions,
  ): Worker {
    const existing: Worker | undefined = this.workers.get(queueName);
    if (existing) {
      return existing;
    }

    const connection: Redis = this.cacheService.client.duplicate({
      maxRetriesPerRequest: null,
    });
    const worker: Worker = new Worker(queueName, processor, {
      connection,
      ...options,
    });

    this.workers.set(queueName, worker);
    this.workerConnections.set(queueName, connection);
    return worker;
  }

  getQueueEvents(name: string) {
    const existing = this.queueEvents.get(name);
    if (existing) {
      return existing;
    }

    const connection = this.cacheService.client.duplicate({
      maxRetriesPerRequest: null,
    });
    const events = new QueueEvents(name, {
      connection,
    });

    this.queueEvents.set(name, events);
    this.queueEventConnections.set(name, connection);
    return events;
  }

  async onModuleDestroy() {
    await Promise.all([
      ...Array.from(this.workers.values(), (worker) => worker.close()),
      ...Array.from(this.queueEvents.values(), (events) => events.close()),
      ...Array.from(this.queues.values(), (queue) => queue.close()),
    ]);
    await Promise.all(
      [
        ...this.workerConnections.values(),
        ...this.queueEventConnections.values(),
      ].map((connection) => connection.quit()),
    );
  }
}
