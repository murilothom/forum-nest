import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '../../database/prisma/prisma.service'
import { AppModule } from '../../app.module'

describe('Create Account (E2E)', () => {
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

  test('[POST] /accounts', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)

    const userOnDatabase = await prismaService.user.findUnique({
      where: {
        email: 'johndoe@email.com',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })
})
