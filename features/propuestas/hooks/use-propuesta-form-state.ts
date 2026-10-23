import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCatalogoPropuestas } from './use-catalogo-propuestas';
import { useRecomendacionesForm } from './use-recomendaciones-form';
import { useItemsPropuesta } from './use-items-propuesta';

export function usePropuestaFormState(initialData?: any, propuestaId?: string, defaultTipo = 'LOGISTICA_RUTAS') {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(propuestaId);
  const tipo = initialData?.tipo || defaultTipo;
  const esInversion = tipo === 'INVERSION_DESARROLLO';

  // 1. Datos Generales
  const [clienteNombre, setClienteNombre] = useState(initialData?.clienteNombre || '');
  const [clienteEmpresa, setClienteEmpresa] = useState(initialData?.clienteEmpresa || '');
  const [slug, setSlug] = useState(initialData?.slug || '');

  // 2. Logística
  const [puntoNombre, setPuntoNombre] = useState(initialData?.puntoInteresNombre || 'CABA / Puerto Buenos Aires');
  const [puntoLat, setPuntoLat] = useState(initialData?.puntoInteresLat || -34.6172);
  const [puntoLng, setPuntoLng] = useState(initialData?.puntoInteresLng || -58.3618);

  // 3. Inversión
  const [costoObraMercado, setCostoObraMercado] = useState<number>(initialData?.payloadJson?.costoObraMercadoM2 || 400);
  const [costoObraPreferencial, setCostoObraPreferencial] = useState<number>(initialData?.payloadJson?.costoObraPreferencialM2 || 350);
  const [tieneTarifaPreferencial, setTieneTarifaPreferencial] = useState<boolean>(initialData?.payloadJson?.tieneTarifaPreferencial ?? true);

  // 4. Sub-Hooks Especializados
  const catalogo = useCatalogoPropuestas(esInversion);
  const recomendaciones = useRecomendacionesForm(initialData?.payloadJson);
  const items = useItemsPropuesta(
    initialData?.items,
    catalogo.propiedadesBD,
    catalogo.parquesBD,
    tieneTarifaPreferencial,
    costoObraPreferencial,
    costoObraMercado
  );

  // Helper para parsear de forma segura
  const parseSeguro = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const cleanStr = String(val).replace(/[^0-9.]/g, '');
  const num = Number(cleanStr);
  return isNaN(num) ? 0 : num;
};

// Helper para extraer la superficie
  const extraerSuperficieLote = (p: any): number => {
  let sup = parseSeguro(p.superficieTotal);
  if (sup === 0) sup = parseSeguro(p.superficieCubierta);
  if (sup === 0 && p.titulo) {
    const match = p.titulo.match(/(\d+)\s*m2/i);
    if (match && match[1]) sup = Number(match[1]);
  }
  return sup;
};

  const extraerMesesEntrega = (p: any, item?: any): number => {
    // 1. Si el ítem de la propuesta ya tiene un valor numérico asignado
    if (item?.mesesEntrega !== undefined && item?.mesesEntrega !== null) {
      return Number(item.mesesEntrega);
    }

    // 2. Si la propiedad base tiene mesesEntrega explícito
    if (p?.mesesEntrega !== undefined && p?.mesesEntrega !== null) {
      return Number(p.mesesEntrega);
    }

    // 3. Si es preventa y tiene fecha estimada, calculamos los meses que faltan
    const esPreventa = item?.esPreventa ?? p?.esPreventa ?? false;
    const fechaRaw = item?.fechaEstimadaEntrega || p?.fechaEstimadaEntrega;

    if (esPreventa && fechaRaw) {
      const hoy = new Date();
      const entrega = new Date(fechaRaw);
      const diffMs = entrega.getTime() - hoy.getTime();
      const diffDias = diffMs / (1000 * 3600 * 24);

      if (diffDias > 0) {
        return Math.ceil(diffDias / 30);
      }
    }

    return 0; // Si no hay datos, retornamos 0 (sin forzar 12)
  };

  
  return {
    router,
    loading,
    setLoading,
    ...catalogo,
    ...recomendaciones,
    ...items,
    isEdit,
    tipo,
    esInversion,
    clienteNombre,
    setClienteNombre,
    clienteEmpresa,
    setClienteEmpresa,
    slug,
    setSlug,
    puntoNombre,
    setPuntoNombre,
    puntoLat,
    setPuntoLat,
    puntoLng,
    setPuntoLng,
    costoObraMercado,
    setCostoObraMercado,
    costoObraPreferencial,
    setCostoObraPreferencial,
    tieneTarifaPreferencial,
    setTieneTarifaPreferencial,
    parseSeguro,
    extraerSuperficieLote,
    extraerMesesEntrega
  };
}