/**
 * G005 放射RIS系统 v3.0.1 - 用户服务
 */
import { Injectable } from '@nestjs/common'
import { hash } from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list(skip = 0, take = 20) {
    return this.prisma.user.findMany({
      skip,
      take,
      select: { id: true, username: true, fullName: true, role: true, department: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async create(input: {
    username: string
    password: string
    fullName: string
    role: string
    department?: string
  }) {
    const passwordHash = await hash(input.password, 10)
    return this.prisma.user.create({
      data: {
        username: input.username,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        department: input.department,
      },
    })
  }
}
