import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Answer, AnswerProps } from '@/domain/forum/enterprise/entities/answer'
import { PrismaService } from '../../src/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { PrismaAnswerMapper } from '../../src/infra/database/prisma/mappers/prisma-answer-mapper'

export function makeAnswer(
  override: Partial<AnswerProps> = {},
  id?: UniqueEntityID,
): Answer {
  const answer = Answer.create(
    {
      authorId: new UniqueEntityID(),
      questionId: new UniqueEntityID(),
      content: faker.lorem.text(),
      ...override,
    },
    id,
  )

  return answer
}

@Injectable()
export class AnswerFactory {
  constructor(private prismaService: PrismaService) {}

  async makePrismaAnswer(data: Partial<AnswerProps> = {}): Promise<Answer> {
    const answer = makeAnswer(data)

    await this.prismaService.answer.create({
      data: PrismaAnswerMapper.toPrisma(answer),
    })

    return answer
  }
}
