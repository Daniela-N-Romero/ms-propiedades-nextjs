'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatNumberWithDots } from '@/lib/utils-formatting';

interface PropiedadArchivo {
  id: number;
  titulo: string;
  categoria: string;
  precio: number;
  moneda: string;
  pdfUrl?: string | null;
  direccionPersonalizada?: string | null;
  descripcion?: string | null;
  zona?: { nombre: string; padre?: { nombre: string, padre?: { nombre: string } } };
  tipoInmueble?: { nombre: string };
  imagenes: { url: string }[];
  superficieTotal: number | null;
  superficieCubierta: number | null;
  caracteristicas: Record<string, any> | null;
  deletedAt?: Date | null;
}

export function ArchivosClient({ propiedades }: { propiedades: PropiedadArchivo[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForPrint, setSelectedForPrint] = useState<PropiedadArchivo | null>(null);

  // BÚSQUEDA ROBUSTA POR MULTI-PALABRAS CLAVE (TOKENS)
  const filtered = propiedades.filter((p) => {
    if (p.deletedAt) return false; 
    if (!searchTerm.trim()) return true;

    // 1. Unificamos todo el texto de la propiedad en un solo String de búsqueda
    const fullContent = `
      ${p.titulo} 
      ${p.direccionPersonalizada || ''} 
      ${p.zona?.nombre || ''} 
      ${p.zona?.padre?.nombre || ''} 
      ${p.tipoInmueble?.nombre || ''} 
      ${p.categoria}
      ${p.moneda}
      ${p.precio}
    `.toLowerCase();

    // 2. Dividimos lo que escribió el usuario por espacios (ej: "ezeiza 3000" -> ["ezeiza", "3000"])
    const searchTokens = searchTerm.toLowerCase().trim().split(/\s+/);

    // 3. Verificamos que TODAS las palabras ingresadas estén en alguna parte del texto
    return searchTokens.every((token) => fullContent.includes(token));
  });

  const handlePrintColega = (propiedad: PropiedadArchivo) => {
    setSelectedForPrint(propiedad);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* HEADER PRINT-HIDDEN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-spartan text-slate-800 flex items-center gap-2">
            📄 Gestor de Archivos & Fichas para Colegas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buscá PDFs adjuntos o generá fichas sin marca ni logo para compartir con inmobiliarias aliadas.
          </p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
        >
          ← Volver al Menú
        </Link>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Buscar por título, dirección o zona..."
          className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* LISTADO DE PROPIEDADES CON THUMBNAIL Y PRECIO FORMATEADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        {filtered.map((p) => {
          const portada = p.imagenes && p.imagenes.length > 0 ? p.imagenes[0].url : '/images/placeholder.png';

          return (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="flex gap-4 items-start">
                {/* THUMBNAIL DE LA PROPIEDAD */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={portada}
                    alt={p.titulo}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>

                {/* DETALLES DE LA PROPIEDAD */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md truncate">
                      {p.tipoInmueble?.nombre || 'Inmueble'} • {p.categoria.toUpperCase()}
                    </span>
                    <span className="text-sm font-extrabold text-amber-600 whitespace-nowrap">
                      {p.moneda} ${formatNumberWithDots(p.precio)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug">{p.titulo}</h3>
                  <p className="text-xs text-slate-500 truncate">
                    📍 {p.direccionPersonalizada || p.zona?.nombre || 'Sin ubicación'}
                  </p>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                {p.pdfUrl ? (
                  <a
                    href={p.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-center transition"
                  >
                    📥 PDF Adjunto
                  </a>
                ) : (
                  <span className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-semibold text-center border border-slate-100">
                    Sin PDF
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handlePrintColega(p)}
                  className="flex-1 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold transition text-center"
                >
                  🪪 Ficha Colega
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PLANTILLA DE IMPRESIÓN "FICHA BLANCA PARA COLEGAS" (SOLO VISIBLE AL IMPRIMIR) */}
      {selectedForPrint && (
        <div className="hidden print:block p-8 bg-white text-slate-900 space-y-6">
          {/* 🔴 ESTILO PARA ELIMINAR ENCABEZADOS Y PIES DE PÁGINA DEL NAVEGADOR (FECHA, HORA, TITULO) */}
          <style>{`
                @media print {
                 @page { margin: 0mm; padding-top: 15mm; padding-bottom: 15mm }
                }`
          }
          </style>

          {/* HEADER / TITULO DE LA FICHA */}
          <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-end">
            <div>
              <span className="text-xs uppercase font-bold text-slate-500">Ficha Informativa / Inmueble</span>
              <h1 className="text-2xl font-bold text-slate-900">{selectedForPrint.titulo}</h1>
              <p className="text-sm text-slate-600">
                {selectedForPrint.tipoInmueble?.nombre} • Operación: {selectedForPrint.categoria.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold block uppercase">Valor de Oferta</span>
              <span className="text-2xl font-black text-slate-900">
                {selectedForPrint.moneda} ${formatNumberWithDots(selectedForPrint.precio)}
              </span>
            </div>
          </div>

          {/* BLOQUE DE UBICACIÓN COMPLETA */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">📍 Ubicación y Zona</h3>
            <p className="text-sm font-bold text-slate-800">
              {selectedForPrint.direccionPersonalizada || 'Dirección a consultar'}
            </p>
            <p className="text-xs font-medium text-slate-600">
              {[
                selectedForPrint.zona?.nombre,
                selectedForPrint.zona?.padre?.nombre,
                selectedForPrint.zona?.padre?.padre?.nombre,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
          </div>

          {/* SUPERFICIES DESTACADAS */}
          {(selectedForPrint.superficieTotal || selectedForPrint.superficieCubierta) && (
            <div className="grid grid-cols-2 gap-4">
              {selectedForPrint.superficieTotal && (
                <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Superficie Total</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {formatNumberWithDots(selectedForPrint.superficieTotal)} m²
                  </span>
                </div>
              )}
              {selectedForPrint.superficieCubierta && (
                <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Superficie Cubierta</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {formatNumberWithDots(selectedForPrint.superficieCubierta)} m²
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CARACTERÍSTICAS TÉCNICAS Y ESPECÍFICAS */}
          {selectedForPrint.caracteristicas && Object.keys(selectedForPrint.caracteristicas).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                🛠️ Características y Servicios
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedForPrint.caracteristicas).map(([key, val]) => {
                  if (!val || val === false) return null;
                  return (
                    <div key={key} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                      <span className="font-semibold text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-bold text-slate-900">
                        {typeof val === 'boolean' ? 'Sí' : String(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DESCRIPCIÓN DETALLADA */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">📝 Descripción</h3>
            <p className="text-xs leading-relaxed whitespace-pre-line text-slate-700">
              {selectedForPrint.descripcion || 'Sin descripción detallada.'}
            </p>
          </div>

          {selectedForPrint.imagenes && selectedForPrint.imagenes.length > 0 && (
            <div className="space-y-2 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Registro Fotográfico</h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedForPrint.imagenes.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Foto ${idx}`}
                    className="w-full h-48 object-cover rounded-xl border border-slate-200"
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}