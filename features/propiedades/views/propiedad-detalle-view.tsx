import React from 'react';
import { PropertyFullData } from '@/types/server-data';
import { GaleriaHero, FichaTecnica } from '@/features/propiedades/index';
import ContactoSection from '@/features/propiedades/components/detalle/contacto-section';
import MapaDetallePropiedad from '@/features/mapa/components/mapa-detalle-propiedad';
import { VideoSeccion } from '@/features/propiedades/components/detalle/video-section';
import { PropiedadesSimilares } from '@/features/propiedades/components/detalle/propiedades-similares';
import { RegistrarPropiedadId } from '@/app/(publico)/propiedades/[slug]/hooks/registrar-id';
import { RegistrarGTMEvent } from '@/app/(publico)/propiedades/[slug]/hooks/registrar-GTM-event';

interface PropiedadDetalleViewProps {
  propiedad: PropertyFullData;
  similares: PropertyFullData[];
  isAdmin?: boolean;
}

export function PropiedadDetalleView({ propiedad, similares }: PropiedadDetalleViewProps) {
  return (
    <main className="min-h-screen bg-white pb-24 md:pb-12">
      {/* Trackers de Sesión y Analítica */}
      <RegistrarPropiedadId id={propiedad.id} />
      <RegistrarGTMEvent propiedad={propiedad} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Nivel 1: Galería y Encabezado Hero */}
        <GaleriaHero
          titulo={propiedad.titulo}
          codigo={propiedad.codigo}
          categoria={propiedad.categoria}
          zonaNombre={propiedad.zona.nombre}
          padreZonaNombre={propiedad.zona.padre?.nombre}
          imagenes={propiedad.imagenes as any}
          pdfUrl={propiedad.pdfUrl}
          propiedadId={propiedad.id}
          propiedadStatus={propiedad.status}
          videoUrl={propiedad.videoUrl}
        />

        {/* Layout Principal: Ficha Técnica + Formulario Lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            <FichaTecnica
              precio={propiedad.precio}
              moneda={propiedad.moneda}
              financiacion={propiedad.financiacion}
              superficieTotal={propiedad.superficieTotal}
              superficieCubierta={propiedad.superficieCubierta}
              descripcion={propiedad.descripcion}
              caracteristicas={propiedad.caracteristicas as any}
              subtipoNombre={propiedad.tipoInmueble?.nombre}
            />

            {propiedad.videoUrl && (
              <div id="seccion-video" className="scroll-mt-24">
                <VideoSeccion videoUrl={propiedad.videoUrl} />
              </div>
            )}

            {propiedad.latitud && propiedad.longitud && (
              <MapaDetallePropiedad
                propiedad={{
                  id: propiedad.id,
                  codigo: propiedad.codigo,
                  slug: propiedad.slug,
                  titulo: propiedad.titulo,
                  precio: propiedad.precio,
                  superficieCubierta: propiedad.superficieCubierta,
                  superficieTotal: propiedad.superficieTotal,
                  moneda: propiedad.moneda,
                  latitud: Number(propiedad.latitud),
                  longitud: Number(propiedad.longitud),
                  zonaNombre: propiedad.zona.nombre,
                  direccionTexto: propiedad.direccionPersonalizada,
                  imagenPortada: propiedad.imagenes?.[0]?.url,
                  tipoInmueble: propiedad.tipoInmueble?.padre?.slug || ''
                }}
              />
            )}
          </div>

          {/* Columna Lateral Sticky */}
          <div className="lg:col-span-1">
            <div id="formulario-contacto" className="scroll-mt-24">
              <ContactoSection
                codigo={propiedad.codigo}
                titulo={propiedad.titulo}
                precio={propiedad.precio}
                moneda={propiedad.moneda}
                pdfUrl={propiedad.pdfUrl}
                agente={propiedad.agente}
                slug={propiedad.slug}
                propiedadId={propiedad.id}
              />
            </div>
          </div>
        </div>

        {/* Módulo Inferior: Inmuebles Similares */}
        {similares.length > 0 && (
          <div className="mt-12">
            <PropiedadesSimilares propiedades={similares} />
          </div>
        )}
      </div>
    </main>
  );
}