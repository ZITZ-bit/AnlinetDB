import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CajasService } from './cajas.service';
import { CajasController } from './cajas.controller';

@Module({
  imports: [PrismaModule],
  providers: [CajasService],
  controllers: [CajasController],
  exports: [CajasService],
})
export class CajaModule {}
