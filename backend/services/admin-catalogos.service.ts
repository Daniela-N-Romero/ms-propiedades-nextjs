import { prisma } from '@/backend/db';

export async function getAgentes() {
  return prisma.agente.findMany({ orderBy: { nombre: 'asc' } });
}

export async function getPropietarios() {
  return prisma.propietario.findMany({ orderBy: { nombre: 'asc' } });
}

export async function getColegas() {
  return prisma.colega.findMany({ orderBy: { inmobiliaria: 'asc' } });
}