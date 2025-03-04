import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RequestUserType } from './dto/request-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userName: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUserName(userName);
    if (
      !user ||
      !(await this.userService.comparePassword(password, user.password))
    ) {
      return null;
    }
    const { password: hashedPassword, ...result } = user;
    return result;
  }

  login({ userName, id }: RequestUserType) {
    const payload = { username: userName, sub: id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
