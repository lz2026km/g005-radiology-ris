/**
 * G005 放射RIS系统 v3.0.1 - 用户控制器
 */
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.users.list(Number(skip ?? 0), Number(take ?? 20))
  }
}
