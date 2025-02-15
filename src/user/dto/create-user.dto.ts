import { IsAlphanumeric, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsAlphanumeric()
  @MinLength(3)
  userName: string;

  @IsString()
  @MinLength(6)
  password: string;
}
