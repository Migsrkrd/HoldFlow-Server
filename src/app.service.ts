import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService {
  constructor(private readonly supabase: SupabaseService) {}

  getHello(): string {
    return 'HoldFlow API';
  }

  async getHealth(): Promise<{ status: string; supabase: string }> {
    const { error } = await this.supabase.getClient().storage.listBuckets();

    if (error) {
      return { status: 'degraded', supabase: error.message };
    }

    return { status: 'ok', supabase: 'connected' };
  }
}
