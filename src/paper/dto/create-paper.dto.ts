import { PaperQuestionDto } from 'src/paper/dto/paper-question.dto';
import { PaperPermissionsDto } from './paper-permission.dto';
import {
  IsArray,
  IsObject,
  ValidateNested,
  IsOptional,
  ArrayNotEmpty,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaperDto {
  @IsString()
  @IsNotEmpty()
  paperName: string;

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
