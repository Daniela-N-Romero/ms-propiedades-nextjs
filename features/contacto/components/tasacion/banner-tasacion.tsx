'use client'

import { styles } from "./banner-tasacion.styles";


export default function BannerTasacion() {

    const handleSolicitarTasacion = () => {

        const formElement = document.getElementById('formulario-contacto');
        
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });

            // Seleccionamos automáticamente la opción de Tasación en el select
            const selectElement = formElement.querySelector('select') as HTMLSelectElement | null;
            if (selectElement) {
                debugger
                selectElement.value = 'tasar';
                // Disparamos evento para que React reconozca el cambio
                selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                
            }
        }
    };

    return (
        <div className="mx-auto max-w-5xl text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-spartan font-bold text-white uppercase tracking-wide">
                ¿Querés vender o alquilar tu propiedad?
            </h2>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto">
                Ofrecemos tasaciones profesionales y estratégicas de propiedades industriales clave para asegurar el rendimiento de tu inversión.
            </p>
            <div className="pt-4">
                <button onClick={handleSolicitarTasacion} className={styles.ctaBtn}>
                    Solicitar Tasación Exclusiva
                </button>
            </div>
        </div>
    );
}


