import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { translatePrismaError } from '../prisma/prisma-errors';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';

@Injectable()
export class ZonasService {
  constructor(private prisma: PrismaService) {}

  async create(createZonaDto: CreateZonaDto, usuarioId: number) {
    const data = {
      nombre: createZonaDto.nombre.trim(),
      descripcion: createZonaDto.descripcion?.trim() || undefined,
      usuarioId,
    };

    try {
      return await this.prisma.zona.create({ data });
    } catch (error) {
      translatePrismaError(error, 'Zona');
    }
  }

  async findAll(usuarioId: number) {
    return this.prisma.zona.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, usuarioId: number) {
    const zona = await this.prisma.zona.findFirst({
      where: { id, usuarioId },
    });

    if (!zona) {
      throw new NotFoundException(`Zona con id ${id} no encontrada`);
    }

    return zona;
  }

  async update(id: number, updateZonaDto: UpdateZonaDto, usuarioId: number) {
    await this.findOne(id, usuarioId);

    const data: { nombre?: string; descripcion?: string } = {};

    if (updateZonaDto.nombre !== undefined) {
      data.nombre = updateZonaDto.nombre.trim();
    }

    if (updateZonaDto.descripcion !== undefined) {
      data.descripcion = updateZonaDto.descripcion.trim() || undefined;
    }

    try {
      return await this.prisma.zona.update({
        where: { id },
        data,
      });
    } catch (error) {
      translatePrismaError(error, 'Zona');
    }
  }

  async remove(id: number, usuarioId: number) {
    await this.findOne(id, usuarioId);

    return this.prisma.zona.delete({
      where: { id },
    });
  }
}
