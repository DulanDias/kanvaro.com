import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('burndown')
  @ApiOperation({ summary: 'Get sprint burndown chart data' })
  async burndown(@Query('sprintId') sprintId: string) {
    return this.reports.getBurndown(sprintId);
  }

  @Get('cfd')
  @ApiOperation({ summary: 'Get cumulative flow diagram data' })
  async cfd(
    @Query('projectId') projectId: string,
    @Query('from') from: string,
    @Query('to') to: string
  ) {
    return this.reports.getCumulativeFlow(projectId, from, to);
  }

  @Get('velocity')
  @ApiOperation({ summary: 'Get team velocity data' })
  async velocity(
    @Query('projectId') projectId: string,
    @Query('limitSprints') limitSprints?: string
  ) {
    return this.reports.getVelocity(
      projectId,
      limitSprints ? parseInt(limitSprints) : 6
    );
  }

  @Get('throughput')
  @ApiOperation({ summary: 'Get throughput data' })
  async throughput(
    @Query('projectId') projectId: string,
    @Query('from') from: string,
    @Query('to') to: string
  ) {
    return this.reports.getThroughput(projectId, from, to);
  }

  @Get('time-tracking')
  @ApiOperation({ summary: 'Get time tracking report' })
  async timeTracking(
    @Query('projectId') projectId: string,
    @Query('from') from: string,
    @Query('to') to: string
  ) {
    return this.reports.getTimeTracking(projectId, from, to);
  }

  @Get('team-performance')
  @ApiOperation({ summary: 'Get team performance metrics' })
  async teamPerformance(
    @Query('projectId') projectId: string,
    @Query('from') from: string,
    @Query('to') to: string
  ) {
    return this.reports.getTeamPerformance(projectId, from, to);
  }
}
