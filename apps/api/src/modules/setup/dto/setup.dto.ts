import { IsString, IsEmail, IsOptional, IsBoolean, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetupStatusDto {
  @ApiProperty({ description: 'Whether the instance is initialized' })
  isInitialized: boolean;

  @ApiProperty({ description: 'Preflight check results' })
  checks: {
    db: string;
    redis: string;
    s3: string;
    ses: string;
    baseUrl: string;
  };
}

export class OrganizationDto {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Logo S3 key', required: false })
  @IsOptional()
  @IsString()
  logoKey?: string;

  @ApiProperty({ description: 'Primary color', required: false })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class AdminDto {
  @ApiProperty({ description: 'Admin full name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Admin email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Admin password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Enable MFA', required: false })
  @IsOptional()
  @IsBoolean()
  enableMfa?: boolean;
}

export class EmailTestDto {
  @ApiProperty({ description: 'Test email recipient' })
  @IsEmail()
  to: string;
}

export class DefaultsDto {
  @ApiProperty({ description: 'Create sample data', required: false })
  @IsOptional()
  @IsBoolean()
  createSampleData?: boolean;
}

export class RuntimeDto {
  @ApiProperty({ description: 'App base URL' })
  @IsUrl()
  appBaseUrl: string;

  @ApiProperty({ description: 'API base URL' })
  @IsUrl()
  apiBaseUrl: string;

  @ApiProperty({ description: 'Cookie domain' })
  @IsString()
  cookieDomain: string;

  @ApiProperty({ description: 'CSP mode', enum: ['strict', 'standard'] })
  @IsEnum(['strict', 'standard'])
  cspMode: 'strict' | 'standard';
}
