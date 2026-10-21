import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

const FRIENDLY_FIELDS: Record<string, string> = {
  nombre: 'nombre',
  usuarioId: 'nombre',
  propietarioId: 'nombre',
  codigoCaja: 'código de caja',
  cedula: 'cédula',
  usuario: 'usuario',
};

function extractFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  const meta = error.meta as {
    driverAdapterError?: {
      cause?: { constraint?: { fields?: string[] } };
    };
  };

  const fields = meta?.driverAdapterError?.cause?.constraint?.fields;
  return Array.isArray(fields) ? fields : [];
}

function describeFields(fields: string[], entity: string): string {
  const relevant = fields.filter(
    (field) => field !== 'usuarioId' && field !== 'propietarioId',
  );

  if (relevant.length === 0) return '';

  const labels = relevant.map((field) => FRIENDLY_FIELDS[field] ?? field);
  const name = entity.toLowerCase();

  if (labels.length === 1) return `Ya existe ${name} con ese ${labels[0]}`;
  return `Ya existe ${name} con esos ${labels.join(' y ')}`;
}

export function translatePrismaError(error: unknown, entity: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const message = describeFields(extractFields(error), entity);
        throw new ConflictException(
          message || `Ya existe ${entity.toLowerCase()} con esos datos`,
        );
      }
      case 'P2003':
        throw new BadRequestException(
          'La referencia indicada no existe (zona, caja o plan inválido)',
        );
      case 'P2025':
        throw new NotFoundException(`${entity} no encontrado`);
      default:
        throw error;
    }
  }

  throw error;
}
