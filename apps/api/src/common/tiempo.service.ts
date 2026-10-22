import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class TiempoService {
  private offsetMs = 0;

  ahora(): Date {
    return new Date(Date.now() + this.offsetMs);
  }

  ahoraMs(): number {
    return Date.now() + this.offsetMs;
  }

  adelantar(dias: number): { fecha: string; offsetMs: number } {
    this.offsetMs += dias * 24 * 60 * 60 * 1000;
    return { fecha: this.ahora().toISOString(), offsetMs: this.offsetMs };
  }

  establecer(fechaISO: string): { fecha: string; offsetMs: number } {
    const objetivo = new Date(fechaISO).getTime();
    if (Number.isNaN(objetivo)) {
      throw new BadRequestException('Fecha inválida');
    }
    this.offsetMs = objetivo - Date.now();
    return { fecha: this.ahora().toISOString(), offsetMs: this.offsetMs };
  }

  reiniciar(): { fecha: string; offsetMs: number } {
    this.offsetMs = 0;
    return { fecha: this.ahora().toISOString(), offsetMs: this.offsetMs };
  }

  estado(): { fecha: string; offsetMs: number } {
    return { fecha: this.ahora().toISOString(), offsetMs: this.offsetMs };
  }
}
