import { Controller, Post, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TiempoService } from './tiempo.service';

@Controller('dev/tiempo')
@UseGuards(JwtAuthGuard)
export class TiempoController {
  constructor(private readonly tiempoService: TiempoService) {}

  @Get()
  estado() {
    return this.tiempoService.estado();
  }

  @Post('adelantar')
  adelantar(@Body() body: { dias?: number }) {
    const dias = Number(body?.dias ?? 1);
    return this.tiempoService.adelantar(Number.isNaN(dias) || dias <= 0 ? 1 : dias);
  }

  @Post('establecer')
  establecer(@Body() body: { fecha?: string }) {
    if (!body?.fecha || typeof body.fecha !== 'string') {
      throw new BadRequestException('fecha requerida');
    }
    return this.tiempoService.establecer(body.fecha);
  }

  @Post('reiniciar')
  reiniciar() {
    return this.tiempoService.reiniciar();
  }
}
