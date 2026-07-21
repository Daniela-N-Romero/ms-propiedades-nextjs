import { notFound } from 'next/navigation';
import { getPropiedadBySlug } from '@/backend/services/property.service';
import { buildPropertyMetadata } from '@/backend/services/seo.service';
import { PropertyFullData } from '@/types/propiedad';
import { GaleriaHero, FichaTecnica, ContactoCard } from '@/features/propiedades/index';

interface PageProps {
  params: Promise<{ slug: string }>;
}


// 1. METADATA (Llama al helper externo)
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const propiedad = (await getPropiedadBySlug(slug)) as PropertyFullData | null;
  return buildPropertyMetadata(propiedad);
}

// 2. VISTA (Solo renderizado)
export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const propiedadRaw = await getPropiedadBySlug(slug);

  if (!propiedadRaw) {
    notFound();
  }

  const propiedad = propiedadRaw as unknown as PropertyFullData;

  return (
    <main className="min-h-screen bg-white pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* BLOQUE HERO & GALERÍA */}
        <GaleriaHero
          titulo={propiedad.titulo}
          codigo={propiedad.codigo}
          categoria={propiedad.categoria}
          zonaNombre={propiedad.zona.nombre}
          padreZonaNombre={propiedad.zona.padre?.nombre}
          imagenes={propiedad.imagenes as any}
        />

        {/* LAYOUT PRINCIPAL (A futuro tendrá 2 columnas: Ficha a la izquierda + Contacto Sticky a la derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

          {/* COLUMNA IZQUIERDA (2 Columnas) */}
          <div className="lg:col-span-2">
            <FichaTecnica
              precio={propiedad.precio}
              moneda={propiedad.moneda}
              superficieTotal={propiedad.superficieTotal}
              superficieCubierta={propiedad.superficieCubierta}
              descripcion={propiedad.descripcion}
              caracteristicas={propiedad.caracteristicas as any}
              subtipoNombre={propiedad.tipoInmueble?.nombre}
            />
          </div>

          {/* COLUMNA DERECHA (Contacto Sticky & Agente) */}
          <div className="lg:col-span-1">
            <ContactoCard 
              codigo={propiedad.codigo}
              titulo={propiedad.titulo}
              precio={propiedad.precio}
              moneda={propiedad.moneda}
              pdfUrl={propiedad.pdfUrl}
              agente={propiedad.agente}
            />
          </div>

        </div>
      </div>
    </main>
  );
}