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
import { CortesService } from './cortes.service';
import { CreateCorteDto } from './dto/create-corte.dto';
import { UpdateCorteDto } from './dto/update-corte.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cortes')
@UseGuards(JwtAuthGuard)
export class CortesController {
  constructor(private readonly cortesService: CortesService) {}

  @Post()
  create(@Body() createCorteDto: CreateCorteDto, @Req() req: any) {
    return this.cortesService.create(createCorteDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.cortesService.findAll(req.user.userId);
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number, @Req() req: any) {
    return this.cortesService.findByCliente(clienteId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cortesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCorteDto: UpdateCorteDto,
    @Req() req: any,
  ) {
    return this.cortesService.update(id, updateCorteDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cortesService.remove(id, req.user.userId);
  }
}
