// features/buscador/components/search-view.tsx
import { styles } from './search-view.styles';
import { Zona } from  '@prisma-client'


interface SearchViewProps {
  zonasPadre: Zona[];
  localidadesFiltradas: Zona[];
  zonaSelected: string;
  localidadSelected: string;
  onZonaChange: (id: string) => void;
  onLocalidadChange: (id: string) => void;
}

export default function SearchView({
  zonasPadre,
  localidadesFiltradas,
  zonaSelected,
  localidadSelected,
  onZonaChange,
  onLocalidadChange
}: SearchViewProps) {
  return (
    <div className={styles.searchContainer}>
      <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end" onSubmit={(e) => e.preventDefault()}>
        {/* Selects fijos de Operación y Tipo */}
        <div>
          <label className={styles.label}>Operación</label>
          <select className={styles.select}>
            <option>Venta</option>
            <option>Alquiler</option>
          </select>
        </div>
        <div>
          <label className={styles.label}>Tipo</label>
          <select className={styles.select}>
            <option>Nave Industrial</option>
            <option>Galpón</option>
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