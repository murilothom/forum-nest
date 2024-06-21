import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { compare } from 'bcryptjs'
import { PrismaService } from '../../database/prisma/prisma.service'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const user = await this.prismaService.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException('User credential do not match.')
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('User credential do not match.')
    }

    const accessToken = this.jwtService.sign({ sub: user.id })

    return {
      access_token: accessToken,
    }
  }
}
