import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common'
import { z } from 'zod'
import { CurrentUser } from '../../auth/current-user-decorator'
import { UserPayload } from '../../auth/jtw.strategy'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { EditAnswerUseCase } from '../../../domain/forum/application/use-cases/edit-answer'

const editAnswersBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()).default([]),
})

const editAnswersValidationPipe = new ZodValidationPipe(editAnswersBodySchema)

type EditAnswersBodySchema = z.infer<typeof editAnswersBodySchema>

@Controller('/answers/:id')
export class EditAnswersController {
  constructor(private readonly editAnswerUseCase: EditAnswerUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(editAnswersValidationPipe) body: EditAnswersBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') answerId: string,
  ) {
    const { content, attachments } = body
    const userId = user.sub

    const result = await this.editAnswerUseCase.execute({
      content,
      authorId: userId,
      attachmentsIds: attachments,
      answerId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
