import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { translatePrismaError } from '../prisma/prisma-errors';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanesService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto, usuarioId: number) {
    try {
      return await this.prisma.plan.create({
        data: {
          ...createPlanDto,
          nombre: createPlanDto.nombre.trim(),
          usuarioId,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'Plan');
    }
  }

  async findAll(usuarioId: number) {
    return this.prisma.plan.findMany({
      where: { usuarioId, activo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(usuarioId: number) {
    return this.prisma.plan.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, usuarioId: number) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, usuarioId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan con id ${id} no encontrado`);
    }

    return plan;
  }

  async update(id: number, updatePlanDto: UpdatePlanDto, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  async remove(id: number, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.plan.update({
      where: { id },
      data: { activo: false },
    });
  }

  async removeHard(id: number, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.plan.delete({
      where: { id },
    });
  }

  async limpiar(usuarioId: number) {
    return this.prisma.$transaction(async (tx) => {
      const clientes = await tx.cliente.findMany({
        where: { propietarioId: usuarioId },
        select: { id: true },
      });

      const clienteIds = clientes.map((cliente) => cliente.id);

      const cortes = await tx.corte.deleteMany({
        where: { clienteId: { in: clienteIds } },
      });

      const clientesEliminados = await tx.cliente.deleteMany({
        where: { id: { in: clienteIds } },
      });

      const planes = await tx.plan.deleteMany({
        where: { usuarioId },
      });

      return {
        planes: planes.count,
        clientes: clientesEliminados.count,
        cortes: cortes.count,
      };
    });
  }
}
