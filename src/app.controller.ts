import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('seed')
  seedData() {
    return this.appService.seed();
  }

  @Get('join/inner')
  getInnerJoin() {
    return this.appService.getInnerJoin();
  }

  @Get('join/left')
  getLeftJoin() {
    return this.appService.getLeftJoin();
  }

  @Get('join/right')
  getRightJoin() {
    return this.appService.getRightJoin();
  }

  @Get('join/full')
  getFullJoin() {
    return this.appService.getFullJoin();
  }

  @Get('join/cross')
  getCrossJoin() {
    return this.appService.getCrossJoin();
  }

  @Get('join/self')
  getSelfJoin() {
    return this.appService.getSelfJoin();
  }

  @Get('join/natural')
  getNaturalJoin() {
    return this.appService.getNaturalJoin();
  }

  @Get('join/anti')
  getAntiJoin() {
    return this.appService.getAntiJoin();
  }

  @Get('join/semi')
  getSemiJoin() {
    return this.appService.getSemiJoin();
  }

  @Get('join/lateral')
  getLateralJoin() {
    return this.appService.getLateralJoin();
  }

  @Get('join/partition')
  getPartitionJoin() {
    return this.appService.getPartitionJoin();
  }
}
