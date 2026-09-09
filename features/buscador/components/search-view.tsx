// features/buscador/components/search-view.tsx
import { ZonaServer } from '@/types/server-data';
import { styles } from './search-view.styles';
import type { TipoInmueble } from '@prisma-client';

interface SearchViewProps {
  zonasPadre: ZonaServer[];
  localidadesFiltradas: ZonaServer[];
  subtipos: TipoInmueble[];
  zonaSelected: string;
  localidadSelected: string;
  categoriaSelected: string;
  subtipoSelected: string;
  onZonaChange: (id: string) => void;
  onLocalidadChange: (id: string) => void;
  onCategoriaChange: (val: string) => void;
  onSubtipoChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SearchView({
  zonasPadre,
  localidadesFiltradas,
  subtipos,
  zonaSelected,
  localidadSelected,
  categoriaSelected,
  subtipoSelected,
  onZonaChange,
  onLocalidadChange,
  onCategoriaChange,
  onSubtipoChange,
  onSubmit
}: SearchViewProps) {
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

        {/* 4. LOCALIDAD */}
        <div className="col-span-1">
          <label className={styles.label}>Localidad</label>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={localidadSelected}
              onChange={(e) => onLocalidadChange(e.target.value)}
              disabled={!zonaSelected}
            >
              <option value="">
                {zonaSelected ? 'Todas las localidades' : 'Seleccione zona'}
              </option>
              {localidadesFiltradas.map(l => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</span>
          </div>
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