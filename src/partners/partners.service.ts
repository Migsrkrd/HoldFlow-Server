/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Partner } from './entities/partner.entity';

@Injectable()
export class PartnersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /// Creates a new partner in the database
  async create(_createPartnerDto: CreatePartnerDto): Promise<Partner> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('partners')
      .insert({
        name: _createPartnerDto.name,
      })
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new Error('Failed to create partner');
    return data as Partner;
  }

  /// Gets all partners from the database
  async getPartners(): Promise<Partner[]> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data) throw new Error('Failed to get partners');
    return data as Partner[];
  }
}
