import { QuestionAttachmentsRepository } from '../../src/domain/forum/application/repositories/question-attachments-repository'
import { QuestionAttachment } from '../../src/domain/forum/enterprise/entities/question-attachment'

export class InMemoryQuestionAttachmentsRepository
  implements QuestionAttachmentsRepository
{
  public items: QuestionAttachment[] = []

  async createMany(attachments: QuestionAttachment[]): Promise<void> {
    this.items.push(...attachments)
  }

  async deleteMany(attachments: QuestionAttachment[]): Promise<void> {
    const items = this.items.filter((item) =>
      attachments.some((attachment) => !attachment.equals(item)),
    )

    this.items = items
  }

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
