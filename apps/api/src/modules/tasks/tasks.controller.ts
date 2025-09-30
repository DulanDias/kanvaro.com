import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';

class CreateTaskDto {
  projectId!: string;
  boardId!: string;
  columnId!: string;
  title!: string;
}
class UpdateTaskDto {
  title?: string;
  descriptionText?: string;
}
class MoveTaskDto {
  toColumnId!: string;
  afterTaskId?: string;
}

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'List tasks by board/column (cursor pagination TBD)',
  })
  async list(
    @Query('boardId') boardId: string,
    @Query('columnId') columnId?: string
  ) {
    return this.tasks.list(boardId, columnId);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(id, dto);
  }

  @Patch(':id/move')
  async move(@Param('id') id: string, @Body() dto: MoveTaskDto) {
    return this.tasks.move(id, dto);
  }
}
