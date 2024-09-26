import { EventHandler } from '@/core/events/event-handler'
import { DomainEvents } from '@/core/events/domain-events'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'
import { QuestionBestAnswerEvent } from '@/domain/forum/enterprise/events/question-best-answer-chosen-event'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnQuestionBestAnswerChosen implements EventHandler {
  constructor(
    private answersRepository: AnswersRepository,
    private sendNotificationUseCase: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionBestAnswerNotification.bind(this),
      QuestionBestAnswerEvent.name,
    )
  }

  private async sendQuestionBestAnswerNotification({
    question,
    bestAnswerId,
  }: QuestionBestAnswerEvent) {
    const answer = await this.answersRepository.findById(
      bestAnswerId.toString(),
    )

    if (!answer) {
      return
    }

    await this.sendNotificationUseCase.execute({
      recipientId: answer?.authorId.toString(),
      title: 'Sua resposta foi escolhida!',
      content: `A resposta que você enviou em "${question.title
        .substring(0, 20)
        .concat('...')}" foi escolhida pelo autor!`,
    })
  }
}
