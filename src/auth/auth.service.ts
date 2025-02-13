import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RequestUserType } from './dto/request-user.type';

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

  login({ userName, id }: RequestUserType) {
    const payload = { username: userName, sub: id };
    return {
      access_token: this._jwtService.sign(payload),
    };
  }
}
