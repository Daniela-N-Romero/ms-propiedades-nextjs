"use client";

import { useEffect, useState } from "react";
import { GoogleTagManager } from "@next/third-parties/google";

export default function GTMClient() {
  const [shouldLoadGTM, setShouldLoadGTM] = useState<boolean | null>(null);

  useEffect(() => {
    // Al ejecutarse en el cliente, verificamos de forma real si existe la cookie de admin
    const cookies = document.cookie.split("; ");
    const hasAdminToken = cookies.some((item) => item.startsWith("admin_token="));

    // Si tiene la cookie 'admin_token', bloqueamos GTM (false). Si no, lo cargamos (true).
    setShouldLoadGTM(!hasAdminToken);
  }, []);

  // Mientras se comprueba en el cliente, no renderizamos nada
  if (shouldLoadGTM === null || !shouldLoadGTM) {
    return null;
  }

  return <GoogleTagManager gtmId="GTM-WMWNMF5F" />;
}