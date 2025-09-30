import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Kanvaro API',
      version: '1.0.0',
      description: 'Agile project management API',
      status: 'running',
    };
  }
}
