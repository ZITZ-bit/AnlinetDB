import { PartialType } from '@nestjs/mapped-types';
import { CreateCorteDto } from './create-corte.dto';

export class UpdateCorteDto extends PartialType(CreateCorteDto) {}
