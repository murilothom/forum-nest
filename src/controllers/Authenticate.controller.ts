import { Controller, Post } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Controller('/sessions')
export class AuthenticateController {
  constructor(private jwtService: JwtService) {}

  @Post()
  // @HttpCode(201)
  // @UsePipes(new ZodValidationPipe(AuthenticateBodySchema))
  async handle() {
    const token = this.jwtService.sign({
      sub: 'user-id',
    })

    return token
  }
}
