import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(100)
  apellido: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cedula?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsString()
  @MaxLength(200)
  direccion: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  referencia?: string;

  @IsNumber()
  zonaId: number;

  @IsOptional()
  @IsNumber()
  cajaId?: number;

  @IsNumber()
  planId: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado?: string;

  @IsOptional()
  @IsString()
  ipAsignada?: string;
}