import { Module } from '@nestjs/common';
import { TimeLogsController } from './time-logs.controller';
import { TimeLogsService } from './time-logs.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [TimeLogsController],
  providers: [TimeLogsService],
})
export class TimeLogsModule {}
