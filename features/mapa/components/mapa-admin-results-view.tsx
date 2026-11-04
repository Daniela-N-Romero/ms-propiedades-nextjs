'use client';

import { useState } from 'react';
import { 
  useFilterDraft, 
  DesktopFilterSidebar, 
  MobileFilterDrawer 
} from '@/features/filtrado';
import type { 
  ZonaPadre, 
  PartidoConLocalidades, 
  SubtipoOption 
} from '@/features/filtrado';
import MapaPropiedades from './mapa-propiedades';
import type { PropiedadMapaItem } from '@/features/mapa/types/mapa-types';
import type { PropietarioMapaItem, ColegaMapaItem } from '@/features/mapa/types/mapa-types';

interface MapaAdminResultsViewProps {
  propiedades: PropiedadMapaItem[];
  zonasPadre: ZonaPadre[];
  partidos: PartidoConLocalidades[];
  subtipos: SubtipoOption[];
  propietarios?: PropietarioMapaItem[];
  colegas?: ColegaMapaItem[];
  centroInicial?: [number, number];
  zoomInicial?: number;
}

export default function MapaAdminResultsView({
  propiedades,
  zonasPadre,
  partidos,
  subtipos,
  propietarios,
  colegas,
  centroInicial,
  zoomInicial,
}: MapaAdminResultsViewProps) {
  const { activeCount, isPending } = useFilterDraft();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* HEADER Y LEYENDA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-spartan text-slate-900">
              🗺️ Mapa Privado de Administración
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Mostrando <span className="font-bold text-slate-900">{propiedades.length}</span> inmuebles geolocalizados
            </p>
          </div>

          {isPending && (
            <span className="text-xs font-spartan font-bold text-amber-700 animate-pulse bg-amber-50 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Actualizando mapa...
            </span>
          )}
        </div>

        {/* LEYENDA DE CARTERA */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Cartera Propia</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>De Colega</span>
          </div>
        </div>
      </div>

      {/* BOTÓN MOBILE */}
      <div className="flex md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="w-full py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-spartan font-bold uppercase text-slate-700 flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Filtros del Mapa</span>
          {activeCount > 0 && (
            <span className="bg-brand-orange text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* DRAWER MÓVIL OPTIMIZADO */}
      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        zonasPadre={zonasPadre}
        partidos={partidos}
        subtipos={subtipos}
      />

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <aside className="hidden md:block rounded-2xl border border-slate-200 shadow-sm space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin">
          <DesktopFilterSidebar
            zonasPadre={zonasPadre}
            partidos={partidos}
            subtipos={subtipos}
          />
        </aside>

        <section className="md:col-span-3">
          <MapaPropiedades
            propiedades={propiedades}
            centroInicial={centroInicial}
            zoomInicial={zoomInicial}
            alturaClass="h-[calc(100vh-160px)] min-h-[500px]"
            isPrivateAdmin={true} 
            propietarios={propietarios}
            colegas={colegas}
          />
        </section>
      </div>
    </div>
  );
}