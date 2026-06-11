import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BackupService } from './backup.service'

@ApiTags('backup')
@Controller('backup')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BackupController {
  constructor(private readonly backup: BackupService) {}

  @Post()
  @ApiOperation({ summary: '创建备份' })
  create(@Query('type') type: string, @Req() req: { user: { sub: string } }) {
    return this.backup.createBackup(type || 'FULL', req.user.sub)
  }

  @Get()
  @ApiOperation({ summary: '备份列表' })
  list(@Query() query: { page?: string; pageSize?: string; type?: string }) {
    return this.backup.listBackups({
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      type: query.type,
    })
  }
}
