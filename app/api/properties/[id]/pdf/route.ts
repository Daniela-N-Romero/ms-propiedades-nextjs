import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { getContactLinks } from '@/backend/services/config.service'; // 👈 Importamos el servicio
import { renderToStream } from '@react-pdf/renderer';
import { PlantillaPdf } from '@/features/propiedades/components/pdf/plantilla-pdf';
import React from 'react';



export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Consultamos la propiedad y los datos de contacto en paralelo
        const [propiedad, contactLinks] = await Promise.all([
            prisma.propiedad.findUnique({
                where: { id: Number(id) },
                include: {
                    zona: true,
                    tipoInmueble: true,
                    imagenes: { orderBy: { orden: 'asc' }, take: 5 },
                },
            }),
            getContactLinks(),
        ]);

        if (!propiedad) {
            return new NextResponse('Propiedad no encontrada', { status: 404 });
        }

        // 2. Renderizamos el PDF pasando AMBAS props
        const stream = await renderToStream(
            React.createElement(PlantillaPdf, { propiedad, contactLinks }) as any
        );

        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        const sanitizeFilename = (text: string) => {
            return text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Quita tildes
                .replace(/[^a-zA-Z0-9\s-]/g, '') // Quita caracteres especiales (?, !, /, etc)
                .trim()
                .replace(/\s+/g, '-'); // Reemplaza espacios por guiones
        };

        const nombreArchivo = sanitizeFilename(`${propiedad.titulo} - MS PROPIEDADES`);

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${nombreArchivo}.pdf"`,
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        return new NextResponse('Error al generar la ficha PDF', { status: 500 });
    }
}