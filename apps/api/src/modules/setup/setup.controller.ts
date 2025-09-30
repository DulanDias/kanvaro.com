import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { SetupStatusDto, OrganizationDto, AdminDto, EmailTestDto, DefaultsDto, RuntimeDto } from './dto/setup.dto';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get setup status and preflight checks' })
  @ApiResponse({ status: 200, description: 'Setup status and checks' })
  async getStatus() {
    return this.setupService.getStatus();
  }

  @Post('organization')
  @ApiOperation({ summary: 'Set up organization details' })
  @ApiBody({ type: OrganizationDto })
  @ApiResponse({ status: 201, description: 'Organization created' })
  @ApiResponse({ status: 400, description: 'Invalid organization data' })
  async createOrganization(@Body() organizationDto: OrganizationDto) {
    try {
      return await this.setupService.createOrganization(organizationDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('admin')
  @ApiOperation({ summary: 'Create admin account' })
  @ApiBody({ type: AdminDto })
  @ApiResponse({ status: 201, description: 'Admin account created' })
  @ApiResponse({ status: 400, description: 'Invalid admin data' })
  async createAdmin(@Body() adminDto: AdminDto) {
    try {
      return await this.setupService.createAdmin(adminDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Test email configuration' })
  @ApiBody({ type: EmailTestDto })
  @ApiResponse({ status: 200, description: 'Email test sent' })
  @ApiResponse({ status: 400, description: 'Email test failed' })
  async testEmail(@Body() emailTestDto: EmailTestDto) {
    try {
      return await this.setupService.testEmail(emailTestDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('defaults')
  @ApiOperation({ summary: 'Create default project and board' })
  @ApiBody({ type: DefaultsDto })
  @ApiResponse({ status: 201, description: 'Defaults created' })
  @ApiResponse({ status: 400, description: 'Invalid defaults data' })
  async createDefaults(@Body() defaultsDto: DefaultsDto) {
    try {
      return await this.setupService.createDefaults(defaultsDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('runtime')
  @ApiOperation({ summary: 'Configure runtime settings' })
  @ApiBody({ type: RuntimeDto })
  @ApiResponse({ status: 200, description: 'Runtime settings configured' })
  @ApiResponse({ status: 400, description: 'Invalid runtime data' })
  async configureRuntime(@Body() runtimeDto: RuntimeDto) {
    try {
      return await this.setupService.configureRuntime(runtimeDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete setup process' })
  @ApiResponse({ status: 200, description: 'Setup completed' })
  @ApiResponse({ status: 400, description: 'Setup cannot be completed' })
  async completeSetup() {
    try {
      return await this.setupService.completeSetup();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
