import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { links } from '@/config/contact-info';
import ExcelJS from 'exceljs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      columns = [],
      source = 'all',
      missingMedia = 'all',
      sortBy = 'updatedAt_desc',
      tab = 'activas',
    } = body;

    const where: any = {
      deletedAt: tab === 'papelera' ? { not: null } : null,
    };

    if (source === 'ms_propia') {
      where.colegaId = null;
    } else if (source === 'colega') {
      where.colegaId = { not: null };
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
        imagenes: { take: 1, orderBy: { orden: 'asc' } },
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
    if (columns.includes('destacada')) columnDefinitions.push({ key: 'destacada', header: '¿Es Destacada?', width: 16 });
    if (columns.includes('origen')) columnDefinitions.push({ key: 'origen', header: 'Origen Cartera', width: 16 });
    if (columns.includes('agente')) columnDefinitions.push({ key: 'agente', header: 'Agente Responsable', width: 22 });
    if (columns.includes('hasImages')) columnDefinitions.push({ key: 'hasImages', header: '¿Tiene Fotos Propias?', width: 22 });
    if (columns.includes('hasVideo')) columnDefinitions.push({ key: 'hasVideo', header: '¿Tiene Video Propio?', width: 20 });
    if (columns.includes('videoUrl')) columnDefinitions.push({ key: 'videoUrl', header: 'Link Video', width: 40 });
    if (columns.includes('hasPdf')) columnDefinitions.push({ key: 'hasPdf', header: '¿Tiene Ficha PDF?', width: 18 });
    if (columns.includes('pdfUrl')) columnDefinitions.push({ key: 'pdfUrl', header: 'Link Ficha PDF', width: 40 });
    if (columns.includes('updatedAt')) columnDefinitions.push({ key: 'updatedAt', header: 'Última Actualización', width: 20 });

    worksheet.columns = columnDefinitions;

    // 2. CARGAR FILAS CON TEXTOS LIMPIOS (Sintaxis ultra estable para Microsoft Excel)
    filteredProps.forEach((p) => {
      const isCustomVideo = tieneVideoPropio(p.videoUrl);
      const hasPdf = Boolean(p.pdfUrl && p.pdfUrl.trim() !== '');
      const hasRealImages = tieneFotosReales(p.imagenes);

      const precioNum = typeof p.precio === 'number' ? p.precio : Number(p.precio) || 0;
      const supTotalNum = typeof p.superficieTotal === 'number' ? p.superficieTotal : Number(p.superficieTotal) || 0;
      const supCubiertaNum = typeof p.superficieCubierta === 'number' ? p.superficieCubierta : Number(p.superficieCubierta) || 0;

      const rowData: Record<string, any> = {};

      if (columns.includes('codigo')) rowData.codigo = p.codigo || '';
      if (columns.includes('titulo')) rowData.titulo = p.titulo || '';
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
      if (columns.includes('destacada')) rowData.destacada = p.isDestacada ? 'SÍ' : 'NO';
      if (columns.includes('origen')) rowData.origen = p.colegaId ? 'Colega' : 'Cartera Propia';
      if (columns.includes('agente')) rowData.agente = p.agente ? `${p.agente.nombre} ${p.agente.apellido}` : '-';
      if (columns.includes('hasImages')) rowData.hasImages = hasRealImages ? 'SÍ' : 'NO (Placeholder)';
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
      });
    });

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