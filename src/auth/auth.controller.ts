import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { SkipAuth } from './skip-auth';

@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @SkipAuth()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req) {
    return this._authService.login(req.user);
  }
}
