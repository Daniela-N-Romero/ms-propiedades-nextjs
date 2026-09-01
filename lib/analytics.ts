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
                    content_type: 'home_listing',
                    content_name: propiedad.titulo
                }
            });
        }

        // 2. Envío directo al Píxel de Meta
        if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'ViewContent', {
                content_type: 'home_listing',
                content_ids: [codigo],
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
    if (typeof window !== 'undefined') {
        const moneda = propiedad.moneda === 'USD' ? 'USD' : 'ARS';
        const precio = Number(propiedad.precio) || 0;

        // GTM / Google Analytics
        if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'contact',
                custom_data: {
                    currency: moneda,
                    value: precio,
                    content_ids: [propiedad.codigo],
                    content_category: 'Propiedad Industrial',
                    content_name: propiedad.titulo
                }
            });
        }

        // Envío directo a Meta Pixel
        if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'Contact', {
                currency: moneda,
                value: precio,
                content_ids: [propiedad.codigo],
                content_category: 'Propiedad Industrial',
                content_name: propiedad.titulo
            });
        }
    }
};

/**
 * Registra el clic saliente hacia el canal de WhatsApp genral desde Header / Footer
 */
export const trackWhatsAppClickGeneral = (origen: 'Header' | 'Footer' = 'Footer') => {
    if (typeof window !== 'undefined') {
        // 1. Envío al dataLayer (GTM)
        if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'contact',
                custom_data: {
                    currency: 'USD', // Agregamos la divisa requerida por Meta
                    value: 0,        // Asignamos un valor numérico (0 si no aplica)
                    content_category: 'WhatsApp General',
                    content_name: `Clic WhatsApp desde ${origen}`
                }
            });
        }

        // 2. Envío directo a Meta Pixel (opcional, si no lo manejas vía GTM)
        if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'Contact', {
                currency: 'USD',
                value: 0,
                content_category: 'WhatsApp General',
                content_name: `Clic WhatsApp desde ${origen}`
            });
        }
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
export const trackFormLead = (codigo: string, titulo: string) => {
    if (typeof window !== 'undefined') {
        if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'generate_lead',
                custom_data: {
                    currency: 'USD',
                    value: 0,
                    content_category: 'Formulario Ficha Propiedad',
                    content_ids: [codigo],
                    content_name: titulo
                }
            });
        }

        if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'Lead', {
                currency: 'USD',
                value: 0,
                content_category: 'Formulario Ficha Propiedad',
                content_ids: [codigo],
                content_name: titulo
            });
        }
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