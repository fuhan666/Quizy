import { PaperQuestionDto } from 'src/paper/dto/qa.dto';
import { PaperPermissionsDto } from './paper-permission.dto';
import {
  IsArray,
  IsObject,
  ValidateNested,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaperDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PaperQuestionDto)
  paperQuestions: PaperQuestionDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PaperPermissionsDto)
  permissions?: PaperPermissionsDto;
}
