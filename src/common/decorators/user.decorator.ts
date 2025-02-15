import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUserType } from 'src/auth/dto/request-user.dto';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as RequestUserType;
  },
);
