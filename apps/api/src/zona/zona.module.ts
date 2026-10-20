import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ZonasService } from './zonas.service';
import { ZonasController } from './zonas.controller';

@Module({
  imports: [PrismaModule],
  providers: [ZonasService],
  controllers: [ZonasController],
  exports: [ZonasService],
})
export class ZonasModule {}