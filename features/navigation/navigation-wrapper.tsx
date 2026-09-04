"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/features/navigation";

const RUTAS_SIN_HEADER = ["/propuestas/"];

interface NavigationWrapperProps {
  isAdmin: boolean;
  configuracion?: any;
  children: React.ReactNode;
}

export default function NavigationWrapper({ isAdmin, children }: NavigationWrapperProps) {
  const pathname = usePathname();
  const ocultarHeaderFooter = RUTAS_SIN_HEADER.some((ruta) => pathname.startsWith(ruta));

  return (
    <>
      {!ocultarHeaderFooter && <Header isAdmin={isAdmin} />}
      <main className="grow bg-slate-50">{children}</main>
      {!ocultarHeaderFooter && <Footer />}
    </>
  );
}