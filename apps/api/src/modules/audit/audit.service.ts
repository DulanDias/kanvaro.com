import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(event: {
    userId?: string | null;
    action: string;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    return this.prisma.auditEvent.create({
      data: {
        userId: event.userId || null,
        action: event.action,
        entityType: event.entityType || null,
        entityId: event.entityId || null,
        metadata: event.metadata as unknown as Record<string, unknown>,
      },
    });
  }

  async list(params: {
    userId?: string;
    action?: string;
    entityType?: string;
    from?: string;
    to?: string;
  }) {
    const { userId, action, entityType, from, to } = params;
    return this.prisma.auditEvent.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(action ? { action } : {}),
        ...(entityType ? { entityType } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
