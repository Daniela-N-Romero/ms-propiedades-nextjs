// features/buscador/components/search-view.tsx
import { ZonaServer } from '@/types/server-data';
import { styles } from './search-view.styles';
import type { TipoInmueble } from '@prisma-client';
import { useEffect, useRef, useState } from 'react';

interface SearchViewProps {
  zonasPadre: ZonaServer[];
  localidadesFiltradas: ZonaServer[];
  subtipos: TipoInmueble[];
  zonaSelected: string;
  partidosSelected: string[];
  categoriaSelected: string;
  subtipoSelected: string;
  onZonaChange: (id: string) => void;
  onPartidosChange: (id: string[]) => void;
  onCategoriaChange: (val: string) => void;
  onSubtipoChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SearchView({
  zonasPadre,
  localidadesFiltradas,
  subtipos,
  zonaSelected,
  partidosSelected = [],
  categoriaSelected,
  subtipoSelected,
  onZonaChange,
  onPartidosChange,
  onCategoriaChange,
  onSubtipoChange,
  onSubmit
}: SearchViewProps) {
  const [openPartidos, setOpenPartidos] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú desplegable si el usuario hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenPartidos(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Alternar la selección de un partido en el array
  const handleTogglePartido = (id: string) => {
    const idStr = String(id);
    if (partidosSelected.includes(idStr)) {
      onPartidosChange(partidosSelected.filter(pId => pId !== idStr));
    } else {
      onPartidosChange([...partidosSelected, idStr]);
    }
  };

  // Texto amigable para el botón del selector
  const renderPartidosLabel = () => {
    if (!zonaSelected) return 'Seleccione zona';
    if (partidosSelected.length === 0) return 'Todos los partidos';
    if (partidosSelected.length === 1) {
      const p = localidadesFiltradas.find(l => String(l.id) === partidosSelected[0]);
      return p ? p.nombre : '1 seleccionado';
    }
    return `${partidosSelected.length} seleccionados`;
  };

  return (
    <div className={styles.searchContainer}>
      {/* 📱 2 columnas en celular, 5 columnas alineadas en computadoras */}
      <form className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 items-end" onSubmit={onSubmit}>
        
        {/* 1. OPERACIÓN */}
        <div className="col-span-1">
          <label className={styles.label}>Operación</label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={categoriaSelected}
              onChange={(e) => onCategoriaChange(e.target.value)}
            >
              <option value="">Cualquiera</option>
              <option value="alquiler">Alquiler</option>
              <option value="venta">Venta</option>
            </select>
            {/* Flecha personalizada sutil */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</span>
          </div>
        </div>

        {/* 2. TIPO */}
        <div className="col-span-1">
          <label className={styles.label}>Tipo</label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={subtipoSelected}
              onChange={(e) => onSubtipoChange(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {subtipos.map((st) => (
                <option key={st.id} value={st.slug}>
                  {st.nombre}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</span>
          </div>
        </div>

        {/* 3. ZONA */}
        <div className="col-span-1">
          <label className={styles.label}>Zona</label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={zonaSelected}
              onChange={(e) => onZonaChange(e.target.value)}
            >
              <option value="">Todas las zonas</option>
              {zonasPadre.map(z => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</span>
          </div>
        </div>

        {/* 4. PARTIDOS (MULTI-SELECT CUSTOM) */}
        <div className="col-span-1 relative" ref={dropdownRef}>
          <label className={styles.label}>Partido</label>
          <button
            type="button"
            disabled={!zonaSelected}
            onClick={() => setOpenPartidos(!openPartidos)}
            className={`${styles.select} text-left flex items-center justify-between w-full disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="truncate">{renderPartidosLabel()}</span>
            <span className="text-slate-400 text-[10px] ml-2">▼</span>
          </button>

          {/* Menú Flotante con Checkboxes */}
          {openPartidos && zonaSelected && (
            <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
              <button
                type="button"
                onClick={() => onPartidosChange([])}
                className="w-full text-left text-xs font-semibold text-slate-400 hover:text-slate-200 pb-1 mb-1 border-b border-slate-100"
              >
                Limpiar selección X
              </button>
              
              {localidadesFiltradas.map((l) => {
                const isChecked = partidosSelected.includes(String(l.id));
                return (
                  <label
                    key={l.id}
                    className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 hover:text-slate-900 rounded cursor-pointer text-xs text-white"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePartido(String(l.id))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="select-none truncate">{l.nombre}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. BOTÓN BUSCAR (En celular ocupa 2 columnas completas abajo) */}
        <div className="col-span-2 md:col-span-1">
          <button type="submit" className={styles.searchBtn}>
            <span>🔍</span>
            <span>Buscar</span>
          </button>
        </div>

      </form>
    </div>
  );
}