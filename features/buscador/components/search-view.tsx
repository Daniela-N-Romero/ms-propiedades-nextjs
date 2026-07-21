// features/buscador/components/search-view.tsx
import { styles } from './search-view.styles';
import type { TipoInmueble, Zona } from '@prisma-client'


interface SearchViewProps {
  zonasPadre: Zona[];
  localidadesFiltradas: Zona[];
  subtipos: TipoInmueble[];
  zonaSelected: string;
  localidadSelected: string;
  categoriaSelected: string;
  subtipoSelected: string;
  onZonaChange: (id: string) => void;
  onLocalidadChange: (id: string) => void;
  onCategoriaChange: (val: string) => void;
  onSubtipoChange: (val: string) => void;
  onSubmit: (e: React.SubmitEvent) => void;
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
      <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end" onSubmit={onSubmit}>
        {/* Selects fijo de Operación*/}
        <div>
          <label className={styles.label}>Operación</label>
          <select
            className={styles.select}
            value={categoriaSelected}
            onChange={(e) => onCategoriaChange(e.target.value)}
          >
            <option value="">Cualquiera</option>
            <option>Alquiler</option>
            <option>Venta</option>
          </select>
        </div>

        {/* SELECT DE TIPO SEGUN PATHNAME DE PÁGINA ACTUAL: /industrial, /residencial, etc */}
        <div>
          <label className={styles.label}>Tipo</label>
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
        </div>

        {/* SELECT DE ZONAS PADRE */}
        <div>
          <label className={styles.label}>Zona</label>
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
        </div>

        {/* SELECT DE LOCALIDADES HIJAS */}
        <div>
          <label className={styles.label}>Localidad</label>
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
        </div>

        <button type="submit" className={styles.searchBtn}>
          🔍 Buscar
        </button>
      </form>
    </div>
  );
}