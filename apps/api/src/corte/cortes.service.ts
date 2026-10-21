import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { translatePrismaError } from '../prisma/prisma-errors';
import { CreateCorteDto } from './dto/create-corte.dto';
import { UpdateCorteDto } from './dto/update-corte.dto';

export const DIAS_GRACIA_CORTE = 5;

@Injectable()
export class CortesService {
  constructor(private prisma: PrismaService) {}

  async create(createCorteDto: CreateCorteDto, usuarioId: number) {
    try {
      return await this.prisma.corte.create({
        data: {
          ...createCorteDto,
          fechaCorte: this.calcularFechaCorte(createCorteDto.fechaVencimiento),
          revisado: createCorteDto.estado ? createCorteDto.estado !== 'pendiente' : false,
          usuarioId,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'Corte');
    }
  }

  private calcularFechaCorte(fechaVencimiento?: Date): Date | null {
    if (!fechaVencimiento) return null;

    const fechaCorte = new Date(fechaVencimiento);
    fechaCorte.setDate(fechaCorte.getDate() + DIAS_GRACIA_CORTE);
    return fechaCorte;
  }

  async findAll(usuarioId: number) {
    await this.marcarNoPagos(usuarioId);

    return this.prisma.corte.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCliente(clienteId: number, usuarioId: number) {
    await this.marcarNoPagos(usuarioId);

    return this.prisma.corte.findMany({
      where: { clienteId, usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async marcarNoPagos(usuarioId: number) {
    const cortes = await this.prisma.corte.findMany({
      where: {
        usuarioId,
        estado: 'pendiente',
        revisado: false,
        fechaPago: null,
        fechaCorte: { not: null },
      },
    });

    const ahora = Date.now();
    const vencidos = cortes.filter(
      (corte) => corte.fechaCorte && new Date(corte.fechaCorte).getTime() <= ahora,
    );

    if (!vencidos.length) return;

    await this.prisma.corte.updateMany({
      where: { id: { in: vencidos.map((corte) => corte.id) } },
      data: { estado: 'no_pago' },
    });
  }

  async findOne(id: number, usuarioId: number) {
    const corte = await this.prisma.corte.findFirst({
      where: { id, usuarioId },
    });

    if (!corte) {
      throw new NotFoundException(`Corte con id ${id} no encontrado`);
    }

    return corte;
  }

  async update(id: number, updateCorteDto: UpdateCorteDto, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.corte.update({
      where: { id },
      data: {
        ...updateCorteDto,
        ...(updateCorteDto.fechaVencimiento
          ? { fechaCorte: this.calcularFechaCorte(updateCorteDto.fechaVencimiento) }
          : {}),
        revisado: true,
      },
    });
  }

  async remove(id: number, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.corte.delete({
      where: { id },
    });
  }
}
