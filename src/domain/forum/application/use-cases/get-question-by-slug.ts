import { Either, left, right } from '@/core/either'
import { QuestionsRepository } from '../repositories/question-repository'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'

interface GetQuestionBySlugUseCaseRequest {
  slug: string
}

type GetQuestionBySlugUseCaseResponse = Either<
  ResourceNotFoundError,
  { question: Question }
>

@Injectable()
export class GetQuestionBySlugUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    slug,
  }: GetQuestionBySlugUseCaseRequest): Promise<GetQuestionBySlugUseCaseResponse> {
    const question = await this.questionsRepository.findBySlug(slug)

    if (!question) {
      return left(new ResourceNotFoundError())
    }

    return right({
      question,
    })
  }
}
