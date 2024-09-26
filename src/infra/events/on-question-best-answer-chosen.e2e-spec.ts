import { INestApplication } from '@nestjs/common'
import { AppModule } from '../app.module'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '../database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { DatabaseModule } from '../database/database.module'
import { StudentFactory } from 'test/factories/make-student'
import { QuestionFactory } from 'test/factories/make-question'
import { AnswerFactory } from 'test/factories/make-answer'
import { waitFor } from 'test/utils/wait-for'
import { DomainEvents } from '@/core/events/domain-events'

describe('On Question Best Answer Chosen (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    prismaService = moduleRef.get(PrismaService)
    jwtService = moduleRef.get(JwtService)

    DomainEvents.shouldRun = true

    await app.init()
  })

  it('should send a notification when question best answer is chosen', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwtService.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    })

    const answerId = answer.id.toString()

    await request(app.getHttpServer())
      .patch(`/answers/${answerId}/choose-as-best`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    await waitFor(async () => {
      const notificationOnDataBase = await prismaService.notification.findFirst(
        {
          where: {
            recipientId: user.id.toString(),
          },
        },
      )

      expect(notificationOnDataBase).toBeTruthy()
    })
  })
})
