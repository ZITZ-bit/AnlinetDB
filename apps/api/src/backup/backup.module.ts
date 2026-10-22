import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BackupsService } from './backups.service';
import { BackupsController } from './backups.controller';

@Module({
  imports: [PrismaModule],
  providers: [BackupsService],
  controllers: [BackupsController],
})
export class BackupsModule {}
