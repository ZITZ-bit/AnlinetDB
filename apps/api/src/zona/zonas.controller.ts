import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ZonasService } from './zonas.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('zonas')
@UseGuards(JwtAuthGuard)
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Post()
  create(@Body() createZonaDto: CreateZonaDto, @Req() req: any) {
    return this.zonasService.create(createZonaDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.zonasService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.zonasService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateZonaDto: UpdateZonaDto,
    @Req() req: any,
  ) {
    return this.zonasService.update(id, updateZonaDto, req.user.userId);
  }

  @Delete('limpieza')
  limpiar(@Req() req: any) {
    return this.zonasService.limpiar(req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.zonasService.remove(id, req.user.userId);
  }
}
