import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { SkipAuth } from '../decorators/skip-auth.decorator';
import { RequestUserType } from './dto/request-user.type';

@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @SkipAuth()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() { user }: { user: RequestUserType }) {
    return this._authService.login(user);
  }
}
