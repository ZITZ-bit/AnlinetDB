import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { translatePrismaError } from '../prisma/prisma-errors';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';

@Injectable()
export class CajasService {
  constructor(private prisma: PrismaService) {}

  async create(createCajaDto: CreateCajaDto, usuarioId: number) {
    try {
      return await this.prisma.caja.create({
        data: {
          ...createCajaDto,
          codigoCaja: createCajaDto.codigoCaja.trim(),
          usuarioId,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'Caja');
    }
  }

  async findAll(usuarioId: number) {
    return this.prisma.caja.findMany({
      where: { usuarioId },
      include: { zona: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, usuarioId: number) {
    const caja = await this.prisma.caja.findFirst({
      where: { id, usuarioId },
      include: { zona: true },
    });

    if (!caja) {
      throw new NotFoundException(`Caja con id ${id} no encontrada`);
    }

    return caja;
  }

  async update(id: number, updateCajaDto: UpdateCajaDto, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.caja.update({
      where: { id },
      data: updateCajaDto,
    });
  }

  async remove(id: number, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.caja.delete({
      where: { id },
    });
  }

  async limpiar(usuarioId: number) {
    return this.prisma.$transaction(async (tx) => {
      const desasociados = await tx.cliente.updateMany({
        where: { propietarioId: usuarioId, cajaId: { not: null } },
        data: { cajaId: null },
      });

      const cajas = await tx.caja.deleteMany({
        where: { usuarioId },
      });

      return { cajas: cajas.count, clientesDesasociados: desasociados.count };
    });
  }
}
