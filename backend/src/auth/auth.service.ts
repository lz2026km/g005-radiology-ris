/**
 * G005 放射RIS系统 v3.0.1 - 认证服务
 */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

export interface JwtPayload {
  sub: string
  username: string
  role: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login(username: string, password: string): Promise<{ accessToken: string; user: { id: string; username: string; role: string } }> {
    const user = await this.prisma.user.findUnique({ where: { username } })
    if (!user) throw new UnauthorizedException('账号或密码错误')
    const ok = await compare(password, user.passwordHash)
    if (!ok) throw new UnauthorizedException('账号或密码错误')
    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role }
    const accessToken = await this.jwt.signAsync(payload)
    return {
      accessToken,
      user: { id: user.id, username: user.username, role: user.role },
    }
  }

  async me(userId: string): Promise<{ id: string; username: string; role: string; fullName: string }> {
    const u = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!u) throw new UnauthorizedException('用户不存在')
    return { id: u.id, username: u.username, role: u.role, fullName: u.fullName }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ ok: true }> {
    const u = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!u) throw new UnauthorizedException('用户不存在')
    if (!(await compare(oldPassword, u.passwordHash))) throw new UnauthorizedException('原密码错误')
    const newHash = await hash(newPassword, 10)
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } })
    return { ok: true }
  }
}
