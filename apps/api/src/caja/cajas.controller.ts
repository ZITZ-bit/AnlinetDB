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
import { CajasService } from './cajas.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cajas')
@UseGuards(JwtAuthGuard)
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Post()
  create(@Body() createCajaDto: CreateCajaDto, @Req() req: any) {
    return this.cajasService.create(createCajaDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.cajasService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cajasService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCajaDto: UpdateCajaDto,
    @Req() req: any,
  ) {
    return this.cajasService.update(id, updateCajaDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cajasService.remove(id, req.user.userId);
  }
}
