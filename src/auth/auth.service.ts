import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private _userService: UserService,
    private _jwtService: JwtService,
  ) {}

  async validateUser(userName: string, password: string): Promise<any> {
    const user = await this._userService.findOneByUserName(userName);
    if (
      !user ||
      !(await this._userService.comparePassword(password, user.password))
    ) {
      return null;
    }
    const { password: hashedPassword, ...result } = user;
    return result;
  }

  login(user: any) {
    const payload = { username: user.userName, sub: user.id };
    return {
      access_token: this._jwtService.sign(payload),
    };
  }
}
