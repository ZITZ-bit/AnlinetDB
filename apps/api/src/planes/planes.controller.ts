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
import { PlanesService } from './planes.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('planes')
@UseGuards(JwtAuthGuard)
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto, @Req() req: any) {
    return this.planesService.create(createPlanDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.planesService.findAll(req.user.userId);
  }

  @Get('admin')
  findAllAdmin(@Req() req: any) {
    return this.planesService.findAllAdmin(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.planesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
    @Req() req: any,
  ) {
    return this.planesService.update(id, updatePlanDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.planesService.remove(id, req.user.userId);
  }

  @Delete(':id/hard')
  removeHard(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.planesService.removeHard(id, req.user.userId);
  }
}