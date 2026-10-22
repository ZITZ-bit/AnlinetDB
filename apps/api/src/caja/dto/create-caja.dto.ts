import {
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateCajaDto {
  @IsString()
  @MaxLength(50)
  codigoCaja: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @IsNumber()
  zonaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo?: string;

  @IsOptional()
  @IsNumber()
  capacidad?: number;

  @IsOptional()
  @IsNumber()
  puertosLibres?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}