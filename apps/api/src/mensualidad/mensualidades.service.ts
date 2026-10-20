import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { translatePrismaError } from '../prisma/prisma-errors';
import { CreateMensualidadDto } from './dto/create-mensualidad.dto';
import { UpdateMensualidadDto } from './dto/update-mensualidad.dto';

@Injectable()
export class MensualidadesService {
  constructor(private prisma: PrismaService) {}

  async create(createMensualidadDto: CreateMensualidadDto, usuarioId: number) {
    try {
      return await this.prisma.mensualidad.create({
        data: { ...createMensualidadDto, usuarioId },
      });
    } catch (error) {
      translatePrismaError(error, 'Mensualidad');
    }
  }

  async findAll(usuarioId: number) {
    return this.prisma.mensualidad.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCliente(clienteId: number, usuarioId: number) {
    return this.prisma.mensualidad.findMany({
      where: { clienteId, usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, usuarioId: number) {
    const mensualidad = await this.prisma.mensualidad.findFirst({
      where: { id, usuarioId },
    });

    if (!mensualidad) {
      throw new NotFoundException(`Mensualidad con id ${id} no encontrada`);
    }

    return mensualidad;
  }

  async update(id: number, updateMensualidadDto: UpdateMensualidadDto, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.mensualidad.update({
      where: { id },
      data: updateMensualidadDto,
    });
  }

  async remove(id: number, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.mensualidad.delete({
      where: { id },
    });
  }
}
