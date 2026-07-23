import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { sendLeadNotificationEmail } from '@/backend/services/email.service';
import { getContactLinks } from '@/backend/services/config.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, apellido, email, telefono, mensaje, propiedadId, propiedadCodigo, propiedadTitulo } = body;

    // 1. Validaciones básicas
    if (!nombre || !apellido || !email || !telefono) {
      return NextResponse.json(
        { error: 'Los campos Nombre, Apellido, Email y Teléfono son obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Guardar el Lead en la Base de Datos
    const newLead = await prisma.lead.create({
      data: {
        nombre,
        apellido,
        email,
        telefono,
        mensaje: mensaje || '',
        propiedadId: propiedadId ? Number(propiedadId) : null,
        origen: propiedadId ? 'ficha_propiedad' : 'contacto_general',
      },
    });

    // 3. Buscar si la propiedad tiene un Agente asignado para enviarle el mail a él
    let toEmail;
    if (propiedadId) {
      const prop = await prisma.propiedad.findUnique({
        where: { id: Number(propiedadId) },
        select: { agente: { select: { email: true } } },
      });
      if (prop?.agente?.email) {
        toEmail = prop.agente.email;
      }
    }else{
      const links = await getContactLinks();
      toEmail = links.email;
    }

    // 4. Disparar correo de notificación (No frena la respuesta si falla el correo)
    sendLeadNotificationEmail({
      leadNombre: nombre,
      leadApellido: apellido,
      leadEmail: email,
      leadTelefono: telefono,
      mensaje: mensaje || '',
      propiedadCodigo,
      propiedadTitulo,
      toEmail,
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