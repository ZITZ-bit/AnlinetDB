import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MensualidadesService } from './mensualidades.service';
import { MensualidadesController } from './mensualidades.controller';

@Module({
  imports: [PrismaModule],
  providers: [MensualidadesService],
  controllers: [MensualidadesController],
  exports: [MensualidadesService],
})
export class MensualidadModule {}