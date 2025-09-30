import { Module } from '@nestjs/common';
import { BackgroundService } from './background.service';
import { BullModule } from '@nestjs/bull';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'timer-reconciliation' },
      { name: 'report-refresh' },
      { name: 'cleanup' }
    ),
    RealtimeModule,
  ],
  providers: [BackgroundService],
})
export class BackgroundModule {}
