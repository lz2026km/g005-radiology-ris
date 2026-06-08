/**
 * G005 放射RIS系统 v3.0.1 - Prisma Service
 */
import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: process.env['NODE_ENV'] === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
    })
  }
}
