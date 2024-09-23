import { INestApplication } from '@nestjs/common'
import { AppModule } from '../../app.module'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '../../database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { DatabaseModule } from '../../database/database.module'
import { StudentFactory } from '../../../../test/factories/make-student'
import { QuestionFactory } from '../../../../test/factories/make-question'
import { AttachmentFactory } from '../../../../test/factories/make-attachment'

describe('Answer Question (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
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
    attachmentFactory = moduleRef.get(AttachmentFactory)
    prismaService = moduleRef.get(PrismaService)
    jwtService = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /questions/:questionId/answers', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwtService.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const firsAttachment = await attachmentFactory.makePrismaAttachment()
    const secondAttachment = await attachmentFactory.makePrismaAttachment()

    const questionId = question.id.toString()

    const response = await request(app.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'New answer',
        attachments: [
          firsAttachment.id.toString(),
          secondAttachment.id.toString(),
        ],
      })

    expect(response.statusCode).toBe(201)

    const answerOnDatabase = await prismaService.answer.findFirst({
      where: {
        content: 'New answer',
      },
    })

    const attachmentsOnDatabase = await prismaService.attachment.findMany({
      where: {
        answerId: answerOnDatabase?.id,
      },
    })

    expect(answerOnDatabase).toBeTruthy()
    expect(attachmentsOnDatabase).toHaveLength(2)
  })
})
