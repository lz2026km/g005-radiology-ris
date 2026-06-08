/**
 * G005 放射RIS系统 v3.0.1 - 用户模块
 */
import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
