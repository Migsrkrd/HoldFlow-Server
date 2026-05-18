import { Controller, Get, Post, Body } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { Partner } from './entities/partner.entity';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  async create(@Body() createPartnerDto: CreatePartnerDto): Promise<Partner> {
    return await this.partnersService.create(createPartnerDto);
  }

  @Get()
  async getPartners(): Promise<Partner[]> {
    return await this.partnersService.getPartners();
  }
}
