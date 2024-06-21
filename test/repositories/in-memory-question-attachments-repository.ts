import { QuestionAttachmentsRepository } from '../../src/domain/forum/application/repositories/question-attachments-repository'
import { QuestionAttachment } from '../../src/domain/forum/enterprise/entities/question-attachment'

export class InMemoryQuestionAttachmentsRepository
  implements QuestionAttachmentsRepository
{
  public items: QuestionAttachment[] = []

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const items = this.items.filter(
      (item) => item.questionId.toString() === questionId,
    )

    return items
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    const items = this.items.filter(
      (item) => item.questionId.toString() !== questionId,
    )

    this.items = items
  }
}
