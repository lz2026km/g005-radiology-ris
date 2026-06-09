/**
 * G005 放射RIS系统 v3.0.2 - 文件管理
 * 2 端点:GET upload-url / POST upload-complete
 */
import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

@Module({
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
