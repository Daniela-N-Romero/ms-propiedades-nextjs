import type { Metadata } from 'next';
import { formatPrecio } from '@/lib/utils';
import type { PropertyFullData } from '@/types/propiedad'; // O donde tengas el tipo

export function buildPropertyMetadata(propiedad: PropertyFullData | null): Metadata {
  if (!propiedad) {
    return {
      title: 'Propiedad no encontrada | MS Propiedades',
    };
  }

  const mainImage = propiedad.imagenes.length > 0 
    ? propiedad.imagenes[0].url 
    : 'https://mspropiedades.com/images/ms-blue-logo.svg';

  const precioFormateado = formatPrecio(propiedad.precio, propiedad.moneda);
  const tituloSEO = `${propiedad.titulo} - ${precioFormateado} | MS Propiedades`;
  const descripcionSEO = `${propiedad.tipoInmueble?.nombre || 'Inmueble'} en ${propiedad.categoria} ubicado en ${propiedad.zona.nombre}. REF: ${propiedad.codigo}. ${propiedad.descripcion?.slice(0, 150) || ''}...`;

  return {
    title: tituloSEO,
    description: descripcionSEO,
    openGraph: {
      title: `${propiedad.titulo} (${precioFormateado})`,
      description: `REF: ${propiedad.codigo} — ${propiedad.tipoInmueble?.nombre} en ${propiedad.zona.nombre}.`,
      url: `https://mspropiedades.com/propiedades/${propiedad.slug}`,
      siteName: 'MS Propiedades',
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: propiedad.titulo,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: tituloSEO,
      description: descripcionSEO,
      images: [mainImage],
    },
  };
}