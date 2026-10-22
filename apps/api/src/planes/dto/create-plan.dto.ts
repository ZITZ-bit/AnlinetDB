import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  velocidad?: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}