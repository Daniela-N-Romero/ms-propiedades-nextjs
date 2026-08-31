"use client";
import { useEffect } from "react";
import { PropertyFullData } from '@/types/server-data';
import { trackViewProperty } from "@/lib/analytics";

export function RegistrarGTMEvent({propiedad }: { propiedad: PropertyFullData }) {
    useEffect(() => {
      trackViewProperty(propiedad);
      }, [propiedad]);
    
      return null;
}

