import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PlanesModule } from './planes/planes.module';
import { ZonasModule } from './zona/zona.module';
import { CorteModule } from './corte/corte.module';
import { ClientesModule } from './cliente/cliente.module';
import { CajaModule } from './caja/caja.module';
import { CommonModule } from './common/common.module';
import { BackupsModule } from './backup/backup.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, PlanesModule, ZonasModule, CorteModule, ClientesModule, CajaModule, CommonModule, BackupsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
