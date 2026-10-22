import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { translatePrismaError } from '../prisma/prisma-errors';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto, usuarioId: number) {
    try {
      return await this.prisma.cliente.create({
        data: {
          ...createClienteDto,
          usuario: createClienteDto.usuario.trim(),
          direccion: createClienteDto.direccion.trim(),
          propietarioId: usuarioId,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'Cliente');
    }
  }

  async findAll(usuarioId: number) {
    return this.prisma.cliente.findMany({
      where: { propietarioId: usuarioId },
      include: {
        zona: true,
        plan: true,
        caja: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, usuarioId: number) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, propietarioId: usuarioId },
      include: {
        zona: true,
        plan: true,
        caja: true,
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }

    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  async remove(id: number, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.$transaction(async (tx) => {
      await tx.corte.deleteMany({ where: { clienteId: id } });
      return tx.cliente.delete({ where: { id } });
    });
  }

  async limpiar(usuarioId: number) {
    return this.prisma.$transaction(async (tx) => {
      const cortes = await tx.corte.deleteMany({
        where: { usuarioId },
      });

      const clientes = await tx.cliente.deleteMany({
        where: { propietarioId: usuarioId },
      });

      return { clientes: clientes.count, cortes: cortes.count };
    });
  }
}
