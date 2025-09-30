import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { generateLexoRank } from '@kanvaro/shared/dist/utils';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway
  ) {}

  async list(boardId: string, columnId?: string) {
    return this.prisma.task.findMany({
      where: { boardId, ...(columnId ? { columnId } : {}) },
      orderBy: { orderKey: 'asc' },
      select: { id: true, title: true, columnId: true, orderKey: true },
    });
  }

  async create(dto: {
    projectId: string;
    boardId: string;
    columnId: string;
    title: string;
  }) {
    const last = await this.prisma.task.findFirst({
      where: { boardId: dto.boardId, columnId: dto.columnId },
      orderBy: { orderKey: 'desc' },
      select: { orderKey: true },
    });
    const orderKey = generateLexoRank(last?.orderKey, undefined);
    // TODO: replace createdBy with current user from session
    const owner = await this.prisma.user.findFirst({
      where: { role: 'OWNER' },
    });
    if (!owner) throw new Error('Owner not found');
    return this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        boardId: dto.boardId,
        columnId: dto.columnId,
        title: dto.title,
        orderKey,
        createdBy: owner.id,
      },
      select: { id: true, title: true, columnId: true, orderKey: true },
    });
  }

  async update(id: string, dto: { title?: string; descriptionText?: string }) {
    return this.prisma.task.update({
      where: { id },
      data: { ...dto },
      select: { id: true, title: true },
    });
  }

  async move(id: string, dto: { toColumnId: string; afterTaskId?: string }) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error('Task not found');

    let beforeKey: string | undefined;
    let afterKey: string | undefined;

    if (dto.afterTaskId) {
      const afterTask = await this.prisma.task.findUnique({
        where: { id: dto.afterTaskId },
      });
      afterKey = afterTask?.orderKey;
      const beforeNeighbor = await this.prisma.task.findFirst({
        where: {
          boardId: task.boardId,
          columnId: dto.toColumnId,
          orderKey: { gt: afterTask?.orderKey || '' },
        },
        orderBy: { orderKey: 'asc' },
      });
      beforeKey = beforeNeighbor?.orderKey;
    } else {
      const first = await this.prisma.task.findFirst({
        where: { boardId: task.boardId, columnId: dto.toColumnId },
        orderBy: { orderKey: 'asc' },
      });
      beforeKey = first?.orderKey;
    }

    const newRank = generateLexoRank(afterKey, beforeKey);

    const updated = await this.prisma.task.update({
      where: { id },
      data: { columnId: dto.toColumnId, orderKey: newRank },
      select: { id: true, columnId: true, orderKey: true, boardId: true },
    });

    // Emit real-time event
    this.realtime.emitTaskMoved(task.boardId, updated);

    return updated;
  }
}
