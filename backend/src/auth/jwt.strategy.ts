/**
 * G005 放射RIS系统 v3.0.1 - JWT 策略
 */
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { JwtPayload } from './auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] ?? 'g005-dev-secret-change-in-prod',
    })
  }

  validate(payload: JwtPayload): { sub: string; username: string; role: string } {
    return { sub: payload.sub, username: payload.username, role: payload.role }
  }
}
