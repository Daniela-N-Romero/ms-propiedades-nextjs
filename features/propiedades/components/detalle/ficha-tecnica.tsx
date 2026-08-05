import { formatPrecio } from '@/lib/utils-formatting';
import { styles } from './ficha-tecnica.styles';
import { ICONOS_CARACTERISTICAS } from '@/types/caracteristicas';

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

  /* 1. Mapeo formateador por defecto */
  const formatCamelCase = (str: string) => {
    return str
      .replace(/([A-Z])/g, ' $1') // Agrega espacio antes de mayúsculas ("almaLlena" -> "alma Llena")
      .replace(/^./, (s) => s.toUpperCase()) // Pone la primera letra en mayúscula ("Alma Llena")
      .trim();
  };

  /* 2. Filtrar solo las características con valores reales/verdaderos */
  const caracteristicasValidas = Object.entries(caracteristicas || {}).filter(
    ([_, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'boolean') return value === true; // Oculta si es false
      if (typeof value === 'number') return value > 0;
      return true;
    }
  );

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
              // Mapeo o fallback elegante
              const meta = ICONOS_CARACTERISTICAS[key] || {
                label: formatCamelCase(key),
                icon: '✔',
              };

              // Formatear cómo se muestra el valor según su tipo
              let valorFormateado = '';
              if (typeof value === 'number' || typeof value === 'string') {
                // Si el label ya contiene la descripción no repetimos, sino agregamos el valor
                valorFormateado = `: ${value}`;
                if (key.toLowerCase().includes('altura')) {
                  valorFormateado += ' m';
                } else if (key.toLowerCase().includes('m2')) {
                  valorFormateado += ' m²';
                }
              }

              return (
                <div key={key} className={styles.featureCard}>
                  <span className={styles.featureIcon}>{meta.icon}</span>
                  <span className={styles.featureLabel}>
                    {meta.label}
                    {typeof value !== 'boolean' && valorFormateado}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MEMORIA DESCRIPTIVA */}
      {descripcion && (
        <div className="mb-6">
          <h3 className={styles.sectionTitle}>Descripción General</h3>
          <div className={styles.descriptionText}>
            {descripcion}
          </div>
          <p className="mt-3 text-slate-500 font-bold">MS PROPIEDADES INDUSTRIALES - Matías Settecerze Col. 1219</p>
        </div>
      )}

    </div>
  );
}