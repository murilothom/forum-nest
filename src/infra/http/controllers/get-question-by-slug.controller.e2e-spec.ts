import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../database/prisma/prisma.service'
import { AppModule } from '../../app.module'

describe('Get question by slug (E2E)', () => {
  let app: INestApplication
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prismaService = moduleRef.get(PrismaService)
    jwtService = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions/:slug', async () => {
    const user = await prismaService.user.create({
      data: {
        email: 'johndoe@email.com',
        name: 'John Doe',
        password: '123456',
      },
    })

    const accessToken = jwtService.sign({ sub: user.id })

    await prismaService.question.create({
      data: {
        title: 'Question 01',
        slug: 'question-01',
        content: 'Question 01 content',
        authorId: user.id,
      },
    })

    const response = await request(app.getHttpServer())
      .get('/questions/question-01')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      question: expect.objectContaining({ title: 'Question 01' }),
    })
  })
})
