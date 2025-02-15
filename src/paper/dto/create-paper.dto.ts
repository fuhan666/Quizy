import { QA } from 'src/paper/dto/qa.dto';
import { PaperPermissionsType } from './paper-permission.type';

export class CreatePaperDto {
  qas: QA[];
  permissions?: PaperPermissionsType;
}
