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

   // 3. Definir destinatario del correo
    const links = await getContactLinks();
    let toEmail = links?.email || 'mspropiedadesindustrial@gmail.com';

    /* 
      ========================================================================
      LÓGICA DESACTIVADA TEMPORALMENTE (ENVÍO POR AGENTE):
      Descomentar cuando los agentes tengan casillas corporativas operativas.
      ========================================================================

      if (propiedadId) {
        const prop = await prisma.propiedad.findUnique({
          where: { id: Number(propiedadId) },
          select: { agente: { select: { email: true } } },
        });

        if (prop?.agente?.email) {
          // Opción A: Enviar solo al agente
          // toEmail = prop.agente.email;

          // Opción B: Enviar al agente Y al correo general centralizado
          // toEmail = `${prop.agente.email}, ${toEmail}`;
        }
      }
    */

    // Verificar que realmente tengamos un destinatario
    if (!toEmail) {
      console.error('⚠️ No se definió un destinatario de correo válido.');
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
    }).then((result) => {
      console.log('✅ Correo procesado con éxito por el servicio. Respuesta/Resultado:', result);
    })
    .catch(err => console.error('Error background email:', err));

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