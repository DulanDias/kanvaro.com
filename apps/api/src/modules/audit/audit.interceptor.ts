import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id || null; // TODO: ensure auth guard attaches user
    const path = req.route?.path || req.url;
    const method = req.method;

    return next.handle().pipe(
      tap(async () => {
        try {
          await this.audit.log({
            userId,
            action: `${method} ${path}`,
            entityType: null,
            entityId: null,
            metadata: {
              params: req.params,
              query: req.query,
              body: req.body ? redactSecrets(req.body) : undefined,
              statusCode: req.res?.statusCode,
            },
          });
        } catch (err) {
          void err;
        }
      })
    );
  }
}

function redactSecrets(obj: Record<string, unknown>) {
  const clone = JSON.parse(JSON.stringify(obj));
  const redactKeys = ['password', 'token', 'secret'];
  for (const key of Object.keys(clone)) {
    if (redactKeys.includes(key.toLowerCase())) {
      clone[key] = '***redacted***';
    }
  }
  return clone;
}
