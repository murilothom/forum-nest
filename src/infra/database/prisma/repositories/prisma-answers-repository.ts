import { Injectable } from '@nestjs/common'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'
import { PaginationParams } from '../../../../core/repositories/pagination-params'
import { Answer } from '../../../../domain/forum/enterprise/entities/answer'
import { PrismaService } from '../prisma.service'
import { PrismaAnswerMapper } from '../mappers/prisma-answer-mapper'

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor(private prismaService: PrismaService) {}

  async create(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer)

    await this.prismaService.answer.create({
      data,
    })
  }

  async save(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer)

    await this.prismaService.answer.update({
      where: {
        id: data.id,
      },
      data,
    })
  }

  async delete(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer)

    await this.prismaService.answer.delete({
      where: {
        id: data.id,
      },
    })
  }

  async findById(id: string): Promise<Answer | null> {
    const answer = await this.prismaService.answer.findUnique({
      where: {
        id,
      },
    })

    if (!answer) {
      return null
    }

    return PrismaAnswerMapper.toDomain(answer)
  }

  async findManyByQuestionId(
    questionId: string,
    params: PaginationParams,
  ): Promise<Answer[]> {
    const answers = await this.prismaService.answer.findMany({
      where: {
        questionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: (params.page - 1) * 20,
    })

    return answers.map(PrismaAnswerMapper.toDomain)
  }
}
