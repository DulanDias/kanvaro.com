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
import { SprintsService } from './sprints.service';

class CreateSprintDto {
  projectId!: string;
  name!: string;
  startDate!: string;
  endDate!: string;
  goal?: string;
}

class UpdateSprintDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
  state?: 'PLANNED' | 'ACTIVE' | 'CLOSED';
}

@ApiTags('Sprints')
@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprints: SprintsService) {}

  @Get()
  @ApiOperation({ summary: 'List sprints for a project' })
  async list(@Query('projectId') projectId: string) {
    return this.sprints.list(projectId);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create sprint' })
  async create(@Body() dto: CreateSprintDto) {
    return this.sprints.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sprint' })
  async update(@Param('id') id: string, @Body() dto: UpdateSprintDto) {
    return this.sprints.update(id, dto);
  }

  @Post(':id/start')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start sprint' })
  async start(@Param('id') id: string) {
    return this.sprints.start(id);
  }

  @Post(':id/close')
  @HttpCode(200)
  @ApiOperation({ summary: 'Close sprint' })
  async close(@Param('id') id: string) {
    return this.sprints.close(id);
  }

  @Get(':id/burndown')
  @ApiOperation({ summary: 'Get sprint burndown data' })
  async burndown(@Param('id') id: string) {
    return this.sprints.getBurndown(id);
  }

  @Get(':id/velocity')
  @ApiOperation({ summary: 'Get sprint velocity data' })
  async velocity(@Param('id') id: string) {
    return this.sprints.getVelocity(id);
  }
}
