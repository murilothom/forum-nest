import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/ZodValidationPipe'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user-decorator'
import { UserPayload } from '../auth/jtw.strategy'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createQuestionBodySchema))
    body: CreateQuestionBodySchema,
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
