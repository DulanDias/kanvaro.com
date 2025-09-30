import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

export type SearchType = 'project' | 'task' | 'comment' | 'user' | 'label';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async global(params: {
    q: string;
    types?: string[];
    projectId?: string;
    limit?: number;
  }) {
    const { q, types, projectId, limit = 20 } = params;
    if (!q || q.trim().length === 0) {
      return { query: q, results: [] };
    }

    const searchTypes: SearchType[] = (types as SearchType[]) || [
      'project',
      'task',
      'comment',
      'user',
    ];

    const promises: Promise<unknown>[] = [];

    if (searchTypes.includes('project')) {
      promises.push(
        this.prisma.project
          .findMany({
            where: { name: { contains: q, mode: 'insensitive' } },
            select: { id: true, name: true, key: true, description: true },
            take: limit,
          })
          .then((rows) => rows.map((r) => ({ type: 'project', ...r })))
      );
    }

    if (searchTypes.includes('task')) {
      promises.push(
        this.prisma.task
          .findMany({
            where: {
              ...(projectId ? { projectId } : {}),
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              title: true,
              projectId: true,
              status: true,
              points: true,
            },
            take: limit,
          })
          .then((rows) => rows.map((r) => ({ type: 'task', ...r })))
      );
    }

    if (searchTypes.includes('comment')) {
      promises.push(
        this.prisma.comment
          .findMany({
            where: {
              ...(projectId ? { projectId } : {}),
              content: { contains: q, mode: 'insensitive' },
            },
            select: {
              id: true,
              taskId: true,
              userId: true,
              content: true,
              createdAt: true,
            },
            take: limit,
          })
          .then((rows) => rows.map((r) => ({ type: 'comment', ...r })))
      );
    }

    if (searchTypes.includes('user')) {
      promises.push(
        this.prisma.user
          .findMany({
            where: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: { id: true, name: true, email: true, avatarUrl: true },
            take: limit,
          })
          .then((rows) => rows.map((r) => ({ type: 'user', ...r })))
      );
    }

    if (searchTypes.includes('label')) {
      promises.push(
        this.prisma.label
          .findMany({
            where: { name: { contains: q, mode: 'insensitive' } },
            select: { id: true, name: true, color: true },
            take: limit,
          })
          .then((rows) => rows.map((r) => ({ type: 'label', ...r })))
      );
    }

    const results = (await Promise.all(promises)).flat();
    return { query: q, results };
  }
}
