import { PartialType } from '@nestjs/mapped-types';
import { CreateMensualidadDto } from './create-mensualidad.dto';

export class UpdateMensualidadDto extends PartialType(CreateMensualidadDto) {}