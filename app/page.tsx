import Link from "next/link";
import { styles } from "./home.styles";
import { HomeSearch }from '@/features/buscador';
import { getZonas, getDestacadas } from "@/backend/services/property.service";

export default async function HomePage() {
  
  // 🔌 Traemos todas las zonas y localidades de Postgres en crudo
  const zonas = await getZonas();
  const destacadas = await getDestacadas();

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. SECTION HERO (Imagen de fondo + Slogan + Buscador) */}
      <section className={styles.heroSection}>
        {/* Reemplazar src por la url de tu imagen o video de naves industriales */}
        <div className={styles.heroOverlay} />
        <div className= {styles.heroOverlayGradient}/>
      
        <div className={styles.heroContent}>
          <h1 className={styles.slogan}>
            Lotes y Naves Industriales <br />
            <span className="text-brand-orange">A la medida de tu empresa</span>
          </h1>
          
        <HomeSearch zonasDB={zonas} />
        </div>
      </section>

      {/* 2. SECCIÓN PROPIEDADES DESTACADAS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className={styles.sectionTitle}>Propiedades Destacadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Aquí irán mapeadas las <PropertyCard /> del backend */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-72 flex items-center justify-center text-slate-400">
            Próximamente: Fichas de Naves Industriales
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-72 flex items-center justify-center text-slate-400">
            Próximamente: Fichas de Naves Industriales
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-72 flex items-center justify-center text-slate-400">
            Próximamente: Fichas de Naves Industriales
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN CAPTACIÓN / TASACIONES */}
      <section className={styles.ctaSection}>
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-spartan font-bold text-white uppercase tracking-wide">
            ¿Querés vender o alquilar tu propiedad?
          </h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto">
            Ofrecemos tasaciones profesionales y estratégicas de propiedades industriales clave para asegurar el rendimiento de tu inversión.
          </p>
          <div className="pt-4">
            <a href="#contacto" className={styles.ctaBtn}>
              Solicitar Tasación Exclusiva
            </a>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN CONTACTO Y FORMULARIO (CRM READY) */}
      <section id="contacto" className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className={styles.sectionTitle}>Contactanos</h2>
        <p className="text-center text-slate-500 mt-2 mb-10">Dejanos tu consulta y un asesor industrial se comunicará a la brevedad.</p>
        
        <form className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input type="text" required autoComplete="given-name" className={styles.input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
              <input type="text" required autoComplete="family-name" className={styles.input} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" required autoComplete="email" className={styles.input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono de Contacto</label>
              <input type="tel" required autoComplete="tel" className={styles.input} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de la consulta</label>
            <select required className={styles.input}>
              <option value="vender">Quiero vender / alquilar mi propiedad</option>
              <option value="buscar_alquiler">Busco alquiler industrial</option>
              <option value="tasar">Quiero tasar mi propiedad</option>
              <option value="asesoramiento">Busco asesoramiento profesional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje o Detalles adicionales</label>
            <textarea rows={4} className={styles.input} placeholder="Contanos qué tipo de nave o lote estás buscando o las características de tu inmueble..."></textarea>
          </div>

          <button type="submit" className={styles.submitFormBtn}>
            Enviar Mensaje
          </button>
        </form>
      </section>
    </div>
  );
}