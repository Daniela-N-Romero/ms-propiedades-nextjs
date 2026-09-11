// features/propiedades/components/property-card.tsx
import Link from 'next/link';
import { CustomImage } from '@/components/ui/custom-image';
import { styles } from './property-card.styles';
import { formatPrecio } from '@/lib/utils-formatting';
import { PropertyFullData } from '@/types/server-data';


interface PropertyCardProps {
  propiedad: PropertyFullData;
}

export default function PropertyCard({ propiedad }: PropertyCardProps) {

  const portadaUrl = propiedad.imagenes?.[0]?.url || '/images/placeholder.png';

  return (
    <article className={`${styles.card} relative group cursor-pointer transition-shadow hover:shadow-xl`}>
      <div className={styles.imageWrapper}>

        <span className={`${styles.badgeOperation} ${propiedad.categoria === 'venta' ? 'bg-gray-900/90 text-white' : 'bg-emerald-700/90 text-white'}`}>
          {propiedad.categoria}
        </span>
        {/* 
        <span className={styles.badgeType}>
          {propiedad.tipoInmueble.nombre}
        </span> */}

        {/* BADGE DESTACADA */}
        {propiedad.isDestacada && (
          <span className={`${styles.destacada}`}>
            ⭐
          </span>
        )}

        {/* 💳 BADGE FLOTANTE DE FINANCIACIÓN (SOBRE LA FOTO) */}
        {propiedad.financiacion && (
          <span className="absolute bottom-2 left-2 right-2 z-10 bg-green-600/60 backdrop-blur-xs text-white text-[11px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-md text-center truncate">
            💳 {propiedad.financiacion}
          </span>
        )}

        <CustomImage
          src={portadaUrl}
          alt={`Propiedad ${propiedad.titulo} en ${propiedad.zona?.nombre || ''}`}
          fill
          loading="eager"      
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
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
              {propiedad.superficieCubierta ? `${propiedad.superficieCubierta} m²` : (propiedad.tipoInmueble.nombre.includes("Lote") ? 'No aplica' : 'Consultar')}
            </span>
          </div>
        </div>





        {/* ACCIÓN */}
        {/* <span className={styles.viewBtn}>
          Ver Ficha Técnica
        </span> */}
      </div>
        {/* BLOQUE DE PRECIO */}
        <div className={styles.priceBlock}>
          <span>VALOR:</span>
          <span>{formatPrecio(propiedad.precio, propiedad.moneda)}</span>
        </div>


    </article>
  );
}