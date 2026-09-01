// @/lib/analytics.ts
import type { PropertyFullData } from '@/types/server-data';

// Tipado seguro para evitar escribir mal los nombres de las propiedades
interface PropertyTrackData {
    codigo: string;
    titulo: string;
    precio: number;
    moneda: string;
    slug: string;
}


/**
 * Registra cuando un usuario entra a ver una ficha técnica específica
 */
export const trackViewProperty = (propiedad: PropertyTrackData | PropertyFullData) => {
    if (typeof window !== 'undefined') {
        const codigo = propiedad.codigo?.trim();
        const moneda = propiedad.moneda === 'USD' ? 'USD' : 'ARS';
        const precio = Number(propiedad.precio) || 0;

        // 1. Capa para GTM / Google Analytics
        if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'view_item',
                custom_data: {
                    currency: moneda,
                    value: precio,
                    content_ids: [codigo],
                    content_type: 'product',
                    content_name: propiedad.titulo
                }
            });
        }

        // 2. Envío directo al Píxel de Meta (Evento estándar de Meta Ads)
        if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'ViewContent', {
                content_type: 'home_listing',
                content_ids: [codigo],        // Debe coincidir con 'home_listing_id' de feed de meta (ej. IND-CAN-XP)
                value: precio,
                currency: moneda,
                content_name: propiedad.titulo
         });
        }
    }
};
/**
 * Registra el clic saliente hacia el canal de WhatsApp de un agente
 */
export const trackWhatsAppClick = (propiedad: PropertyTrackData) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: 'contact',
            custom_data: {
                currency: propiedad.moneda === 'USD' ? 'USD' : 'ARS',
                value: propiedad.precio,
                content_ids: [propiedad.codigo],
                content_category: 'Propiedad Industrial',
                content_name: propiedad.titulo
            }
        });
    }
};

/**
 * Registra el clic saliente hacia el canal de WhatsApp genral desde Header / Footer
 */
export const trackWhatsAppClickGeneral = (origen: 'Header' | 'Footer' = 'Footer') => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: 'contact', // Mantiene el nombre para que GTM lo atrape
            custom_data: {
                content_category: 'WhatsApp General',
                content_name: `Clic WhatsApp desde ${origen}`
            }
        });
    }
};

/**
 * Registra cuando un usuario completa con éxito el formulario de contacto integrado
 */
export const trackFormLead = (codigo: string, titulo: string) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: 'generate_lead',
            custom_data: {
                content_category: 'Formulario Ficha Propiedad',
                content_ids: [codigo],
                content_name: titulo
            }
        });
    }
};


/**
 * Registra cuando un usuario completa con éxito el formulario de contacto integrado al HomePage
 */
export const trackFormLeadGeneral = () => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: 'generate_lead',
            custom_data: {
                content_category: 'Formulario de Contacto General',
                content_name: 'Formulario Home / Contacto General'
            }
        });
    }

};

/**
 * Registra las búsquedas y filtrados que realizan los usuarios desde el buscador principal
 */
export const trackHomeSearch = (filtros: { categoria?: string; subtipo?: string; zonaLabel?: string; localidadLabel?: string }) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: 'search',
            custom_data: {
                search_string: `Categoría: ${filtros.categoria || 'Todas'} | Subtipo: ${filtros.subtipo || 'Todos'}`,
                content_category: 'Buscador Home',
                content_ids: [filtros.zonaLabel || 'Todas', filtros.localidadLabel || 'Todas'].filter(Boolean)
            }
        });
    }
};