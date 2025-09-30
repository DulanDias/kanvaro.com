import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBurndown(sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new Error('Sprint not found');

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
        ideal: Math.max(
          0,
          totalPoints -
            (totalPoints * (d.getTime() - startDate.getTime())) /
              (endDate.getTime() - startDate.getTime())
        ),
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

  async getCumulativeFlow(projectId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get task status changes over time
    const statusChanges = await this.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        status,
        COUNT(*) as count
      FROM tasks 
      WHERE project_id = ${projectId}
        AND created_at >= ${fromDate}
        AND created_at <= ${toDate}
      GROUP BY DATE(created_at), status
      ORDER BY date, status
    `;

    // Generate daily cumulative flow
    const days = [];
    const statuses = ['OPEN', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const cumulative = {};

    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      const dayData = { date: dayStr };

      statuses.forEach((status) => {
        const change = (statusChanges as any[]).find(
          (change: any) =>
            change.date.toISOString().split('T')[0] === dayStr &&
            change.status === status
        );
        const count = change ? parseInt(change.count) : 0;
        cumulative[status] = (cumulative[status] || 0) + count;
        dayData[status.toLowerCase()] = cumulative[status];
      });

      days.push(dayData);
    }

    return {
      projectId,
      from: fromDate,
      to: toDate,
      days,
    };
  }

  async getVelocity(projectId: string, limitSprints: number = 6) {
    const sprints = await this.prisma.sprint.findMany({
      where: { projectId, state: 'CLOSED' },
      orderBy: { endDate: 'desc' },
      take: limitSprints,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });

    const velocityData = [];

    for (const sprint of sprints) {
      const completedTasks = await this.prisma.task.findMany({
        where: {
          projectId,
          status: 'DONE',
          createdAt: { gte: sprint.startDate, lte: sprint.endDate },
        },
        select: { points: true },
      });

      const velocity = completedTasks.reduce(
        (sum, task) => sum + (task.points || 0),
        0
      );

      velocityData.push({
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
      });
    }

    const averageVelocity =
      velocityData.length > 0
        ? velocityData.reduce((sum, data) => sum + data.velocity, 0) /
          velocityData.length
        : 0;

    return {
      projectId,
      averageVelocity,
      sprints: velocityData,
      trend: this.calculateTrend(velocityData.map((d) => d.velocity)),
    };
  }

  async getThroughput(projectId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get completed tasks by week
    const weeklyThroughput = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('week', updated_at) as week,
        COUNT(*) as completed_tasks
      FROM tasks 
      WHERE project_id = ${projectId}
        AND status = 'DONE'
        AND updated_at >= ${fromDate}
        AND updated_at <= ${toDate}
      GROUP BY DATE_TRUNC('week', updated_at)
      ORDER BY week
    `;

    // Get task completion times
    const completionTimes = await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400 as days_to_complete
      FROM tasks 
      WHERE project_id = ${projectId}
        AND status = 'DONE'
        AND updated_at >= ${fromDate}
        AND updated_at <= ${toDate}
    `;

    const avgCompletionTime =
      (completionTimes as any[]).length > 0
        ? (completionTimes as any[]).reduce(
            (sum: number, time: any) => sum + time.days_to_complete,
            0
          ) / (completionTimes as any[]).length
        : 0;

    return {
      projectId,
      from: fromDate,
      to: toDate,
      weeklyThroughput,
      averageCompletionTime: Math.round(avgCompletionTime * 100) / 100,
      totalCompleted: (completionTimes as any[]).length,
    };
  }

  async getTimeTracking(projectId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const timeLogs = await this.prisma.timeLog.findMany({
      where: {
        projectId,
        startedAt: { gte: fromDate, lte: toDate },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
        sprint: { select: { id: true, name: true } },
      },
    });

    // Group by user
    const userTime = {};
    timeLogs.forEach((log) => {
      const userId = log.userId;
      if (!userTime[userId]) {
        userTime[userId] = {
          user: log.user,
          totalTime: 0,
          billableTime: 0,
          taskCount: 0,
          tasks: [],
        };
      }
      userTime[userId].totalTime += log.durationSec || 0;
      if (log.billable) {
        userTime[userId].billableTime += log.durationSec || 0;
      }
      userTime[userId].taskCount += 1;
      userTime[userId].tasks.push(log);
    });

    const totalTime = timeLogs.reduce(
      (sum, log) => sum + (log.durationSec || 0),
      0
    );
    const billableTime = timeLogs
      .filter((log) => log.billable)
      .reduce((sum, log) => sum + (log.durationSec || 0), 0);

    return {
      projectId,
      from: fromDate,
      to: toDate,
      totalTime,
      billableTime,
      totalHours: Math.round((totalTime / 3600) * 100) / 100,
      billableHours: Math.round((billableTime / 3600) * 100) / 100,
      userTime: Object.values(userTime),
      summary: {
        totalLogs: timeLogs.length,
        averageTimePerLog:
          timeLogs.length > 0 ? totalTime / timeLogs.length : 0,
        billablePercentage:
          totalTime > 0 ? Math.round((billableTime / totalTime) * 100) : 0,
      },
    };
  }

  async getTeamPerformance(projectId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get team members and their contributions
    const teamStats = await this.prisma.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT t.id) as tasks_assigned,
        COUNT(DISTINCT CASE WHEN t.status = 'DONE' THEN t.id END) as tasks_completed,
        COALESCE(SUM(tl.duration_sec), 0) as total_time_seconds,
        COALESCE(SUM(CASE WHEN tl.billable THEN tl.duration_sec ELSE 0 END), 0) as billable_time_seconds
      FROM users u
      LEFT JOIN task_assignees ta ON u.id = ta.user_id
      LEFT JOIN tasks t ON ta.task_id = t.id AND t.project_id = ${projectId}
      LEFT JOIN time_logs tl ON u.id = tl.user_id AND tl.project_id = ${projectId}
        AND tl.started_at >= ${fromDate} AND tl.started_at <= ${toDate}
      WHERE u.role != 'VIEWER'
      GROUP BY u.id, u.name, u.email
      ORDER BY tasks_completed DESC
    `;

    // Get project velocity
    const velocity = await this.getVelocity(projectId, 6);

    return {
      projectId,
      from: fromDate,
      to: toDate,
      teamStats,
      velocity: velocity.averageVelocity,
      performance: {
        totalTasks: (teamStats as any[]).reduce(
          (sum: number, member: any) => sum + parseInt(member.tasks_assigned),
          0
        ),
        completedTasks: (teamStats as any[]).reduce(
          (sum: number, member: any) => sum + parseInt(member.tasks_completed),
          0
        ),
        completionRate:
          (teamStats as any[]).length > 0
            ? (teamStats as any[]).reduce(
                (sum: number, member: any) =>
                  sum + parseInt(member.tasks_completed),
                0
              ) /
              (teamStats as any[]).reduce(
                (sum: number, member: any) =>
                  sum + parseInt(member.tasks_assigned),
                0
              )
            : 0,
      },
    };
  }

  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'stable';
  }
}
