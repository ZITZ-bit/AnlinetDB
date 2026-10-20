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
          nombre: createClienteDto.nombre.trim(),
          apellido: createClienteDto.apellido.trim(),
          direccion: createClienteDto.direccion.trim(),
          usuarioId,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'Cliente');
    }
  }

  async findAll(usuarioId: number) {
    return this.prisma.cliente.findMany({
      where: { usuarioId },
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
      where: { id, usuarioId },
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

    return this.prisma.cliente.delete({
      where: { id },
    });
  }
}
