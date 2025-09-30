import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeLogsService } from './time-logs.service';

class StartTimerDto {
  taskId!: string;
  note?: string;
}

class StopTimerDto {
  note?: string;
}

class CreateTimeLogDto {
  taskId!: string;
  startedAt!: string;
  endedAt!: string;
  note?: string;
  billable?: boolean;
}

class UpdateTimeLogDto {
  startedAt?: string;
  endedAt?: string;
  note?: string;
  billable?: boolean;
}

@ApiTags('Time Logs')
@Controller('timelogs')
export class TimeLogsController {
  constructor(private readonly timeLogs: TimeLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List time logs with filters' })
  async list(
    @Query('userId') userId?: string,
    @Query('taskId') taskId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    return this.timeLogs.list({ userId, taskId, from, to });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active timer for user' })
  async getActiveTimer(@Query('userId') userId: string) {
    return this.timeLogs.getActiveTimer(userId);
  }

  @Post('start')
  @HttpCode(201)
  @ApiOperation({ summary: 'Start timer for a task' })
  async startTimer(@Body() dto: StartTimerDto) {
    return this.timeLogs.startTimer(dto);
  }

  @Post('stop')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stop active timer' })
  async stopTimer(@Body() dto: StopTimerDto) {
    return this.timeLogs.stopTimer(dto);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create manual time log' })
  async create(@Body() dto: CreateTimeLogDto) {
    return this.timeLogs.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update time log' })
  async update(@Param('id') id: string, @Body() dto: UpdateTimeLogDto) {
    return this.timeLogs.update(id, dto);
  }

  @Get('reports/daily')
  @ApiOperation({ summary: 'Get daily time report' })
  async dailyReport(
    @Query('userId') userId: string,
    @Query('date') date: string
  ) {
    return this.timeLogs.getDailyReport(userId, date);
  }

  @Get('reports/weekly')
  @ApiOperation({ summary: 'Get weekly time report' })
  async weeklyReport(
    @Query('userId') userId: string,
    @Query('week') week: string
  ) {
    return this.timeLogs.getWeeklyReport(userId, week);
  }
}
