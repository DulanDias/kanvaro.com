# Data Model

Core entities modeled in Prisma:

- InstanceSettings
- User, Session
- Project, Board, Column
- Task, TaskAssignee, Label, TaskLabel
- Sprint
- Comment, Attachment
- TimeLog
- Notification
- AuditEvent

Ordering uses LexoRank-like `orderKey` on columns and tasks.
