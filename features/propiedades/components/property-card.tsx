// features/propiedades/components/property-card.tsx
import Link from 'next/link';
import type { Propiedad, TipoInmueble, Zona } from '@prisma-client';
import { styles } from './property-card.styles';
import { formatPrecio } from '@/lib/utils'

// Extendemos el tipo Propiedad para asegurar que venga con la Zona incluida
type PropertyWithZonaAndType = Propiedad & {
  zona: Zona;
  tipo: TipoInmueble
};

interface PropertyCardProps {
  propiedad: PropertyWithZonaAndType;
}

export default function PropertyCard({ propiedad }: PropertyCardProps) {

  // Simulación de banner destacado tipo tu PDF de Canva (Anticipo + Cuotas)
  // En el hito 3 esto vendrá del campo JSON 'caracteristicas'
  const tieneFinanciacion = propiedad.slug === 'lote-premium-parque-industrial-hudson-3088';

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>

        <span className={`${styles.badgeOperation} ${
          propiedad.categoria === 'venta' ? 'bg-brand-orange' : 'bg-brand-green'}`}>
          {propiedad.categoria}
        </span>
        
        <span className={styles.badgeType}>
          {propiedad.tipo.nombre}
        </span>

        {/* Imagen de fondo (Placeholder corporativo por ahora) */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-500" />
      </div>

      {/* CUERPO DE TEXTO E INFORMACIÓN */}
      <div className={styles.content}>
        <div className={styles.infoGroup}>

          <span className={styles.location}>
            📍 {propiedad.zona.nombre}
          </span>
          
          <h3 className={styles.title}>
            {propiedad.titulo}
          </h3>
          

          <div className="space-y-1 mt-2">
            <div className={styles.priceBlock}>
              <span>VALOR:</span>
              <span>{formatPrecio(propiedad.precio, propiedad.moneda)}</span>
            </div>
            
            {/* Si tiene financiación (Ej: Lote Hudson), clavamos el banner verde vibrante */}
            {tieneFinanciacion && (
              <div className={styles.greenBanner}>
                Anticipo USD 182.000 + 20 Cuotas
              </div>
            )}
          </div>
        </div>

        {/* DETALLES DE M2 / MEDIDAS */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <span>📐 Sup. Total:</span>
            <span className="text-slate-800 font-bold">
              {propiedad.superficieTotal ? `${propiedad.superficieTotal} m²` : 'Consultar'}
            </span>
          </div>
          <div className={styles.featureItem}>
            <span>🏢 Cubierta:</span>
            <span className="text-slate-800 font-bold">
              {propiedad.superficieCubierta ? `${propiedad.superficieCubierta} m²` : 'Consultar'}
            </span>
          </div>
        </div>

        {/* ACCIÓN */}
        <Link href={`/propiedades/${propiedad.slug}`} className={styles.viewBtn}>
          Ver Ficha Técnica
        </Link>
      </div>
    </article>
  );
}