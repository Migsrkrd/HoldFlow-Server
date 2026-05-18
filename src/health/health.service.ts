import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import {
  DatabaseHealthCheck,
  HealthResponse,
  HealthStatus,
  ServerHealthCheck,
} from './health.types';

const POSTGREST_TABLE_NOT_FOUND = 'PGRST205';

@Injectable()
export class HealthService {
  private readonly startedAt = Date.now();

  constructor(
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<HealthResponse> {
    const server = this.checkServer();
    const database = await this.checkDatabase();

    const status = this.aggregateStatus(server.status, database.status);

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: { server, database },
    };
  }

  private checkServer(): ServerHealthCheck {
    return {
      status: 'ok',
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }

  private async checkDatabase(): Promise<DatabaseHealthCheck> {
    const startedAt = Date.now();
    const healthTable = this.configService.get<string>('supabase.healthTable');

    try {
      const client = this.supabase.getClient();
      const { error } = healthTable
        ? await client.from(healthTable).select('*').limit(1)
        : await client.from('_holdflow_health').select('id').limit(1);

      const latencyMs = Date.now() - startedAt;

      if (!error) {
        return { status: 'ok', latencyMs };
      }

      if (error.code === POSTGREST_TABLE_NOT_FOUND) {
        return { status: 'ok', latencyMs };
      }

      if (this.isNetworkError(error.message)) {
        return {
          status: 'error',
          latencyMs,
          message: error.message,
        };
      }

      return {
        status: 'error',
        latencyMs,
        message: error.message,
      };
    } catch (err) {
      const latencyMs = Date.now() - startedAt;
      const message =
        err instanceof Error ? err.message : 'Unknown database error';

      return {
        status: 'error',
        latencyMs,
        message,
      };
    }
  }

  private isNetworkError(message: string | undefined): boolean {
    if (!message) return false;
    const lower = message.toLowerCase();
    return (
      lower.includes('fetch failed') ||
      lower.includes('failed to fetch') ||
      lower.includes('network')
    );
  }

  private aggregateStatus(
    server: HealthStatus,
    database: HealthStatus,
  ): HealthStatus {
    if (server === 'error' || database === 'error') return 'error';
    if (server === 'degraded' || database === 'degraded') return 'degraded';
    return 'ok';
  }
}
