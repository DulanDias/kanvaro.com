import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway
  ) {}

  async list(userId: string, params: { unreadOnly?: boolean }) {
    return this.prisma.notification.findMany({
      where: { userId, ...(params.unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(input: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
  }) {
    const notif = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data as any,
      },
    });
    this.realtime.emitNotification(input.userId, notif);
    return notif;
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    const res = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: res.count };
  }
}
