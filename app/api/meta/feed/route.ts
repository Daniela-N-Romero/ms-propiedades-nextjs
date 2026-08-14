// app/api/meta/feed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';

export async function GET(req: Request) {
    try {
        const propiedades = await prisma.propiedad.findMany({
            where: {
                isPublished: true,    // Debe estar activa en la web
                deletedAt: null,      // No estar en la papelera
                permitMetaAd: true,   // 🔑 REGLA ÚNICA: Solo las que tenés aprobadas para Meta
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                zona: { include: { padre: true } },
                tipoInmueble: true,
                imagenes: { orderBy: { orden: 'asc' } },
            },
        });

        const host = req.headers.get('host') || 'mspropiedadesindustrial.com.ar';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        // 📋 ENCABEZADOS EXACTOS DEL CSV QUE PIDE LA PLANTILLA DE META
        const headers = [
            'home_listing_id',
            'name',
            'description',
            'availability',
            'price',
            'url',
            'image[0].url',
            'image[0].tag[0]',
            'address.addr1',
            'address.city',
            'address.region',
            'address.country',
            'latitude',
            'longitude',
            'neighborhood[0]',
            'property_type',
            'custom_label_0',
        ];

        const rows = propiedades.map((p) => {
            // 1. Formato Precio ISO ("250000 USD")
            const rawPrecio = typeof p.precio === 'number' ? p.precio : Number(p.precio) || 0;
            const moneda = (p.moneda || 'USD').trim().toUpperCase();
            const precioMeta = `${Math.round(rawPrecio)} ${moneda}`;

            // 2. Disponibilidad Meta
            const availability = p.categoria === 'alquiler' ? 'for_rent' : 'for_sale';

            // 3. URLs
            const fichaUrl = `${baseUrl}/propiedades/${p.slug.trim()}`;
            const mainImage = p.imagenMetaUrl
                ? (p.imagenMetaUrl.startsWith('http') ? p.imagenMetaUrl.trim() : `${baseUrl}${p.imagenMetaUrl.trim()}`)
                : p.imagenes?.[0]?.url
                    ? (p.imagenes[0].url.startsWith('http') ? p.imagenes[0].url.trim() : `${baseUrl}${p.imagenes[0].url.trim()}`)
                    : `${baseUrl}/images/placeholder.png`;

            // 4. Ubicación
            const calle = (p.direccionPersonalizada || p.zona?.nombre || 'Buenos Aires').replace(/,/g, '');
            const ciudad = (p.zona?.nombre || 'Buenos Aires').replace(/,/g, '');
            const provincia = (p.zona?.padre?.nombre || 'Buenos Aires').replace(/,/g, '');
            const lat = p.latitud ? Number(p.latitud) : -34.78;
            const lng = p.longitud ? Number(p.longitud) : -58.28;

            // 5. Tipo Inmueble
            let propertyType = 'other';
            const tipo = (p.tipoInmueble?.nombre || '').toLowerCase();
            if (tipo.includes('lote') || tipo.includes('terreno')) propertyType = 'land';
            else if (tipo.includes('casa')) propertyType = 'house';
            else if (tipo.includes('depto')) propertyType = 'apartment';

            // Sanitizar comas y saltos de línea para el CSV
            const cleanName = (p.titulo || '').replace(/,/g, ' ').replace(/\n/g, ' ').trim();
            const cleanDesc = (p.descripcion || p.titulo || '').replace(/,/g, ' ').replace(/\n/g, ' ').trim();

            return [
                p.codigo ? p.codigo.trim() : `PROP-${p.id}`,
                `"${cleanName}"`,
                `"${cleanDesc}"`,
                availability,
                precioMeta,
                fichaUrl,
                mainImage,
                'Principal',
                `"${calle}"`,
                `"${ciudad}"`,
                `"${provincia}"`,
                'Argentina',
                lat,
                lng,
                `"${ciudad}"`,
                propertyType,
                `"${p.tipoInmueble?.nombre || 'Inmueble'}"`,
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate', // Cache de 1 hora
            },
        });
    } catch (error) {
        console.error('Error generando Feed Meta:', error);
        return NextResponse.json({ error: 'Error al generar Feed' }, { status: 500 });
    }
}