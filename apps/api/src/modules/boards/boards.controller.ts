import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardsService } from './boards.service';

class CreateBoardDto {
  projectId!: string;
  name!: string;
}
class CreateColumnDto {
  name!: string;
  wipLimit?: number;
  beforeId?: string;
}

@ApiTags('Boards')
@Controller()
export class BoardsController {
  constructor(private readonly boards: BoardsService) {}

  @Get('projects/:projectId/boards')
  @ApiOperation({ summary: 'List boards for a project' })
  async listBoards(@Param('projectId') projectId: string) {
    return this.boards.listBoards(projectId);
  }

  @Post('boards')
  @HttpCode(201)
  async createBoard(@Body() dto: CreateBoardDto) {
    return this.boards.createBoard(dto);
  }

  @Post('boards/:id/columns')
  @HttpCode(201)
  async createColumn(
    @Param('id') boardId: string,
    @Body() dto: CreateColumnDto
  ) {
    return this.boards.createColumn(boardId, dto);
  }
}
