import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateZonaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}