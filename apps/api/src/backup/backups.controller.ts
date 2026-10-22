import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { BackupsService } from './backups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('backups')
@UseGuards(JwtAuthGuard)
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get('exportar')
  exportar(@Req() req: any) {
    return this.backupsService.exportar(req.user.userId);
  }

  @Post('importar')
  importar(@Body() body: any, @Req() req: any) {
    return this.backupsService.importar(req.user.userId, body);
  }
}
