import { styles } from "./home.styles";
import { HomeSearch } from '@/features/buscador';
import { getDestacadas, getSubtiposPorTipoMercado } from "@/backend/services/property.service";
import { getZonasActivas } from '@/backend/services/zone.service'
import { PropertyCard } from "@/features/propiedades";
import { ContactoFormGeneral } from "@/features/contacto";
import BannerTasacion from "@/features/contacto/components/tasacion/banner-tasacion";

export default async function HomePage() {

  // 🔌 Traemos todas las zonas y localidades de Postgres en crudo
  const zonas = await getZonasActivas();
  const destacadas = await getDestacadas();
  const subtiposIndustrial = await getSubtiposPorTipoMercado("industrial");

  return (
    <div className="space-y-20 pb-20">

      {/* 1. SECTION HERO (Imagen de fondo + Slogan + Buscador) */}
      <section className={styles.heroSection}>
        {/* Reemplazar src por la url de tu imagen o video de naves industriales */}
        <div className={styles.heroOverlay} />
        <div className={styles.heroOverlayGradient} />

        <div className={styles.heroContent}>
          <h1 className={styles.slogan}>
            Lotes y Naves Industriales <br />
            <span className="text-brand-orange">A la medida de tu empresa</span>
          </h1>

          <HomeSearch zonasDB={zonas} subtipos={subtiposIndustrial} />
        </div>
      </section>

      {/* 2. SECCIÓN PROPIEDADES DESTACADAS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className={styles.sectionTitle}>Propiedades Destacadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {destacadas.map((propiedad) => (
            <PropertyCard key={propiedad.id} propiedad={propiedad as any} />
          ))}
          {destacadas.length === 0 && (
            <p className="text-center text-slate-400 col-span-3 py-10">No hay propiedades destacadas en este momento.</p>
          )}
        </div>
      </section>

      {/* 3. SECCIÓN CAPTACIÓN / TASACIONES */}
      <section className={styles.ctaSection}>
        <BannerTasacion />
      </section>

      {/* 4. SECCIÓN CONTACTO Y FORMULARIO (CRM READY) */}
      <section id="contacto" className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className={styles.sectionTitle}>Contactanos</h2>
        <p className="text-center text-slate-500 mt-2 mb-10">Dejanos tu consulta y un asesor industrial se comunicará a la brevedad.</p>

        <ContactoFormGeneral />

      </section>
    </div>
  );
}