import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class SprintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway
  ) {}

  async list(projectId: string) {
    return this.prisma.sprint.findMany({
      where: { projectId },
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        goal: true,
        state: true,
        createdAt: true,
      },
    });
  }

  async create(dto: {
    projectId: string;
    name: string;
    startDate: string;
    endDate: string;
    goal?: string;
  }) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check for overlapping sprints
    const overlapping = await this.prisma.sprint.findFirst({
      where: {
        projectId: dto.projectId,
        state: { in: ['PLANNED', 'ACTIVE'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Sprint dates overlap with existing sprint'
      );
    }

    return this.prisma.sprint.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        startDate,
        endDate,
        goal: dto.goal,
        state: 'PLANNED',
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        goal: true,
        state: true,
      },
    });
  }

  async update(
    id: string,
    dto: {
      name?: string;
      startDate?: string;
      endDate?: string;
      goal?: string;
      state?: 'PLANNED' | 'ACTIVE' | 'CLOSED';
    }
  ) {
    const updateData: any = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.goal !== undefined) updateData.goal = dto.goal;
    if (dto.state) updateData.state = dto.state;

    if (dto.startDate || dto.endDate) {
      const sprint = await this.prisma.sprint.findUnique({ where: { id } });
      if (!sprint) throw new BadRequestException('Sprint not found');

      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : sprint.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : sprint.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      updateData.startDate = startDate;
      updateData.endDate = endDate;
    }

    return this.prisma.sprint.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        goal: true,
        state: true,
      },
    });
  }

  async start(id: string) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new BadRequestException('Sprint not found');

    if (sprint.state !== 'PLANNED') {
      throw new BadRequestException('Only planned sprints can be started');
    }

    // Close any active sprints in the same project
    await this.prisma.sprint.updateMany({
      where: {
        projectId: sprint.projectId,
        state: 'ACTIVE',
      },
      data: { state: 'CLOSED' },
    });

    const updated = await this.prisma.sprint.update({
      where: { id },
      data: { state: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        goal: true,
        state: true,
        projectId: true,
      },
    });

    // Emit real-time event
    this.realtime.emitSprintStarted(sprint.projectId, updated);

    return updated;
  }

  async close(id: string) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new BadRequestException('Sprint not found');

    if (sprint.state !== 'ACTIVE') {
      throw new BadRequestException('Only active sprints can be closed');
    }

    const updated = await this.prisma.sprint.update({
      where: { id },
      data: { state: 'CLOSED' },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        goal: true,
        state: true,
        projectId: true,
      },
    });

    // Emit real-time event
    this.realtime.emitSprintClosed(sprint.projectId, updated);

    // Trigger report refresh
    await this.refreshReports(sprint.projectId);

    return updated;
  }

  async getBurndown(sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new BadRequestException('Sprint not found');

    // Get tasks with points for this sprint
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId: sprint.projectId,
        createdAt: { gte: sprint.startDate, lte: sprint.endDate },
      },
      select: { id: true, points: true, status: true, createdAt: true },
    });

    const totalPoints = tasks.reduce(
      (sum, task) => sum + (task.points || 0),
      0
    );
    const completedPoints = tasks
      .filter((task) => task.status === 'DONE')
      .reduce((sum, task) => sum + (task.points || 0), 0);

    // Generate daily burndown data
    const days = [];
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    // const today = new Date();

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dayTasks = tasks.filter(
        (task) => task.createdAt <= d && task.status === 'DONE'
      );
      const dayCompleted = dayTasks.reduce(
        (sum, task) => sum + (task.points || 0),
        0
      );
      const remaining = totalPoints - dayCompleted;

      days.push({
        date: d.toISOString().split('T')[0],
        remaining,
        completed: dayCompleted,
        total: totalPoints,
      });
    }

    return {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      },
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
      days,
    };
  }

  async getVelocity(sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new BadRequestException('Sprint not found');

    // Get completed tasks with points
    const completedTasks = await this.prisma.task.findMany({
      where: {
        projectId: sprint.projectId,
        status: 'DONE',
        createdAt: { gte: sprint.startDate, lte: sprint.endDate },
      },
      select: { points: true, createdAt: true },
    });

    const velocity = completedTasks.reduce(
      (sum, task) => sum + (task.points || 0),
      0
    );

    return {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      },
      velocity,
      completedTasks: completedTasks.length,
      averagePointsPerTask:
        completedTasks.length > 0 ? velocity / completedTasks.length : 0,
    };
  }

  private async refreshReports(projectId: string) {
    // TODO: Implement materialized view refresh
    console.log(`Refreshing reports for project ${projectId}`);
  }
}
