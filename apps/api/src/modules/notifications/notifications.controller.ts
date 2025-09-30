import {
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  async list(@Req() req: Request, @Query('unreadOnly') unreadOnly?: string) {
    const userId =
      req.user?.id ||
      req.session?.userId ||
      req.cookies?.userId ||
      'current-user';
    return this.notifications.list(userId, {
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Req() req: Request, @Param('id') id: string) {
    const userId =
      req.user?.id ||
      req.session?.userId ||
      req.cookies?.userId ||
      'current-user';
    return this.notifications.markRead(userId, id);
  }

  @Post('read-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Req() req: Request) {
    const userId =
      req.user?.id ||
      req.session?.userId ||
      req.cookies?.userId ||
      'current-user';
    return this.notifications.markAllRead(userId);
  }
}
