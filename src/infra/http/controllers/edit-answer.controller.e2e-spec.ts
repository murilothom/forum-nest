import { INestApplication } from '@nestjs/common'
import { AppModule } from '../../app.module'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '../../database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { DatabaseModule } from '../../database/database.module'
import { StudentFactory } from '../../../../test/factories/make-student'
import { QuestionFactory } from '../../../../test/factories/make-question'
import { AnswerFactory } from '../../../../test/factories/make-answer'
import { AnswerAttachmentFactory } from '../../../../test/factories/make-answer-attachment'
import { AttachmentFactory } from '../../../../test/factories/make-attachment'

describe('Edit Answer (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let attachmentFactory: AttachmentFactory
  let answerAttachmentFactory: AnswerAttachmentFactory
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AttachmentFactory,
        AnswerAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory)
    prismaService = moduleRef.get(PrismaService)
    jwtService = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /answers/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwtService.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const firstAttachment = await attachmentFactory.makePrismaAttachment()
    const secondAttachment = await attachmentFactory.makePrismaAttachment()

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    })

    await answerAttachmentFactory.makePrismaAttachment({
      attachmentId: secondAttachment.id,
      answerId: answer.id,
    })

    const thirdAttachment = await attachmentFactory.makePrismaAttachment()

    const answerId = answer.id.toString()

    const response = await request(app.getHttpServer())
      .put(`/answers/${answerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'New answer',
        attachments: [
          firstAttachment.id.toString(),
          thirdAttachment.id.toString(),
        ],
      })

    expect(response.statusCode).toBe(204)

    const answerOnDatabase = await prismaService.answer.findFirst({
      where: {
        content: 'New answer',
      },
    })

    const attachmentsOnDatabase = await prismaService.attachment.findMany({
      where: {
        answerId,
      },
    })

    expect(answerOnDatabase).toBeTruthy()
    expect(attachmentsOnDatabase).toHaveLength(2)
    expect(attachmentsOnDatabase).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: firstAttachment.id.toString() }),
        expect.objectContaining({ id: thirdAttachment.id.toString() }),
      ]),
    )
  })
})
