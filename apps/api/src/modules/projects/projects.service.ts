import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, key: true, createdAt: true },
    });
  }

  async create(dto: { name: string; key: string }) {
    // TODO: Replace with current user once auth guard is in place
    const owner = await this.prisma.user.findFirst({
      where: { role: 'OWNER' },
    });
    if (!owner) throw new Error('Owner not found');
    return this.prisma.project.create({
      data: {
        name: dto.name,
        key: dto.key,
        ownerId: owner.id,
      },
      select: { id: true, name: true, key: true },
    });
  }
}
