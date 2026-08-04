import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/backend/db';
import { createSession } from '@/lib/utils-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Buscamos usuario en la base de datos
    const agente = await prisma.agente.findUnique({
      where: { email },
    });

    if (!agente) {
      return NextResponse.json(
        { message: 'Agente inexistente' },
        { status: 401 }
      );
    }

    // Verificamos el hash de la contraseña
    const isValidPassword = await bcrypt.compare(password, agente.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Generamos la sesión HTTP-Only
    await createSession({
      userId: agente.id,
      nombre: agente.nombre,
      email: agente.email,
      role: agente.rol,
    });

    return NextResponse.json({ success: true, redirectTo: '/admin' });
  } catch (error) {
    console.error('Error en Login API:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}