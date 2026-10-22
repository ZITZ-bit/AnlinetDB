import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCorteDto {
  @IsNumber()
  clienteId: number;

  @IsNumber()
  @Min(0)
  monto: number;

  @IsString()
  @MaxLength(50)
  periodo: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaVencimiento?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaPago?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado?: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}
