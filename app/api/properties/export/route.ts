// app/api/properties/export/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { links } from '@/config/contact-info';
import ExcelJS from 'exceljs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { isMetaCatalog = false } = body;
    const {
      columns = [],
      source = 'all',
      missingMedia = 'all',
      publishState = 'all',
      tipoInmuebleId = 'all',
      sortBy = 'updatedAt_desc',
      tab = 'activas',
    } = body;

    const where: any = {
      deletedAt: tab === 'papelera' ? { not: null } : null,
    };

    // Filtro Origen
    if (source === 'ms_propia') {
      where.colegaId = null;
    } else if (source === 'colega') {
      where.colegaId = { not: null };
    }

    // Filtro Estado de Publicación
    if (publishState === 'published') {
      where.isPublished = true;
    } else if (publishState === 'draft') {
      where.isPublished = false;
    }

    // Filtro Tipo de Inmueble (Busca tanto si es el subtipo o si el padre es este ID)
    if (tipoInmuebleId && tipoInmuebleId !== 'all') {
      const numericId = Number(tipoInmuebleId);

      if (!isNaN(numericId) && numericId > 0) {
        // Si viene un ID numérico
        where.OR = [
          { tipoInmuebleId: numericId },
          { tipoInmueble: { padreId: numericId } },
        ];
      } else {
        // Si viene un Slug/Texto (ej: 'industrial', 'comercial')
        const slugQuery = String(tipoInmuebleId).toLowerCase();
        where.OR = [
          { tipoInmueble: { slug: slugQuery } },
          { tipoInmueble: { padre: { slug: slugQuery } } },
        ];
      }
    }

    const [sortField, sortDir] = sortBy.split('_');
    const orderBy: any = {};
    if (sortField === 'updatedAt') orderBy.updatedAt = sortDir;
    if (sortField === 'precio') orderBy.precio = sortDir;
    if (sortField === 'titulo') orderBy.titulo = sortDir;

    const propiedades = await prisma.propiedad.findMany({
      where,
      orderBy,
      include: {
        zona: { include: { padre: { include: { padre: true } } } },
        tipoInmueble: { include: { padre: true } },
        agente: true,
        propietario: true,
        colega: true,
        imagenes: { orderBy: { orden: 'asc' } },
      },
    });

    const tieneVideoPropio = (url?: string | null) => {
      if (!url || url.trim() === '') return false;
      if (url === links.videoIndustrialDefault || url.toLowerCase().includes('default')) {
        return false;
      }
      return true;
    };

    const tieneFotosReales = (imagenes?: { url: string }[]) => {
      if (!imagenes || imagenes.length === 0) return false;
      const mainUrl = imagenes[0].url || '';
      return !mainUrl.includes('placeholder') && mainUrl.trim() !== '';
    };

    const filteredProps = propiedades.filter((p) => {
      const isCustomVideo = tieneVideoPropio(p.videoUrl);
      const hasPdf = Boolean(p.pdfUrl && p.pdfUrl.trim() !== '');
      const hasRealImages = tieneFotosReales(p.imagenes);

      if (missingMedia === 'no_images' && hasRealImages) return false;
      if (missingMedia === 'has_video' && !isCustomVideo) return false;
      if (missingMedia === 'no_video' && isCustomVideo) return false;
      if (missingMedia === 'has_pdf' && !hasPdf) return false;
      if (missingMedia === 'no_pdf' && hasPdf) return false;

      return true;
    });

    // 1. CREAR LIBRO Y HOJA CON EXCELJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Propiedades MS');

    // Mapeo de definición de columnas
    const columnDefinitions: { key: string; header: string; width: number }[] = [];

    if (columns.includes('codigo')) columnDefinitions.push({ key: 'codigo', header: 'Código / Ref', width: 15 });
    if (columns.includes('titulo')) columnDefinitions.push({ key: 'titulo', header: 'Título Comercial', width: 35 });
    if (columns.includes('linkPropiedad')) columnDefinitions.push({ key: 'linkPropiedad', header: 'Enlace Público Ficha', width: 45 }); // NUEVO
    if (columns.includes('categoria')) columnDefinitions.push({ key: 'categoria', header: 'Operación', width: 14 });
    if (columns.includes('precio')) columnDefinitions.push({ key: 'precio', header: 'Precio', width: 16 });
    if (columns.includes('moneda')) columnDefinitions.push({ key: 'moneda', header: 'Moneda', width: 10 });
    if (columns.includes('superficieTotal')) columnDefinitions.push({ key: 'superficieTotal', header: 'Sup. Total (m²)', width: 16 });
    if (columns.includes('superficieCubierta')) columnDefinitions.push({ key: 'superficieCubierta', header: 'Sup. Cubierta (m²)', width: 18 });
    if (columns.includes('mercado')) columnDefinitions.push({ key: 'mercado', header: 'Mercado', width: 18 });
    if (columns.includes('subtipo')) columnDefinitions.push({ key: 'subtipo', header: 'Subtipo', width: 22 });
    if (columns.includes('localidad')) columnDefinitions.push({ key: 'localidad', header: 'Localidad / Zona', width: 22 });
    if (columns.includes('direccion')) columnDefinitions.push({ key: 'direccion', header: 'Dirección Textual', width: 28 });
    if (columns.includes('estado')) columnDefinitions.push({ key: 'estado', header: 'Estado Publicación', width: 20 });
    if (columns.includes('visibilidad')) columnDefinitions.push({ key: 'visibilidad', header: 'Visibilidad', width: 20 }); // NUEVO
    if (columns.includes('destacada')) columnDefinitions.push({ key: 'destacada', header: '¿Es Destacada?', width: 16 });
    if (columns.includes('origen')) columnDefinitions.push({ key: 'origen', header: 'Origen Cartera', width: 16 });
    if (columns.includes('agente')) columnDefinitions.push({ key: 'agente', header: 'Agente Responsable', width: 22 });
    if (columns.includes('hasImages')) columnDefinitions.push({ key: 'hasImages', header: '¿Tiene Fotos Propias?', width: 22 });
    if (columns.includes('imagenPortada')) columnDefinitions.push({ key: 'imagenPortada', header: 'Imagen Portada URL', width: 40 });
    if (columns.includes('imagenesAdicionales')) columnDefinitions.push({ key: 'imagenesAdicionales', header: 'Galería de Fotos (URLs)', width: 50 });
    if (columns.includes('hasVideo')) columnDefinitions.push({ key: 'hasVideo', header: '¿Tiene Video Propio?', width: 20 });
    if (columns.includes('videoUrl')) columnDefinitions.push({ key: 'videoUrl', header: 'Link Video', width: 40 });
    if (columns.includes('hasPdf')) columnDefinitions.push({ key: 'hasPdf', header: '¿Tiene Ficha PDF?', width: 18 });
    if (columns.includes('pdfUrl')) columnDefinitions.push({ key: 'pdfUrl', header: 'Link Ficha PDF', width: 40 });
    if (columns.includes('updatedAt')) columnDefinitions.push({ key: 'updatedAt', header: 'Última Actualización', width: 20 });

    worksheet.columns = columnDefinitions;

    // Generar Base URL dinámica basada en el header (para el enlace público)
    const host = req.headers.get('host') || 'mspropiedades.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    if (isMetaCatalog) {
      // ----------------------------------------------------
      // FORMATO OFICIAL META BUSINESS SUITE (REAL ESTATE)
      // ----------------------------------------------------
      worksheet.columns = [
        { key: 'home_listing_id', header: 'home_listing_id', width: 20 },
        { key: 'name', header: 'name', width: 35 },
        { key: 'description', header: 'description', width: 50 },
        { key: 'address', header: 'address', width: 30 },
        { key: 'price', header: 'price', width: 18 },
        { key: 'url', header: 'url', width: 45 },
        { key: 'image_link', header: 'image_link', width: 45 },
        { key: 'additional_image_link', header: 'additional_image_link', width: 45 },
        { key: 'image', header: 'image', width: 45 },
        { key: 'availability', header: 'availability', width: 15 },
        { key: 'property_type', header: 'property_type', width: 18 },
      ];

      filteredProps.forEach((p) => {
        // En Meta el precio debe ir como "250000 USD" o "15000000 ARS"
        const precioFormateado = `${p.precio || 0} ${p.moneda || 'USD'}`;

        // Determinar si es Venta o Alquiler para Meta (for_sale / for_rent)
        const availability = p.isPublished ? 'in stock' : 'out of stock';

        // 1. URL Imagen Principal (Portada)
        const mainImage = p.imagenes?.[0]?.url
          ? (p.imagenes[0].url.startsWith('http') ? p.imagenes[0].url.trim() : `${baseUrl}${p.imagenes[0].url.trim()}`)
          : `${baseUrl}/images/placeholder.png`;

        // 2. URL Galería de Imágenes Adicionales (Todas las fotos extras desde el índice 1 en adelante)
        const additionalImages = (p.imagenes || [])
          .slice(1) // Omitimos la primera foto (que es la portada)
          .map((img) => (img.url.startsWith('http') ? img.url.trim() : `${baseUrl}${img.url.trim()}`))
          .join(','); // 🔑 Meta exige que estén separadas por comas

        worksheet.addRow({
          home_listing_id: p.codigo || `PROP-${p.id}`,
          name: p.titulo || 'Propiedad sin título',
          description: p.descripcion || p.titulo || 'Consulte para más detalles.',
          address: p.direccionPersonalizada || p.zona?.nombre || 'Buenos Aires',
          price: precioFormateado,
          url: `${baseUrl}/propiedades/${p.slug}`,
          image_link: mainImage,
          image: mainImage,
          additional_image_link: additionalImages,
          availability: availability,
          property_type: p.tipoInmueble?.nombre || 'other',
        });
      });

    } else {
      // 2. CARGAR FILAS
      filteredProps.forEach((p) => {
        const isCustomVideo = tieneVideoPropio(p.videoUrl);
        const hasPdf = Boolean(p.pdfUrl && p.pdfUrl.trim() !== '');
        const hasRealImages = tieneFotosReales(p.imagenes);

        const precioNum = typeof p.precio === 'number' ? p.precio : Number(p.precio) || 0;
        const supTotalNum = typeof p.superficieTotal === 'number' ? p.superficieTotal : Number(p.superficieTotal) || 0;
        const supCubiertaNum = typeof p.superficieCubierta === 'number' ? p.superficieCubierta : Number(p.superficieCubierta) || 0;

        const imagenPortadaUrl = p.imagenes?.[0]?.url ? `${baseUrl}${p.imagenes[0].url}` : 'Sin Imagen';
        const linkFicha = p.isPublished ? `${baseUrl}/propiedades/${p.slug}` : 'No disponible (Borrador)';

        const rowData: Record<string, any> = {};

        if (columns.includes('codigo')) rowData.codigo = p.codigo || '';
        if (columns.includes('titulo')) rowData.titulo = p.titulo || '';
        if (columns.includes('linkPropiedad')) rowData.linkPropiedad = linkFicha; 
        if (columns.includes('categoria')) rowData.categoria = p.categoria ? p.categoria.toUpperCase() : '-';
        if (columns.includes('precio')) rowData.precio = precioNum;
        if (columns.includes('moneda')) rowData.moneda = p.moneda || 'USD';
        if (columns.includes('superficieTotal')) rowData.superficieTotal = supTotalNum;
        if (columns.includes('superficieCubierta')) rowData.superficieCubierta = supCubiertaNum;
        if (columns.includes('mercado')) rowData.mercado = p.tipoInmueble?.padre?.nombre || 'General';
        if (columns.includes('subtipo')) rowData.subtipo = p.tipoInmueble?.nombre || '-';
        if (columns.includes('localidad')) rowData.localidad = p.zona?.nombre || 'Sin Zona';
        if (columns.includes('direccion')) rowData.direccion = p.direccionPersonalizada || '-';
        if (columns.includes('estado')) rowData.estado = p.isPublished ? 'Publicada' : 'Borrador';
        if (columns.includes('visibilidad')) rowData.visibilidad = p.isUnlisted ? 'Privada (Oculta)' : 'Pública'; 
        if (columns.includes('destacada')) rowData.destacada = p.isDestacada ? 'SÍ' : 'NO';
        if (columns.includes('origen')) rowData.origen = p.colegaId ? 'Colega' : 'Cartera Propia';
        if (columns.includes('agente')) rowData.agente = p.agente ? `${p.agente.nombre} ${p.agente.apellido}` : '-';
        if (columns.includes('hasImages')) rowData.hasImages = hasRealImages ? 'SÍ' : 'NO (Placeholder)';
        if (columns.includes('imagenPortada')) rowData.imagenPortada = imagenPortadaUrl;
        if (columns.includes('imagenesAdicionales')) rowData.imagenesAdicionales = (p.imagenes || [])
           .slice(1)
           .map((img) => (img.url.startsWith('http') ? img.url.trim() : `${baseUrl}${img.url.trim()}`))
           .join(', ');
        if (columns.includes('hasVideo')) rowData.hasVideo = isCustomVideo ? 'SÍ' : 'NO';
        if (columns.includes('videoUrl')) rowData.videoUrl = isCustomVideo && p.videoUrl ? p.videoUrl : 'Sin Video Propio';
        if (columns.includes('hasPdf')) rowData.hasPdf = hasPdf ? 'SÍ' : 'NO';
        if (columns.includes('pdfUrl')) rowData.pdfUrl = hasPdf && p.pdfUrl ? p.pdfUrl : 'Sin PDF';
        if (columns.includes('updatedAt')) rowData.updatedAt = new Date(p.updatedAt).toLocaleDateString('es-AR');

        worksheet.addRow(rowData);
      });

      // 3. ESTILOS DE CABECERA (AZUL MARCA MS)
      const headerRow = worksheet.getRow(1);
      headerRow.height = 26;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F172A' },
        };
        cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // 4. FORMATO CONDICIONAL & CELDAS
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        row.height = 20;

        row.eachCell((cell, colNumber) => {
          const header = columnDefinitions[colNumber - 1]?.key;

          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.font = { name: 'Segoe UI', size: 10 };

          // Formatos Numéricos
          if (header === 'precio') {
            cell.numFmt = '"$"#,##0';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          }
          if (header === 'superficieTotal' || header === 'superficieCubierta') {
            cell.numFmt = '#,##0';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          }

          // 👈 Formato como Hyperlink clickeable en Excel para URLs
          if ((header === 'linkPropiedad' || header === 'imagenPortada' || header === 'videoUrl' || header === 'pdfUrl') && typeof cell.value === 'string' && cell.value.startsWith('http')) {
            cell.value = {
              text: cell.value,
              hyperlink: cell.value
            };
            cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF0563C1' }, underline: true }; // Azul clásico de link
          }

          // Colores pastel para validaciones
          if (header === 'hasImages' || header === 'hasVideo' || header === 'hasPdf') {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Segoe UI', size: 10, bold: true };

            if (String(cell.value).startsWith('SÍ')) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Verde pastel
              cell.font.color = { argb: 'FF15803D' };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Rojo pastel
              cell.font.color = { argb: 'FFB91C1C' };
            }
          }

          if (header === 'estado') {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Segoe UI', size: 10, bold: true };

            if (cell.value === 'Publicada') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
              cell.font.color = { argb: 'FF15803D' };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
              cell.font.color = { argb: 'FFB45309' };
            }
          }

          // Formato para Privada/Pública
          if (header === 'visibilidad') {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Segoe UI', size: 10, bold: true };
            if (cell.value === 'Pública') {
              cell.font.color = { argb: 'FF334155' };
            } else {
              cell.font.color = { argb: 'FF4338CA' }; // Índigo para privadas
            }
          }
        });
      });
    }
    // 5. AUTOFILTRO
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: filteredProps.length + 1, column: columnDefinitions.length },
    };

    // 6. DEVOLUCIÓN DE BUFFER BINARIO
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Propiedades_MS_${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    });
  } catch (error) {
    console.error('Error generando archivo Excel:', error);
    return NextResponse.json({ error: 'Error al exportar datos a Excel' }, { status: 500 });
  }
}