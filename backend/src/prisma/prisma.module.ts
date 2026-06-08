/**
 * G005 放射RIS系统 v3.0.1 - Prisma Module
 */
import { Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  constructor(public readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect()
  }
}
