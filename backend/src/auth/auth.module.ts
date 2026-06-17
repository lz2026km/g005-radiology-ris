/**
 * G005 放射RIS系统 v3.0.1 - 认证模块
 * 简版:登录 / 刷新 / 当前用户 / 修改密码
 */
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'

const isProd = process.env['NODE_ENV'] === 'production'
const jwtSecret = process.env['JWT_SECRET']

if (isProd && !jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required in production')
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret ?? 'g005-dev-secret-change-in-prod',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
