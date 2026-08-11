import { Injectable } from '@nestjs/common';
import { Meilisearch } from 'meilisearch';

@Injectable()
export class SearchService {
  private readonly client: Meilisearch;

  constructor() {
    this.client = new Meilisearch({
      host: process.env.SEARCH_ENGINE_URL!,
      apiKey: process.env.SEARCH_ENGINE_MASTER_KEY,
    });
  }

  getClient(): Meilisearch {
    return this.client;
  }

  getIndex<T extends Record<string, unknown>>(indexUid: string) {
    return this.client.index<T>(indexUid);
  }

  health() {
    return this.client.health();
  }
}
