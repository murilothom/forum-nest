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
import { QuestionAttachmentFactory } from '../../../../test/factories/make-question-attachment'

describe('Edit Question (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentFactory: QuestionAttachmentFactory
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    prismaService = moduleRef.get(PrismaService)
    jwtService = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /questions/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwtService.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const firstAttachment = await attachmentFactory.makePrismaAttachment()
    const secondAttachment = await attachmentFactory.makePrismaAttachment()

    await questionAttachmentFactory.makePrismaAttachment({
      attachmentId: firstAttachment.id,
      questionId: question.id,
    })

    await questionAttachmentFactory.makePrismaAttachment({
      attachmentId: secondAttachment.id,
      questionId: question.id,
    })

    const thirdAttachment = await attachmentFactory.makePrismaAttachment()

    const questionId = question.id.toString()

    const response = await request(app.getHttpServer())
      .put(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New title',
        content: 'New content',
        attachments: [
          firstAttachment.id.toString(),
          thirdAttachment.id.toString(),
        ],
      })

    expect(response.statusCode).toBe(204)

    const questionOnDatabase = await prismaService.question.findFirst({
      where: {
        title: 'New title',
        content: 'New content',
      },
    })

    const attachmentsOnDatabase = await prismaService.attachment.findMany({
      where: {
        questionId,
      },
    })

    expect(questionOnDatabase).toBeTruthy()
    expect(questionOnDatabase?.authorId).toBe(user.id.toString())
    expect(attachmentsOnDatabase).toHaveLength(2)
    expect(attachmentsOnDatabase).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: firstAttachment.id.toString() }),
        expect.objectContaining({ id: thirdAttachment.id.toString() }),
      ]),
    )
  })
})
