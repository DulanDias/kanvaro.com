import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TimeLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway
  ) {}

  async list(filters: {
    userId?: string;
    taskId?: string;
    from?: string;
    to?: string;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.taskId) where.taskId = filters.taskId;

    if (filters.from || filters.to) {
      where.startedAt = {};
      if (filters.from) where.startedAt.gte = new Date(filters.from);
      if (filters.to) where.startedAt.lte = new Date(filters.to);
    }

    return this.prisma.timeLog.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      include: {
        task: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
        sprint: { select: { id: true, name: true } },
      },
    });
  }

  async getActiveTimer(userId: string) {
    return this.prisma.timeLog.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      include: {
        task: { select: { id: true, title: true } },
        sprint: { select: { id: true, name: true } },
      },
    });
  }

  async startTimer(dto: { taskId: string; note?: string }) {
    // Stop any existing active timer for this user
    const activeTimer = await this.prisma.timeLog.findFirst({
      where: { userId: 'current-user', endedAt: null }, // TODO: Get from session
    });

    if (activeTimer) {
      await this.prisma.timeLog.update({
        where: { id: activeTimer.id },
        data: { endedAt: new Date() },
      });
    }

    // Get task and project info
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
      include: { project: true },
    });

    if (!task) throw new BadRequestException('Task not found');

    // Get active sprint for the project
    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId: task.projectId,
        state: 'ACTIVE',
      },
    });

    const timeLog = await this.prisma.timeLog.create({
      data: {
        taskId: dto.taskId,
        userId: 'current-user', // TODO: Get from session
        projectId: task.projectId,
        sprintId: activeSprint?.id,
        startedAt: new Date(),
        note: dto.note,
        billable: true,
      },
      include: {
        task: { select: { id: true, title: true } },
        sprint: { select: { id: true, name: true } },
      },
    });

    // Emit real-time event
    this.realtime.emitTimeLogStarted('current-user', timeLog);

    return timeLog;
  }

  async stopTimer(dto: { note?: string }) {
    const activeTimer = await this.prisma.timeLog.findFirst({
      where: { userId: 'current-user', endedAt: null }, // TODO: Get from session
    });

    if (!activeTimer) {
      throw new BadRequestException('No active timer found');
    }

    const endedAt = new Date();
    const durationSec = Math.floor(
      (endedAt.getTime() - activeTimer.startedAt.getTime()) / 1000
    );

    const updated = await this.prisma.timeLog.update({
      where: { id: activeTimer.id },
      data: {
        endedAt,
        durationSec,
        note: dto.note || activeTimer.note,
      },
      include: {
        task: { select: { id: true, title: true } },
        sprint: { select: { id: true, name: true } },
      },
    });

    // Emit real-time event
    this.realtime.emitTimeLogStopped('current-user', updated);

    return updated;
  }

  async create(dto: {
    taskId: string;
    startedAt: string;
    endedAt: string;
    note?: string;
    billable?: boolean;
  }) {
    const startedAt = new Date(dto.startedAt);
    const endedAt = new Date(dto.endedAt);

    if (startedAt >= endedAt) {
      throw new BadRequestException('Start time must be before end time');
    }

    const durationSec = Math.floor(
      (endedAt.getTime() - startedAt.getTime()) / 1000
    );

    // Get task and project info
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
      include: { project: true },
    });

    if (!task) throw new BadRequestException('Task not found');

    // Get active sprint for the project
    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId: task.projectId,
        state: 'ACTIVE',
      },
    });

    return this.prisma.timeLog.create({
      data: {
        taskId: dto.taskId,
        userId: 'current-user', // TODO: Get from session
        projectId: task.projectId,
        sprintId: activeSprint?.id,
        startedAt,
        endedAt,
        durationSec,
        note: dto.note,
        billable: dto.billable ?? true,
      },
      include: {
        task: { select: { id: true, title: true } },
        sprint: { select: { id: true, name: true } },
      },
    });
  }

  async update(
    id: string,
    dto: {
      startedAt?: string;
      endedAt?: string;
      note?: string;
      billable?: boolean;
    }
  ) {
    const updateData: any = {};

    if (dto.note !== undefined) updateData.note = dto.note;
    if (dto.billable !== undefined) updateData.billable = dto.billable;

    if (dto.startedAt || dto.endedAt) {
      const timeLog = await this.prisma.timeLog.findUnique({ where: { id } });
      if (!timeLog) throw new BadRequestException('Time log not found');

      const startedAt = dto.startedAt
        ? new Date(dto.startedAt)
        : timeLog.startedAt;
      const endedAt = dto.endedAt ? new Date(dto.endedAt) : timeLog.endedAt;

      if (startedAt >= endedAt) {
        throw new BadRequestException('Start time must be before end time');
      }

      updateData.startedAt = startedAt;
      updateData.endedAt = endedAt;
      updateData.durationSec = Math.floor(
        (endedAt.getTime() - startedAt.getTime()) / 1000
      );
    }

    return this.prisma.timeLog.update({
      where: { id },
      data: updateData,
      include: {
        task: { select: { id: true, title: true } },
        sprint: { select: { id: true, name: true } },
      },
    });
  }

  async getDailyReport(userId: string, date: string) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const logs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startedAt: { gte: startDate, lt: endDate },
      },
      include: {
        task: { select: { id: true, title: true } },
        sprint: { select: { id: true, name: true } },
      },
    });

    const totalSeconds = logs.reduce(
      (sum, log) => sum + (log.durationSec || 0),
      0
    );
    const billableSeconds = logs
      .filter((log) => log.billable)
      .reduce((sum, log) => sum + (log.durationSec || 0), 0);

    return {
      date,
      totalTime: totalSeconds,
      billableTime: billableSeconds,
      logs,
      summary: {
        totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
        billableHours: Math.round((billableSeconds / 3600) * 100) / 100,
        taskCount: logs.length,
      },
    };
  }

  async getWeeklyReport(userId: string, week: string) {
    const startDate = new Date(week);
    const endDate = new Date(week);
    endDate.setDate(endDate.getDate() + 7);

    const logs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startedAt: { gte: startDate, lt: endDate },
      },
      include: {
        task: { select: { id: true, title: true } },
        sprint: { select: { id: true, name: true } },
      },
    });

    // Group by day
    const dailyReports = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];
      dailyReports[dayStr] = {
        date: dayStr,
        totalTime: 0,
        billableTime: 0,
        taskCount: 0,
      };
    }

    logs.forEach((log) => {
      const day = log.startedAt.toISOString().split('T')[0];
      if (dailyReports[day]) {
        dailyReports[day].totalTime += log.durationSec || 0;
        if (log.billable) {
          dailyReports[day].billableTime += log.durationSec || 0;
        }
        dailyReports[day].taskCount += 1;
      }
    });

    const totalSeconds = logs.reduce(
      (sum, log) => sum + (log.durationSec || 0),
      0
    );
    const billableSeconds = logs
      .filter((log) => log.billable)
      .reduce((sum, log) => sum + (log.durationSec || 0), 0);

    return {
      week,
      totalTime: totalSeconds,
      billableTime: billableSeconds,
      dailyReports: Object.values(dailyReports),
      summary: {
        totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
        billableHours: Math.round((billableSeconds / 3600) * 100) / 100,
        taskCount: logs.length,
        averageHoursPerDay: Math.round((totalSeconds / 3600 / 7) * 100) / 100,
      },
    };
  }
}
