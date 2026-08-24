"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminConfig } from "@/providers/config-provider"

interface AdminBannerProps {
    isAdmin: boolean;
}

export default function AdminBanner({ isAdmin }: AdminBannerProps) {
    const pathname = usePathname();

    const { propiedadId } = useAdminConfig(); // Leemos el ID seguro en memoria

    if (!isAdmin) return null;

    const esPaginaPropiedad = pathname.includes("/propiedades/");

    // BANNER DE EDICIÓN: Si estamos en una propiedad y el ID ya fue registrado internamente
    if (esPaginaPropiedad && propiedadId) {
        return (
            <div className="bg-amber-300/90 text-center px-3 py-3 font-bold sticky top-0 z-1000 shadow-lg flex flex-col sm:flex-row justify-between text-xs items-center gap-2">
                <span>Modo Vista Previa: Sesión de Administrador activa.</span>
                <span>
                    <Link
                        href={`/admin/${propiedadId}/editar/`}
                        className="bg-blue-500 text-white px-3 py-1 rounded-sm font-bold transition-all shadow-md hover:bg-blue-800"
                    >
                        ✏️ Editar esta propiedad
                    </Link>
                </span>
            </div>
        );
    }

    // BANNER GENERAL: Para el resto de las páginas públicas del sitio
    return (
        <div className="bg-amber-300/90 text-center px-3 py-3 font-bold sticky top-0 z-1000 shadow-lg flex flex-col sm:flex-row justify-between text-xs items-center gap-2">
            <span>Modo Vista Previa: Sesión de Administrador activa</span>
            <span>
                <Link href="/admin"
                    className="bg-blue-500 text-white px-3 py-1 rounded-sm font-bold transition-all shadow-md hover:bg-blue-800">
                    💻 Ir a panel de administración
                </Link>
            </span>
        </div>
    );

}