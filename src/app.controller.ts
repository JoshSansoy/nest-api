import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('filter')
  async getFilteredUsers(@Query() query) {
    const city = query.city;
    const distance = query.distance;
    const apiData = await this.appService.filterUsers(city, distance);
    return apiData;
  }
}
