import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CortesService } from './cortes.service';
import { CortesController } from './cortes.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  providers: [CortesService],
  controllers: [CortesController],
  exports: [CortesService],
})
export class CorteModule {}
