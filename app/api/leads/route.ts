import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { sendLeadNotificationEmail } from '@/backend/services/email.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, mensaje, propiedadId, propiedadCodigo, propiedadTitulo } = body;

    // 1. Validaciones básicas
    if (!nombre || !email || !telefono) {
      return NextResponse.json(
        { error: 'Los campos Nombre, Email y Teléfono son obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Guardar el Lead en la Base de Datos
    const newLead = await prisma.lead.create({
      data: {
        nombre,
        email,
        telefono,
        mensaje: mensaje || '',
        propiedadId: propiedadId ? Number(propiedadId) : null,
        origen: propiedadId ? 'ficha_propiedad' : 'contacto_general',
      },
    });

    // 3. Buscar si la propiedad tiene un Agente asignado para enviarle el mail a él
    let agenteEmail = process.env.ADMIN_EMAIL;
    if (propiedadId) {
      const prop = await prisma.propiedad.findUnique({
        where: { id: Number(propiedadId) },
        select: { agente: { select: { email: true } } },
      });
      if (prop?.agente?.email) {
        agenteEmail = prop.agente.email;
      }
    }

    // 4. Disparar correo de notificación (No frena la respuesta si falla el correo)
    sendLeadNotificationEmail({
      leadNombre: nombre,
      leadEmail: email,
      leadTelefono: telefono,
      mensaje: mensaje || '',
      propiedadCodigo,
      propiedadTitulo,
      agenteEmail,
    }).catch(err => console.error('Error background email:', err));

    return NextResponse.json(
      { success: true, message: 'Consulta enviada con éxito.', leadId: newLead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al procesar Lead:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error interno al guardar la consulta.' },
      { status: 500 }
    );
  }
}