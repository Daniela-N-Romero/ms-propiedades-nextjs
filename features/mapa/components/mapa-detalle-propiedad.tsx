'use client';

import { useState } from 'react';
import MapaPropiedades from './mapa-propiedades';
import Link from 'next/link';

interface MapaDetallePropiedadProps {
    propiedad: {
        id: number;
        codigo: string;
        slug: string;
        titulo: string;
        precio: number;
        superficieTotal: number;
        superficieCubierta: number;
        moneda: string;
        latitud: number;
        longitud: number;
        direccionTexto?: string;
        zonaNombre: string;
        imagenPortada?: string;
    };
}

export default function MapaDetallePropiedad({ propiedad }: MapaDetallePropiedadProps) {
    const [copiado, setCopiado] = useState(false);

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${propiedad.latitud},${propiedad.longitud}`;

    const handleCopiarUbicacion = () => {
        const textoACopiar = propiedad.direccionTexto || `${propiedad.latitud}, ${propiedad.longitud}`;
        navigator.clipboard.writeText(textoACopiar);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold font-spartan text-slate-900">Ubicación y Entorno</h3>
                    <p className="text-slate-500 text-xs">
                        {propiedad.direccionTexto || propiedad.zonaNombre}
                    </p>
                </div>

                {/* BOTONES DE ACCIÓN */}
                    {/* Botón para explorar el mapa completo con todas las propiedades */}
                    <Link
                        href="/propiedades/mapa"
                        className="px-3.5 py-2 bg-brand-dark hover:bg-slate-800 text-white text-xs font-spartan font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                        <span>🗺️ Ver Mapa General</span>
                    </Link>

            </div>

            {/* MAPA INTERACTIVO CON CENTRO EN ESTA PROPIEDAD */}
            <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-100">
                <MapaPropiedades
                    propiedades={[propiedad]}
                    centroInicial={[propiedad.latitud, propiedad.longitud]}
                    zoomInicial={14}
                />
            </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopiarUbicacion}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                        {copiado ? '✓ Dirección Copiada' : '📋 Copiar Dirección'}
                    </button>

                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                        ↗ Abrir en Google Maps
                    </a>
                </div>
        </div>
    );
}