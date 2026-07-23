// backend/services/email.service.ts
import { Resend } from 'resend';

// Inicializamos Resend con la API Key guardada en .env
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

interface NotificationLeadParams {
    leadNombre: string;
    leadApellido: string;
    leadEmail: string;
    leadTelefono: string;
    mensaje: string;
    propiedadCodigo?: string;
    propiedadTitulo?: string;
    toEmail?: string;
}

export async function sendLeadNotificationEmail(data: NotificationLeadParams) {
    // Email de destino (el del agente o el mail corporativo principal)
    const toEmail = data.toEmail || process.env.ADMIN_EMAIL;

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-bottom: 4px;">📩 Nuevo Lead de Propiedad</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0;">Has recibido una nueva consulta desde el sitio web.</p>
      
      ${data.propiedadCodigo ? `
        <div style="background-color: #f8fafc; padding: 12px 16px; border-left: 4px solid #f97316; margin: 20px 0; border-radius: 4px;">
          <strong style="color: #0f172a; display: block;">Propiedad Consultada:</strong>
          <span style="color: #ea580c; font-weight: bold;">[${data.propiedadCodigo}]</span> ${data.propiedadTitulo}
        </div>
      ` : ''}

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Nombre:</strong></td>
          <td style="padding: 8px 0; color: #0f172a;">${data.leadNombre}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
          <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${data.leadEmail}" style="color: #0284c7;">${data.leadEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Teléfono:</strong></td>
          <td style="padding: 8px 0; color: #0f172a;"><a href="https://wa.me/${data.leadTelefono.replace(/[^0-9]/g, '')}" style="color: #16a34a; font-weight: bold;">${data.leadTelefono} (Click para abrir WhatsApp)</a></td>
        </tr>
      </table>

      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; color: #334155; font-style: italic;">
        "${data.mensaje}"
      </div>

      <p style="font-size: 11px; color: #94a3b8; margin-top: 30px; text-align: center;">
        MS Propiedades — Sistema de Notificaciones Automáticas
      </p>
    </div>
  `;

    try {
        // Si no hay API KEY configurada en dev, solo logueamos en consola
        if (!process.env.RESEND_API_KEY) {
            console.log('📧 [DEV MOCK EMAIL SENT]:', { to: toEmail, subject: `Lead: ${data.leadNombre} ${data.leadApellido}`, propiedad: data.propiedadCodigo  });
            return { success: true, mock: true };
        }

        const response = await resend.emails.send({
            from: 'MS Propiedades <notificaciones@mspropiedades.com>',
            to: [toEmail],
            subject: `🚨 Consulta por ${data.propiedadCodigo || 'Propiedad'} - ${data.leadNombre}`,
            html: htmlContent,
        });

        return { success: true, id: response.data?.id };
    } catch (error) {
        console.error('❌ Error al enviar email con Resend:', error);
        return { success: false, error };
    }
}