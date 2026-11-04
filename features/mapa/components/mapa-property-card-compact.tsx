// features/mapa/components/mapa-property-card-compact.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrecio } from '@/lib/utils-formatting';
import { useWhatsAppButtons } from '@/features/propiedades/hooks/use-whatsapp-buttons';
import type { PropiedadMapaItem } from '../types/mapa-types';

interface MapaPropertyCardCompactProps {
  propiedad: PropiedadMapaItem;
  isPrivateAdmin?: boolean;
}

export function MapaPropertyCardCompact({
  propiedad,
  isPrivateAdmin = false,
}: MapaPropertyCardCompactProps) {
  const isOwn = propiedad.origen !== 'fromColleague';

  const { whatsAppUrl, handleWhatsAppClick } = useWhatsAppButtons({
    codigo: propiedad.codigo,
    slug: propiedad.slug,
    titulo: propiedad.titulo,
    precio: propiedad.precio,
    moneda: propiedad.moneda,
    agente: propiedad.agente,
  });

  return (
    <div className="w-[82vw] max-w-85 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col select-none">
      <div className="flex h-28">
        {/* Imagen de Portada */}
        <div className="relative w-28 sm:w-32 bg-slate-100 shrink-0">
          <img
            src={propiedad.imagenPortada || '/images/placeholder.png'}
            alt={propiedad.titulo}
            className="w-full h-full object-cover"
          />
          {isPrivateAdmin && (
            <span
              className={`absolute top-1.5 left-1.5 px-2 py-0.5 text-[9px] font-bold text-white uppercase rounded shadow-sm ${
                isOwn ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              {isOwn ? 'Propia' : 'Colega'}
            </span>
          )}
        </div>

        {/* Contenido Principal */}
        <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              REF: {propiedad.codigo} • {propiedad.zonaNombre}
            </span>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">
              {propiedad.titulo}
            </h4>
          </div>

          <div className="space-y-0.5">
            <div className="text-[11px] font-medium text-slate-500 truncate">
              {propiedad.superficieTotal ? `${propiedad.superficieTotal} m² tot.` : ''}
              {propiedad.superficieTotal && propiedad.superficieCubierta ? ' • ' : ''}
              {propiedad.superficieCubierta ? `${propiedad.superficieCubierta} m² cub.` : ''}
            </div>
            <p className="text-sm font-extrabold text-brand-green">
              {formatPrecio(propiedad.precio, propiedad.moneda)}
            </p>
          </div>
        </div>
      </div>

      {/* Botonera Inferior */}
      <div className="border-t border-slate-100 bg-slate-50 p-2 flex gap-2 items-center">
        {isPrivateAdmin ? (
          <Link
            href={`/admin/${propiedad.id}/editar/`}
            className="flex-1 py-1.5 text-center bg-brand-orange hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            ✏️ Editar
          </Link>
        ) : (
          <>
            <Link
              href={`/propiedades/${propiedad.slug}`}
              className="flex-1 py-1.5 text-center bg-brand-dark hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
            >
              Ver Propiedad
            </Link>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center transition"
              onClick={(propiedad) => handleWhatsAppClick(propiedad)}
              title="Consultar por WhatsApp"
            >
              <Image src="/images/logos/social-media/whatsapp-logo.svg" width={26} height={26} alt="Enlace a WhatsApp" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}