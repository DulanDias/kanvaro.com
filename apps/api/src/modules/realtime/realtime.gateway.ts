import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-board')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string }
  ) {
    client.join(`board:${data.boardId}`);
    this.logger.log(`Client ${client.id} joined board ${data.boardId}`);
  }

  @SubscribeMessage('leave-board')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string }
  ) {
    client.leave(`board:${data.boardId}`);
    this.logger.log(`Client ${client.id} left board ${data.boardId}`);
  }

  // Emit task updated event to board room
  emitTaskUpdated(boardId: string, task: Record<string, unknown>) {
    this.server.to(`board:${boardId}`).emit('task.updated', task);
  }

  // Emit task moved event to board room
  emitTaskMoved(boardId: string, task: Record<string, unknown>) {
    this.server.to(`board:${boardId}`).emit('task.moved', task);
  }

  // Emit sprint started event to project room
  emitSprintStarted(projectId: string, sprint: Record<string, unknown>) {
    this.server.to(`project:${projectId}`).emit('sprint.started', sprint);
  }

  // Emit sprint closed event to project room
  emitSprintClosed(projectId: string, sprint: Record<string, unknown>) {
    this.server.to(`project:${projectId}`).emit('sprint.closed', sprint);
  }

  // Emit time log started event
  emitTimeLogStarted(userId: string, timeLog: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit('timelog.started', timeLog);
  }

  // Emit time log stopped event
  emitTimeLogStopped(userId: string, timeLog: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit('timelog.stopped', timeLog);
  }
}
