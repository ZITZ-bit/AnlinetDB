import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CortesService } from './cortes.service';
import { CortesController } from './cortes.controller';

@Module({
  imports: [PrismaModule],
  providers: [CortesService],
  controllers: [CortesController],
  exports: [CortesService],
})
export class CorteModule {}
