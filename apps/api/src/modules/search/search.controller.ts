import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across entities' })
  async global(
    @Query('q') q: string,
    @Query('types') types?: string,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: string
  ) {
    const parsedTypes = types ? types.split(',') : undefined;
    return this.search.global({
      q,
      types: parsedTypes,
      projectId,
      limit: limit ? parseInt(limit) : 20,
    });
  }
}
