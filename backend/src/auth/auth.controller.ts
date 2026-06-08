/**
 * G005 放射RIS系统 v3.0.1 - 认证控制器
 */
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { AuthService } from './auth.service'

export const LoginSchema = z.object({
  username: z.string().min(2).max(64),
  password: z.string().min(6).max(128),
})
export type LoginDto = z.infer<typeof LoginSchema>

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(8).max(128),
})
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '账号密码登录' })
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.auth.login(dto.username, dto.password)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '当前登录用户' })
  me(@Req() req: { user: { sub: string } }) {
    return this.auth.me(req.user.sub)
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  changePassword(
    @Req() req: { user: { sub: string } },
    @Body(new ZodValidationPipe(ChangePasswordSchema)) dto: ChangePasswordDto
  ) {
    return this.auth.changePassword(req.user.sub, dto.oldPassword, dto.newPassword)
  }
}
