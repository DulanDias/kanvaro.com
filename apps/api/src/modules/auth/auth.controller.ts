import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(204)
  @ApiOperation({ summary: 'Password login' })
  @ApiResponse({ status: 204, description: 'Logged in, cookies set' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const { sessionId, refreshToken } =
      await this.authService.loginWithPassword(dto.email, dto.password);
    this.authService.setAuthCookies(res, sessionId, refreshToken);
    return;
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Logout and revoke session' })
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    this.authService.clearAuthCookies(res);
    return;
  }

  @Get('me')
  @ApiOperation({ summary: 'Current user' })
  async me() {
    // TODO: Replace with real session guard
    // Return a minimal user shape for local/dev to unblock UI
    return { id: 'dev-user', email: 'dev@kanvaro.local', name: 'Developer' };
  }
}
