import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/ZodValidationPipe'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createAccountBodySchema))
    body: CreateAccountBodySchema,
  ) {
    const { name, email, password } = body

    const userWithSameEmail = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })

    if (userWithSameEmail) {
      throw new BadRequestException('User with same e-mail already exists.')
    }

    const hashedPassword = await hash(password, 8)

    await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
  }
}
