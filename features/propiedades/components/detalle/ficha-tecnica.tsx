import { formatPrecio } from '@/lib/utils';
import { styles } from './ficha-tecnica.styles';

// 📚 Diccionario Mapeador de Íconos para Características Técnicas (JSON)
const ICONOS_CARACTERISTICAS: Record<string, { label: string; icon: string }> = {
  fuerzaMotriz: { label: 'Fuerza Motriz / T3', icon: '⚡' },
  redIncendios: { label: 'Red de Incendios / Sprinklers', icon: '🧯' },
  gasIndustrial: { label: 'Gas Industrial', icon: '🔥' },
  oficinas: { label: 'Sector Oficinas', icon: '💼' },
  puenteGrua: { label: 'Puente Grúa', icon: '🏗️' },
  dockCarga: { label: 'Docks de Carga', icon: '🚛' },
  seguridad24hs: { label: 'Seguridad 24 hs', icon: '🛡️' },
  zonificacionIndustrial: { label: 'Zonificación Industrial', icon: '🏭' },
  playaManiobras: { label: 'Playa de Maniobras', icon: '🚚' },
  cloacas: { label: 'Planta de Tratamiento / Cloacas', icon: '💧' },
  balanza: { label: 'Balanza para Camiones', icon: '⚖️' },
};

interface FichaTecnicaProps {
  precio: number;
  moneda: string;
  superficieTotal: number | null;
  superficieCubierta: number | null;
  descripcion: string | null;
  caracteristicas?: Record<string, any> | null;
  subtipoNombre?: string;
}

export default function FichaTecnica({
  precio,
  moneda,
  superficieTotal,
  superficieCubierta,
  descripcion,
  caracteristicas,
  subtipoNombre
}: FichaTecnicaProps) {
  
  // Filtramos solo las características del JSON que estén en true o tengan valor
  const caracteristicasValidas = caracteristicas 
    ? Object.entries(caracteristicas).filter(([_, value]) => Boolean(value))
    : [];

  return (
    <div className="space-y-8">
      
      {/* 1️⃣ BARRA DE DESTACADOS (HIGHLIGHTS BAR) */}
      <div className={styles.highlightsContainer}>
        
        {/* VALOR / PRECIO */}
        <div className={styles.highlightItem}>
          <span className={styles.highlightLabel}>Valor de la Propiedad</span>
          <span className={styles.highlightPrice}>
            {formatPrecio(precio, moneda)}
          </span>
        </div>

        {/* SUPERFICIE TOTAL */}
        <div className={styles.highlightItem}>
          <span className={styles.highlightLabel}>Superficie Total</span>
          <span className={styles.highlightValue}>
            {superficieTotal ? `${superficieTotal.toLocaleString('es-AR')} m²` : 'Consultar'}
          </span>
        </div>

        {/* SUPERFICIE CUBIERTA */}
        <div className={styles.highlightItem}>
          <span className={styles.highlightLabel}>Superficie Cubierta</span>
          <span className={styles.highlightValue}>
            {superficieCubierta ? `${superficieCubierta.toLocaleString('es-AR')} m²` : 'Consultar'}
          </span>
        </div>

        {/* TIPO DE INMUEBLE */}
        <div className={styles.highlightItem}>
          <span className={styles.highlightLabel}>Tipo de Inmueble</span>
          <span className={styles.highlightValue}>
            {subtipoNombre || 'Industrial'}
          </span>
        </div>

      </div>

      {/* DICCIONARIO DE CARACTERÍSTICAS TÉCNICAS (Solo si existen) */}
      {caracteristicasValidas.length > 0 && (
        <div>
          <h3 className={styles.sectionTitle}>Equipamiento y Servicios</h3>
          <div className={styles.featuresGrid}>
            {caracteristicasValidas.map(([key, value]) => {
              const meta = ICONOS_CARACTERISTICAS[key] || { 
                label: typeof value === 'string' ? `${key}: ${value}` : key, 
                icon: '✔' 
              };

              return (
                <div key={key} className={styles.featureCard}>
                  <span className={styles.featureIcon}>{meta.icon}</span>
                  <span className={styles.featureLabel}>
                    {typeof value === 'string' ? `${meta.label} (${value})` : meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MEMORIA DESCRIPTIVA */}
      {descripcion && (
        <div>
          <h3 className={styles.sectionTitle}>Descripción General</h3>
          <div className={styles.descriptionText}>
            {descripcion}
          </div>
        </div>
      )}

    </div>
  );
}