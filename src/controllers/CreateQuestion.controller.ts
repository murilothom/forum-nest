import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/ZodValidationPipe'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

const createQuestionBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle() {
    return 'ok'
  }
}
