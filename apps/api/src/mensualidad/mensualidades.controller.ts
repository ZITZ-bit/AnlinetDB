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
import { MensualidadesService } from './mensualidades.service';
import { CreateMensualidadDto } from './dto/create-mensualidad.dto';
import { UpdateMensualidadDto } from './dto/update-mensualidad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mensualidades')
@UseGuards(JwtAuthGuard)
export class MensualidadesController {
  constructor(private readonly mensualidadesService: MensualidadesService) {}

  @Post()
  create(@Body() createMensualidadDto: CreateMensualidadDto, @Req() req: any) {
    return this.mensualidadesService.create(createMensualidadDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.mensualidadesService.findAll(req.user.userId);
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number, @Req() req: any) {
    return this.mensualidadesService.findByCliente(clienteId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.mensualidadesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMensualidadDto: UpdateMensualidadDto,
    @Req() req: any,
  ) {
    return this.mensualidadesService.update(id, updateMensualidadDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.mensualidadesService.remove(id, req.user.userId);
  }
}
