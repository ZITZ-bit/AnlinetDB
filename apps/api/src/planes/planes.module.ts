import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';

@Module({
  imports: [PrismaModule],
  providers: [PlanesService],
  controllers: [PlanesController],
  exports: [PlanesService],
})
export class PlanesModule {}