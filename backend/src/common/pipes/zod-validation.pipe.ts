/**
 * G005 放射RIS系统 v3.0.1 - Zod 校验管道
 */
import { BadRequestException, PipeTransform, ArgumentMetadata } from '@nestjs/common'
import { ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException({
        ok: false,
        code: 'VALIDATION_ERROR',
        errors: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      })
    }
    return result.data
  }
}
