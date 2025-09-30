import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { generateLexoRank } from '../../utils/lexorank';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async listBoards(projectId: string) {
    const boards = await this.prisma.board.findMany({
      where: { projectId },
      select: { id: true, name: true },
      orderBy: { createdAt: 'asc' },
    });
    return boards;
  }

  async createBoard(dto: { projectId: string; name: string }) {
    return this.prisma.board.create({
      data: dto,
      select: { id: true, name: true },
    });
  }

  async createColumn(
    boardId: string,
    dto: { name: string; wipLimit?: number; beforeId?: string }
  ) {
    let orderKey = '0|000000';
    if (dto.beforeId) {
      // Insert before existing column
      const before = await this.prisma.column.findUnique({
        where: { id: dto.beforeId },
      });
      const prev = await this.prisma.column.findFirst({
        where: { boardId, orderKey: { lt: before?.orderKey || '' } },
        orderBy: { orderKey: 'desc' },
      });
      orderKey = generateLexoRank(prev?.orderKey, before?.orderKey);
    } else {
      // Append to end
      const last = await this.prisma.column.findFirst({
        where: { boardId },
        orderBy: { orderKey: 'desc' },
      });
      orderKey = generateLexoRank(last?.orderKey, undefined);
    }

    return this.prisma.column.create({
      data: { boardId, name: dto.name, wipLimit: dto.wipLimit, orderKey },
      select: { id: true, name: true, orderKey: true },
    });
  }
}
