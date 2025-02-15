import { IsBoolean, IsArray, IsOptional, IsPositive } from 'class-validator';

export class PaperPermissionsDto {
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @IsOptional()
  @IsArray()
  @IsPositive({ each: true })
  accessibleByUserIds?: number[];
}
