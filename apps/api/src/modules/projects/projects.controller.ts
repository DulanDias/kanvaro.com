import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

class CreateProjectDto {
  name!: string;
  key!: string;
}

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects' })
  async list() {
    return this.projectsService.list();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create project' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }
}
