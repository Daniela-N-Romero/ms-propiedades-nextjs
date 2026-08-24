"use client";

import { useEffect, useState } from "react";
import { GoogleTagManager } from "@next/third-parties/google";

interface GTMProviderProps {
  isAdmin: boolean;
}

export default function GTMProvider({ isAdmin }: GTMProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si aún no se monta en el cliente o si es Admin, NO renderiza absolutamente nada
  if (!mounted || isAdmin) return null;

  return <GoogleTagManager gtmId="GTM-WMWNMF5F" />;
}