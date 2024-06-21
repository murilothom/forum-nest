import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { z } from 'zod'

const queryParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
})

const queryParamsValidationPipe = new ZodValidationPipe(queryParamsSchema)

type QueryParamsSchema = z.infer<typeof queryParamsSchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async handle(@Query(queryParamsValidationPipe) params: QueryParamsSchema) {
    const { page } = params
    const perPage = 20

    const questions = await this.prismaService.question.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { questions }
  }
}
