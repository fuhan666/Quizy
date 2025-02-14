import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { SkipAuth } from '../common/decorators/skip-auth.decorator';
import { RequestUserType } from './dto/request-user.type';
import { User } from 'src/common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @SkipAuth()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@User() user: RequestUserType) {
    return this._authService.login(user);
  }
}
