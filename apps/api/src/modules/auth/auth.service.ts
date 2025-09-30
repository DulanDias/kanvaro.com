import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { FastifyReply } from 'fastify';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async loginWithPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionId = uuidv4();
    const refreshToken = uuidv4();

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        ipHash: 'todo',
        userAgentHash: 'todo',
        refreshTokenHash: refreshToken,
      },
    });

    return { sessionId, refreshToken };
  }

  setAuthCookies(res: FastifyReply, sessionId: string, refreshToken: string) {
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    const secure = process.env.NODE_ENV !== 'development';

    res.setCookie('sid', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain: cookieDomain,
      maxAge: 60 * 60 * 24 * 7,
    });
    res.setCookie('sr', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      domain: cookieDomain,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  clearAuthCookies(res: FastifyReply) {
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    const secure = process.env.NODE_ENV !== 'development';
    res.clearCookie('sid', { path: '/', domain: cookieDomain, secure });
    res.clearCookie('sr', { path: '/', domain: cookieDomain, secure });
  }
}
