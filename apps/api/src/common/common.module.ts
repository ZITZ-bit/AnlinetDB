import { Global, Module } from '@nestjs/common';
import { TiempoService } from './tiempo.service';
import { TiempoController } from './tiempo.controller';

@Global()
@Module({
  controllers: [TiempoController],
  providers: [TiempoService],
  exports: [TiempoService],
})
export class CommonModule {}
