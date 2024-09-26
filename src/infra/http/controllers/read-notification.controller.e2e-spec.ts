import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { AppModule } from '../../app.module'
import { StudentFactory } from 'test/factories/make-student'
import { DatabaseModule } from '../../database/database.module'
import { NotificationFactory } from 'test/factories/make-notification'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('Read Notification (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let notificationFactory: NotificationFactory
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, NotificationFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    notificationFactory = moduleRef.get(NotificationFactory)
    prismaService = moduleRef.get(PrismaService)
    jwtService = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions/:slug', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    })

    const accessToken = jwtService.sign({ sub: user.id.toString() })

    const notification = await notificationFactory.makePrismaNotification({
      recipientId: user.id,
    })

    const response = await request(app.getHttpServer())
      .patch(`/notifications/${notification.id.toString()}/read`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const notificationOnDatabase = await prismaService.notification.findFirst({
      where: { id: notification.id.toString() },
    })

    expect(notificationOnDatabase?.readAt).toBeTruthy()
  })
})
