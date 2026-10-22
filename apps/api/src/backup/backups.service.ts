import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupsService {
  constructor(private prisma: PrismaService) {}

  async exportar(usuarioId: number) {
    const [zonas, planes, cajas, clientes] = await Promise.all([
      this.prisma.zona.findMany({ where: { usuarioId } }),
      this.prisma.plan.findMany({ where: { usuarioId } }),
      this.prisma.caja.findMany({ where: { usuarioId } }),
      this.prisma.cliente.findMany({ where: { propietarioId: usuarioId } }),
    ]);
    return { version: 1, fecha: new Date().toISOString(), zonas, planes, cajas, clientes };
  }

  async importar(usuarioId: number, data: any) {
    return this.prisma.$transaction(async (tx) => {
      await tx.cliente.deleteMany({ where: { propietarioId: usuarioId } });
      await tx.caja.deleteMany({ where: { usuarioId } });
      await tx.plan.deleteMany({ where: { usuarioId } });
      await tx.zona.deleteMany({ where: { usuarioId } });

      if (Array.isArray(data.zonas)) {
        for (const z of data.zonas) {
          await tx.zona.create({ data: { id: z.id, nombre: z.nombre, usuarioId, descripcion: z.descripcion, createdAt: z.createdAt ? new Date(z.createdAt) : undefined, updatedAt: z.updatedAt ? new Date(z.updatedAt) : undefined } });
        }
      }
      if (Array.isArray(data.planes)) {
        for (const p of data.planes) {
          await tx.plan.create({ data: { id: p.id, nombre: p.nombre, usuarioId, velocidad: p.velocidad, precio: p.precio, descripcion: p.descripcion, activo: p.activo ?? true, createdAt: p.createdAt ? new Date(p.createdAt) : undefined, updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined } });
        }
      }
      if (Array.isArray(data.cajas)) {
        for (const c of data.cajas) {
          await tx.caja.create({ data: { id: c.id, codigoCaja: c.codigoCaja, direccion: c.direccion, zonaId: c.zonaId, usuarioId, tipo: c.tipo ?? 'principal', capacidad: c.capacidad ?? 0, puertosLibres: c.puertosLibres ?? 0, estado: c.estado ?? 'disponible', observaciones: c.observaciones, createdAt: c.createdAt ? new Date(c.createdAt) : undefined, updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined } });
        }
      }
      if (Array.isArray(data.clientes)) {
        for (const cl of data.clientes) {
          await tx.cliente.create({ data: { id: cl.id, usuario: cl.usuario, propietarioId: usuarioId, cedula: cl.cedula, telefono: cl.telefono, direccion: cl.direccion, referencia: cl.referencia, zonaId: cl.zonaId, planId: cl.planId, cajaId: cl.cajaId, createdAt: cl.createdAt ? new Date(cl.createdAt) : undefined, updatedAt: cl.updatedAt ? new Date(cl.updatedAt) : undefined } });
        }
      }
      return { ok: true };
    });
  }
}
