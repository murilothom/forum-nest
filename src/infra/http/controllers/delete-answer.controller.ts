import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common'
import { CurrentUser } from '../../auth/current-user-decorator'
import { UserPayload } from '../../auth/jtw.strategy'
import { DeleteAnswerUseCase } from '../../../domain/forum/application/use-cases/delete-answer'

@Controller('/answers/:id')
export class DeleteAnswersController {
  constructor(private readonly deleteAnswerUseCase: DeleteAnswerUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') answerId: string,
  ) {
    const userId = user.sub

    const result = await this.deleteAnswerUseCase.execute({
      answerId,
      authorId: userId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
