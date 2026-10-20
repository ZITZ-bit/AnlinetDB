import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  usuario: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { usuario: createUserDto.usuario },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        nombre: createUserDto.nombre,
        apellido: createUserDto.apellido,
        usuario: createUserDto.usuario,
        password: hashedPassword,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        usuario: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findOne(usuario: string) {
    return this.prisma.usuario.findUnique({
      where: { usuario },
    });
  }

  async findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        usuario: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
