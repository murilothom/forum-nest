import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { z } from 'zod'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CurrentUser } from '../../auth/current-user-decorator'
import { UserPayload } from '../../auth/jtw.strategy'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

const createQuestionValidationPipe = new ZodValidationPipe(
  createQuestionBodySchema,
)

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(createQuestionValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content, title } = body
    const userId = user.sub

    const slug = this.convertToSlug(title)

    await this.prismaService.question.create({
      data: {
        authorId: userId,
        title,
        content,
        slug,
      },
    })
  }

  private convertToSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}
