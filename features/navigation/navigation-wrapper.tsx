"use client";
//features\navigation\navigation-wrapper.tsx
import { usePathname } from "next/navigation";
import { Header, Footer } from "@/features/navigation";

const RUTAS_SIN_HEADER = ["/propuestas/"];
const RUTAS_SIN_FOOTER = ["/propuestas/", "/propiedades/mapa"];

interface NavigationWrapperProps {
  isAdmin: boolean;
  configuracion?: any;
  children: React.ReactNode;
}

export default function NavigationWrapper({ isAdmin, children }: NavigationWrapperProps) {
  const pathname = usePathname();
  const ocultarHeader = RUTAS_SIN_HEADER.some((ruta) => pathname.startsWith(ruta));
  const ocultarFooter = RUTAS_SIN_FOOTER.some((ruta) => pathname.startsWith(ruta));

  return (
    <>
      {!ocultarHeader && <Header isAdmin={isAdmin} />}
      <main className="grow bg-slate-50">{children}</main>
      {!ocultarFooter && <Footer />}
    </>
  );
}