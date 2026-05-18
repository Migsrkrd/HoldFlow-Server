import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let fromMock: jest.Mock;

  beforeEach(async () => {
    fromMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({
          error: { code: 'PGRST205', message: 'table not found' },
        }),
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: fromMock }),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
      ],
    }).compile();

    healthService = module.get(HealthService);
  });

  it('reports server and database as ok when Supabase responds', async () => {
    const result = await healthService.check();

    expect(result.status).toBe('ok');
    expect(result.checks.server.status).toBe('ok');
    expect(result.checks.server.uptime).toBeGreaterThanOrEqual(0);
    expect(result.checks.database.status).toBe('ok');
    expect(result.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeDefined();
  });

  it('reports database error on network failure', async () => {
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({
          error: { message: 'fetch failed' },
        }),
      }),
    });

    const result = await healthService.check();

    expect(result.status).toBe('error');
    expect(result.checks.database.status).toBe('error');
  });
});
