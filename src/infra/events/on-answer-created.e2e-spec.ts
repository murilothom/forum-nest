import { INestApplication } from '@nestjs/common'
import { AppModule } from '../app.module'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '../database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { DatabaseModule } from '../database/database.module'
import { StudentFactory } from 'test/factories/make-student'
import { QuestionFactory } from 'test/factories/make-question'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { waitFor } from 'test/utils/wait-for'
import { DomainEvents } from '@/core/events/domain-events'

describe('On Answer Created (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    prismaService = moduleRef.get(PrismaService)
    jwtService = moduleRef.get(JwtService)

    DomainEvents.shouldRun = true

    await app.init()
  })

  it('should send a notification when answer is created', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwtService.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const questionId = question.id.toString()

    await request(app.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'New answer',
        attachments: [],
      })

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
