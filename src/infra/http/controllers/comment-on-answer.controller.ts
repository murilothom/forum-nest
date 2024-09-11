import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { CurrentUser } from '../../auth/current-user-decorator'
import { UserPayload } from '../../auth/jtw.strategy'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CommentOnAnswerUseCase } from '../../../domain/forum/application/use-cases/comment-on-answer'

const commentOnAnswerBodySchema = z.object({
  content: z.string(),
})

const commentOnAnswerValidationPipe = new ZodValidationPipe(
  commentOnAnswerBodySchema,
)

type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>

@Controller('/answers/:answerId/comments')
export class CommentOnAnswerController {
  constructor(
    private readonly commentOnAnswerUseCase: CommentOnAnswerUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(commentOnAnswerValidationPipe) body: CommentOnAnswerBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('answerId') answerId: string,
  ) {
    const { content } = body
    const userId = user.sub

    const result = await this.commentOnAnswerUseCase.execute({
      content,
      answerId,
      authorId: userId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
