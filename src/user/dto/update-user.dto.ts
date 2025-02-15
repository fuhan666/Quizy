import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string;
}
