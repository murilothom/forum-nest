import { INestApplication } from '@nestjs/common'
import { AppModule } from '../app.module'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'

describe('Fetch Recent Questions (E2E)', () => {
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

  test('[GET] /questions', async () => {
    const user = await prismaService.user.create({
      data: {
        email: 'johndoe@email.com',
        name: 'John Doe',
        password: '123456',
      },
    })

    await prismaService.question.createMany({
      data: [
        {
          title: 'Question 01',
          slug: 'question-01',
          content: 'Question 01 content',
          authorId: user.id,
        },
        {
          title: 'Question 02',
          slug: 'question-02',
          content: 'Question 02 content',
          authorId: user.id,
        },
      ],
    })

    const accessToken = jwtService.sign({ sub: user.id })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)

    expect(response.body.questions).toHaveLength(2)
    expect(response.body.questions).toEqual([
      { title: 'Question 02' },
      { title: 'Question 01' },
    ])
  })
})
