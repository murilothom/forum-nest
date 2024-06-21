import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { hash } from 'bcryptjs'
import { AppModule } from '../../app.module'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prismaService: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prismaService = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    await prismaService.user.create({
      data: {
        email: 'johndoe@email.com',
        name: 'John Doe',
        password: await hash('123456', 8),
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'johndoe@email.com',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })
})
