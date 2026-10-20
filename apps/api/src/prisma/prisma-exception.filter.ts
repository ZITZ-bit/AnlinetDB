import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import type { Response } from 'express';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(
        `Prisma ${exception.code} en ${ctx.getRequest().url}: ${exception.message}`,
      );

      const status =
        exception.code === 'P2002'
          ? HttpStatus.CONFLICT
          : exception.code === 'P2025'
            ? HttpStatus.NOT_FOUND
            : HttpStatus.BAD_REQUEST;

      const message =
        exception.code === 'P2002'
          ? 'Ya existe un registro con esos datos'
          : exception.code === 'P2025'
            ? 'El registro solicitado no existe'
            : 'La operación no se pudo completar con los datos enviados';

      return response.status(status).json({ statusCode: status, message });
    }

    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    this.logger.error(
      `Error no controlado en ${ctx.getRequest().url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor. Revisa los logs de la API.',
    });
  }
}
