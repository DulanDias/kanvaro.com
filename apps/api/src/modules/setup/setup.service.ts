import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  OrganizationDto,
  AdminDto,
  EmailTestDto,
  DefaultsDto,
  RuntimeDto,
} from './dto/setup.dto';
import * as argon2 from 'argon2';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SetupService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    const settings = await this.prisma.instanceSettings.findFirst();

    return {
      isInitialized: settings?.isInitialized || false,
      checks: {
        db: 'ok', // TODO: Implement actual DB check
        redis: 'ok', // TODO: Implement actual Redis check
        s3: 'ok', // TODO: Implement actual S3 check
        ses: 'ok', // TODO: Implement actual SES check
        baseUrl: 'ok', // TODO: Implement actual base URL check
      },
    };
  }

  async createOrganization(organizationDto: OrganizationDto) {
    const settings = await this.prisma.instanceSettings.findFirst();

    if (settings?.isInitialized) {
      throw new Error('Instance is already initialized');
    }

    const updatedSettings = await this.prisma.instanceSettings.upsert({
      where: { id: '1' },
      update: {
        orgName: organizationDto.name,
        organizationLogo: organizationDto.logoKey,
        primaryColor: organizationDto.primaryColor,
        timezone: organizationDto.timezone || 'UTC',
      },
      create: {
        id: '1',
        orgName: organizationDto.name,
        organizationLogo: organizationDto.logoKey,
        primaryColor: organizationDto.primaryColor,
        timezone: organizationDto.timezone || 'UTC',
      },
    });

    return { success: true, settings: updatedSettings };
  }

  async createAdmin(adminDto: AdminDto) {
    const settings = await this.prisma.instanceSettings.findFirst();

    if (settings?.isInitialized) {
      throw new Error('Instance is already initialized');
    }

    // Check if admin already exists
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminDto.email },
    });

    if (existingAdmin) {
      throw new Error('Admin user already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(adminDto.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB
      timeCost: 3,
      parallelism: 2,
    });

    // Create admin user
    const admin = await this.prisma.user.create({
      data: {
        email: adminDto.email,
        name: adminDto.name,
        passwordHash,
        role: 'OWNER',
        emailVerifiedAt: new Date(), // Auto-verify for setup
        mfaEnabled: adminDto.enableMfa || false,
      },
    });

    return {
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  async testEmail(emailTestDto: EmailTestDto) {
    // TODO: Implement actual email sending via SES
    // For now, just return success
    return {
      success: true,
      message: 'Test email sent successfully',
      recipient: emailTestDto.to,
    };
  }

  async createDefaults(defaultsDto: DefaultsDto) {
    const settings = await this.prisma.instanceSettings.findFirst();

    if (settings?.isInitialized) {
      throw new Error('Instance is already initialized');
    }

    // Get the admin user
    const admin = await this.prisma.user.findFirst({
      where: { role: 'OWNER' },
    });

    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Create default project
    const project = await this.prisma.project.create({
      data: {
        name: 'Default Project',
        key: 'DEFAULT',
        ownerId: admin.id,
      },
    });

    // Create default board
    const board = await this.prisma.board.create({
      data: {
        name: 'Default Board',
        projectId: project.id,
      },
    });

    // Create default columns
    const columns = await Promise.all([
      this.prisma.column.create({
        data: {
          name: 'Backlog',
          boardId: board.id,
          orderKey: '0|000000',
        },
      }),
      this.prisma.column.create({
        data: {
          name: 'In Progress',
          boardId: board.id,
          orderKey: '0|000001',
        },
      }),
      this.prisma.column.create({
        data: {
          name: 'Review',
          boardId: board.id,
          orderKey: '0|000002',
        },
      }),
      this.prisma.column.create({
        data: {
          name: 'Done',
          boardId: board.id,
          orderKey: '0|000003',
        },
      }),
    ]);

    // Create sample data if requested
    if (defaultsDto.createSampleData) {
      const backlogColumn = columns[0];

      // Create sample tasks
      const sampleTasks = [
        'Set up development environment',
        'Create user authentication system',
        'Implement project management features',
        'Design user interface',
        'Write documentation',
        'Set up CI/CD pipeline',
        'Implement testing framework',
        'Deploy to production',
        'Monitor application performance',
        'Gather user feedback',
      ];

      await Promise.all(
        sampleTasks.map((title, index) =>
          this.prisma.task.create({
            data: {
              title,
              projectId: project.id,
              boardId: board.id,
              columnId: backlogColumn.id,
              createdBy: admin.id,
              orderKey: `0|${index.toString().padStart(6, '0')}`,
            },
          })
        )
      );
    }

    return {
      success: true,
      project: { id: project.id, name: project.name, key: project.key },
      board: { id: board.id, name: board.name },
      columns: columns.map((col) => ({ id: col.id, name: col.name })),
    };
  }

  async configureRuntime(runtimeDto: RuntimeDto) {
    const settings = await this.prisma.instanceSettings.findFirst();

    if (settings?.isInitialized) {
      throw new Error('Instance is already initialized');
    }

    const updatedSettings = await this.prisma.instanceSettings.upsert({
      where: { id: '1' },
      update: {
        appBaseUrl: runtimeDto.appBaseUrl,
        cookieDomain: runtimeDto.cookieDomain,
        cspMode: runtimeDto.cspMode,
      },
      create: {
        id: '1',
        appBaseUrl: runtimeDto.appBaseUrl,
        cookieDomain: runtimeDto.cookieDomain,
        cspMode: runtimeDto.cspMode,
      },
    });

    return { success: true, settings: updatedSettings };
  }

  async completeSetup() {
    const settings = await this.prisma.instanceSettings.findFirst();

    if (settings?.isInitialized) {
      throw new Error('Instance is already initialized');
    }

    // Mark as initialized
    await this.prisma.instanceSettings.upsert({
      where: { id: '1' },
      update: {
        isInitialized: true,
      },
      create: {
        id: '1',
        isInitialized: true,
      },
    });

    // Create audit event
    await this.prisma.auditLog.create({
      data: {
        userId: 'system', // System user for setup
        entityType: 'instance',
        entityId: '1',
        action: 'initialized',
        metadata: { isInitialized: true },
      },
    });

    return { success: true, initialized: true };
  }
}
