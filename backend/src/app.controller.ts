import type {
  HealthResponse,
  PublicConfig,
  SocialProvider,
} from '@fullstack-starter/shared';
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { CacheService } from './cache/cache.service.js';
import { DatabaseService } from './database/database.service.js';
import { SearchService } from './search/search.service.js';
import { VirusScannerService } from './virusscanner/virusscanner.service.js';

@Controller()
@AllowAnonymous()
export class AppController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
    private readonly searchService: SearchService,
    private readonly virusScannerService: VirusScannerService,
  ) {}

  @Get('health')
  async getHealth(): Promise<HealthResponse> {
    try {
      await this.withTimeout(
        Promise.all([
          this.databaseService.pool.query('select 1'),
          this.cacheService.client.ping(),
          this.searchService.health(),
          this.virusScannerService.ping(),
        ]),
        3_000,
      );
    } catch {
      throw new ServiceUnavailableException(
        'A required service is unavailable',
      );
    }

    return { status: 'ok' };
  }

  @Get('health/live')
  getLiveness(): HealthResponse {
    return { status: 'ok' };
  }

  @Get('config')
  getPublicConfig(): PublicConfig {
    const socialProviders: SocialProvider[] = [];

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      socialProviders.push('google');
    }
    if (
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET
    ) {
      socialProviders.push('microsoft');
    }
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      socialProviders.push('github');
    }
    if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
      socialProviders.push('facebook');
    }

    return { socialProviders };
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      return await Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error('Health check timed out')),
            timeoutMs,
          );
          timeout.unref();
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}
