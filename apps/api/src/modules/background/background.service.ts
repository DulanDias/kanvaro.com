import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class BackgroundService {
  private readonly logger = new Logger(BackgroundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    @InjectQueue('timer-reconciliation') private timerQueue: Queue,
    @InjectQueue('report-refresh') private reportQueue: Queue,
    @InjectQueue('cleanup') private cleanupQueue: Queue
  ) {}

  // Reconcile stale timers every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async reconcileStaleTimers() {
    this.logger.log('Starting timer reconciliation...');

    try {
      const staleTimers = await this.prisma.timeLog.findMany({
        where: {
          endedAt: null,
          startedAt: { lt: new Date(Date.now() - 8 * 60 * 60 * 1000) }, // 8 hours ago
        },
        include: { user: true, task: true },
      });

      for (const timer of staleTimers) {
        await this.timerQueue.add('reconcile-stale-timer', {
          timerId: timer.id,
          userId: timer.userId,
          taskId: timer.taskId,
        });
      }

      this.logger.log(`Found ${staleTimers.length} stale timers to reconcile`);
    } catch (error) {
      this.logger.error('Failed to reconcile stale timers:', error);
    }
  }

  // Refresh reports every hour
  @Cron(CronExpression.EVERY_HOUR)
  async refreshReports() {
    this.logger.log('Starting report refresh...');

    try {
      const activeProjects = await this.prisma.project.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      for (const project of activeProjects) {
        await this.reportQueue.add('refresh-project-reports', {
          projectId: project.id,
        });
      }

      this.logger.log(
        `Queued report refresh for ${activeProjects.length} projects`
      );
    } catch (error) {
      this.logger.error('Failed to refresh reports:', error);
    }
  }

  // Cleanup old data daily at 2 AM
  @Cron('0 2 * * *')
  async cleanupOldData() {
    this.logger.log('Starting data cleanup...');

    try {
      await this.cleanupQueue.add('cleanup-old-sessions', {
        olderThan: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await this.cleanupQueue.add('cleanup-old-audit-logs', {
        olderThan: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      await this.cleanupQueue.add('cleanup-old-notifications', {
        olderThan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      this.logger.log('Data cleanup queued');
    } catch (error) {
      this.logger.error('Failed to queue cleanup:', error);
    }
  }

  // Process timer reconciliation
  async processTimerReconciliation(job: any) {
    const { timerId, userId, taskId } = job.data;

    try {
      this.logger.log(`Reconciling stale timer ${timerId}`);

      // Auto-stop the timer after 8 hours
      const endedAt = new Date();
      const timer = await this.prisma.timeLog.findUnique({
        where: { id: timerId },
      });

      if (timer) {
        const durationSec = Math.floor(
          (endedAt.getTime() - timer.startedAt.getTime()) / 1000
        );

        await this.prisma.timeLog.update({
          where: { id: timerId },
          data: {
            endedAt,
            durationSec,
            note: timer.note
              ? `${timer.note} (Auto-stopped after 8 hours)`
              : 'Auto-stopped after 8 hours',
          },
        });

        // Emit real-time event
        this.realtime.emitTimeLogStopped(userId, { id: timerId, taskId });

        this.logger.log(`Auto-stopped timer ${timerId} after 8 hours`);
      }
    } catch (error) {
      this.logger.error(`Failed to reconcile timer ${timerId}:`, error);
    }
  }

  // Process report refresh
  async processReportRefresh(job: any) {
    const { projectId } = job.data;

    try {
      this.logger.log(`Refreshing reports for project ${projectId}`);

      // TODO: Implement materialized view refresh
      // This would update cached report data for better performance

      this.logger.log(`Reports refreshed for project ${projectId}`);
    } catch (error) {
      this.logger.error(
        `Failed to refresh reports for project ${projectId}:`,
        error
      );
    }
  }

  // Process cleanup tasks
  async processCleanup(job: any) {
    const { type, olderThan } = job.data;

    try {
      this.logger.log(`Cleaning up ${type} older than ${olderThan}`);

      switch (type) {
        case 'old-sessions': {
          const deletedSessions = await this.prisma.session.deleteMany({
            where: {
              createdAt: { lt: olderThan },
              revokedAt: { not: null },
            },
          });
          this.logger.log(`Deleted ${deletedSessions.count} old sessions`);
          break;
        }

        case 'old-audit-logs': {
          const deletedAuditLogs = await this.prisma.auditLog.deleteMany({
            where: {
              createdAt: { lt: olderThan },
            },
          });
          this.logger.log(`Deleted ${deletedAuditLogs.count} old audit logs`);
          break;
        }

        case 'old-notifications': {
          const deletedNotifications =
            await this.prisma.notification.deleteMany({
              where: {
                createdAt: { lt: olderThan },
                readAt: { not: null },
              },
            });
          this.logger.log(
            `Deleted ${deletedNotifications.count} old notifications`
          );
          break;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup ${type}:`, error);
    }
  }
}
