import { IsAlphanumeric, IsOptional, IsString } from 'class-validator';

export class FindUserDto {
  @IsAlphanumeric()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  nickName?: string;
}
