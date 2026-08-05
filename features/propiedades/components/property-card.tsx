// features/propiedades/components/property-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { styles } from './property-card.styles';
import { formatPrecio } from '@/lib/utils-formatting';
import { PropertyFullData } from '@/types/server-data';


interface PropertyCardProps {
  propiedad: PropertyFullData;
}

export default function PropertyCard({ propiedad }: PropertyCardProps) {
  //to do: 
  // Simulación de banner destacado tipo PDF de Canva (Anticipo + Cuotas)
  // En el hito 3 esto vendrá del campo JSON 'caracteristicas'
  const tieneFinanciacion = propiedad.slug === 'lote-premium-parque-industrial-hudson-3088';
  const portadaUrl = propiedad.imagenes?.[0]?.url || '/images/placeholder.png';

  return (
    <article className={`${styles.card} relative group cursor-pointer transition-shadow hover:shadow-xl`}>
      <div className={styles.imageWrapper}>

        <span className={`${styles.badgeOperation} ${propiedad.categoria === 'venta' ? 'bg-brand-cyan text-brand-dark' : 'bg-green-600 text-white'}`}>
          {propiedad.categoria}
        </span>

        <span className={styles.badgeType}>
          {propiedad.tipoInmueble.nombre}
        </span>

        {/* To do: CAMBIAR A FOTO REAL */}
        {/* Imagen de fondo (Placeholder corporativo por ahora) */}

        <Image
          src={portadaUrl}
          alt={`Propiedad ${propiedad.titulo} en ${propiedad.zona?.nombre || ''}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* CUERPO DE TEXTO E INFORMACIÓN */}
      <div className={styles.content}>
        <div className={styles.infoGroup}>

          <span className={styles.location}>
            📍 {propiedad.zona.nombre}
          </span>

          <h3 className={styles.title}>
            <Link
              href={`/propiedades/${propiedad.slug}`}
              className="after:absolute after:inset-0 after:z-10 focus:outline-none"
            >
              {propiedad.titulo}
            </Link>
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
              {propiedad.superficieCubierta ? `${propiedad.superficieCubierta} m²` : ( propiedad.tipoInmueble.nombre.includes("Lote") ? 'No aplica' : 'Consultar' ) }
            </span>
          </div>
        </div>

        {/* ACCIÓN */}
        <span className={styles.viewBtn}>
          Ver Ficha Técnica
        </span>
      </div>
    </article>
  );
}