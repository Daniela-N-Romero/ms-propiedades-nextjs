import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ItemForm, PropiedadSimple, TarjetaRecomendacion } from '../types/propuesta.types';

// Plantillas por defecto
const plantillasPorDefecto: TarjetaRecomendacion[] = [
  {
    id: "card-1",
    activa: true,
    titulo: "🏆 Máximo Rendimiento",
    opcionAsociadaId: "",
    texto: "Ideal para inversores enfocados en la máxima rentabilidad bruta por alquiler.",
  },
  {
    id: "card-2",
    activa: true,
    titulo: "⚖️ Eficiencia de Capital y Liquidez",
    opcionAsociadaId: "",
    texto: "El valor del anticipo evita invertir el total al inicio, optimizando tu capital y aportando mayor liquidez.",
  },
  {
    id: "card-3",
    activa: true,
    titulo: "📍 Ubicación Consolidada",
    opcionAsociadaId: "",
    texto: "Ubicaciones estratégicas sobre autopistas de rápida colocación locativa.",
  },
];

export function usePropuestaFormState(initialData?: any, propuestaId?: string, defaultTipo = 'LOGISTICA_RUTAS') {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [propiedadesBD, setPropiedadesBD] = useState<PropiedadSimple[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const isEdit = Boolean(propuestaId);
  const tipo = initialData?.tipo || defaultTipo;
  const esInversion = tipo === 'INVERSION_DESARROLLO';

  // Datos Generales
  const [clienteNombre, setClienteNombre] = useState(initialData?.clienteNombre || '');
  const [clienteEmpresa, setClienteEmpresa] = useState(initialData?.clienteEmpresa || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [parquesBD, setParquesBD] = useState<any[]>([]);

  // Logística
  const [puntoNombre, setPuntoNombre] = useState(initialData?.puntoInteresNombre || 'CABA / Puerto Buenos Aires');
  const [puntoLat, setPuntoLat] = useState(initialData?.puntoInteresLat || -34.6172);
  const [puntoLng, setPuntoLng] = useState(initialData?.puntoInteresLng || -58.3618);

  // Inversión
  const [costoObraMercado, setCostoObraMercado] = useState<number>(initialData?.payloadJson?.costoObraMercadoM2 || 400);
  const [costoObraPreferencial, setCostoObraPreferencial] = useState<number>(initialData?.payloadJson?.costoObraPreferencialM2 || 350);
  const [tieneTarifaPreferencial, setTieneTarifaPreferencial] = useState<boolean>(initialData?.payloadJson?.tieneTarifaPreferencial ?? true);

  // Recomendaciones
  const [recomMostrar, setRecomMostrar] = useState<boolean>(initialData?.payloadJson?.recomendaciones?.mostrarSeccion ?? true);
  const [recomTituloGeneral, setRecomTituloGeneral] = useState<string>(initialData?.payloadJson?.recomendaciones?.tituloGeneral ||"🎯 Conclusiones Strategicas & Recomendaciones");

  // Cargar tarjetas existentes o las plantillas iniciales
  const [tarjetasRecom, setTarjetasRecom] = useState<TarjetaRecomendacion[]>(initialData?.payloadJson?.recomendaciones?.tarjetas || plantillasPorDefecto);

  const agregarTarjetaRecom = () => {
    const nueva: TarjetaRecomendacion = {
      id: `card-${Date.now()}`,
      activa: true,
      titulo: "✨ Nueva Recomendación Personalizada",
      opcionAsociadaId: "",
      texto: "Escribe aquí la recomendación o análisis específico para esta propuesta.",
    };
    setTarjetasRecom([...tarjetasRecom, nueva]);
  };

  const eliminarTarjetaRecom = (id: string) => {
    setTarjetasRecom(tarjetasRecom.filter((t) => t.id !== id));
  };

  const actualizarTarjetaRecom = (id: string, campo: Partial<TarjetaRecomendacion>) => {
    setTarjetasRecom(
      tarjetasRecom.map((t) => (t.id === id ? { ...t, ...campo } : t))
    );
  };

const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemForm[]>(
  initialData?.items?.map((i: any, idx: number) => ({
    propiedadId: i.propiedadId,
    esPrioritaria: i.esPrioritaria || idx === 0,
    notaLogistica: i.notaLogistica || '',
    tiempoEstimado: i.tiempoEstimado || '',
    nombre: i.nombre || i.parqueIndustrialNombre || i.parqueIndustrial?.nombre || '',
    costoTierraCustom: i.costoTierraCustom || 0,
    costoObraM2: i.costoObraM2 || 350,
    supNaveProyectada: i.supNaveProyectada || 0,
    alquilerM2Estimado: i.alquilerM2Estimado || 5.0,
    anticipoCash: i.anticipoCash || 0,
    cuotasTexto: i.cuotasTexto || '',
    fosAplicado: i.fosAplicado || 0.6,
    orden: i.orden || idx + 1,
    esFinanciado: i.esFinanciado ?? true,
    porcentajeAnticipo: i.porcentajeAnticipo ?? 30,
    cantidadCuotas: i.cantidadCuotas ?? 24,
    mesesObra: i.mesesObra ?? 8,
    ofertaContadoUSD: i.ofertaContadoUSD ?? undefined,
  })) || []
);

  useEffect(() => {
    fetch('/api/properties?tab=activas&limit=1000')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.propiedades)) setPropiedadesBD(data.propiedades);
      });

      fetch('/api/parques-industriales')
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setParquesBD(data);
          });

    }, []);

const catalogoFiltrado = propiedadesBD.filter((p) => {
  // Coincidencia con la búsqueda
  const coincideBusqueda =
    p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.zona?.nombre.toLowerCase().includes(busqueda.toLowerCase());

      if (!coincideBusqueda) return false;

      // Si es propuesta de Desarrollo/ROI, mostramos EXCLUSIVAMENTE Terrenos / Lotes
      if (esInversion) {
        const esLoteOTerreno =
          p.titulo.toLowerCase().includes("lote") ||
          p.titulo.toLowerCase().includes("terreno") ||
          p.titulo.toLowerCase().includes("fraccion") ||
          p.titulo.toLowerCase().includes("parcela") ||
          (p.superficieTotal && Number(p.superficieTotal) > 0);

        return esLoteOTerreno;
      }

      return true;
    });
  
  const parseSeguro = (val: any): number => {
    if (val === null || val === undefined) return 0;
    const cleanStr = String(val).replace(/[^0-9.]/g, '');
    const num = Number(cleanStr);
    return isNaN(num) ? 0 : num;
  };

  const extraerSuperficieLote = (p: PropiedadSimple): number => {
    let sup = parseSeguro(p.superficieTotal);
    if (sup === 0) sup = parseSeguro(p.superficieCubierta);
    if (sup === 0 && p.titulo) {
      const match = p.titulo.match(/(\d+)\s*m2/i);
      if (match && match[1]) sup = Number(match[1]);
    }
    return sup;
  };

  const togglePropiedad = (prop: PropiedadSimple) => {
    const existe = itemsSeleccionados.some((i) => i.propiedadId === prop.id);
    if (existe) {
      setItemsSeleccionados(
        itemsSeleccionados
          .filter((i) => i.propiedadId !== prop.id)
          .map((it, idx) => ({ ...it, orden: idx + 1 }))
      );
    } else {
      const supLote = extraerSuperficieLote(prop);
      const precioTotal = parseSeguro(prop.precio);
      const fosBase = 0.6;
      const supNaveCalc = supLote > 0 ? Math.round(supLote * fosBase) : 0;

      // JERARQUÍA AUTOMÁTICA: Parque Industrial -> Zona / Localidad -> Título
      const nombreAuto = prop.parqueIndustrial?.nombre || prop.zona?.nombre || prop.titulo;
      const accesosAuto = prop.parqueIndustrial?.conectividad || prop.parqueIndustrial?.direccionAcceso || '';
      
      const nuevoItem: ItemForm = {
        propiedadId: prop.id,
        esPrioritaria: itemsSeleccionados.length === 0,
        notaLogistica: accesosAuto,
        tiempoEstimado: '',
        nombre: nombreAuto,
        costoTierraCustom: precioTotal,
        costoObraM2: tieneTarifaPreferencial ? costoObraPreferencial : costoObraMercado,
        supNaveProyectada: supNaveCalc,
        alquilerM2Estimado: 5.0,
        anticipoCash: Math.round(precioTotal * 0.3),
        cuotasTexto: prop.financiacion || '',
        fosAplicado: fosBase,
        orden: itemsSeleccionados.length + 1,
        esFinanciado: true,
        porcentajeAnticipo: 30,
        cantidadCuotas: 24,
        mesesObra: 8,
        ofertaContadoUSD: undefined,
        };
      setItemsSeleccionados([...itemsSeleccionados, nuevoItem]);
    }
  };
  
  const calcularMetricasItem = (item: ItemForm) => {
  const prop = propiedadesBD.find((p) => p.id === item.propiedadId);
  const supLote = prop ? extraerSuperficieLote(prop) : 0;
  const fos = item.fosAplicado || 0.6;
  
  // Superficie Nave
  const supNave = item.supNaveProyectada || (supLote > 0 ? Math.round(supLote * fos) : 0);
  
  // Costos
  const costoTierra = item.costoTierraCustom || 0;
  const tarifaObraM2 = tieneTarifaPreferencial ? costoObraPreferencial : costoObraMercado;
  const costoObraTotal = supNave * tarifaObraM2;
  const inversionTotal = costoTierra + costoObraTotal;

  // Ingresos
  const alquilerM2 = item.alquilerM2Estimado || 5.0;
  const ingresoAnualUSD = supNave * alquilerM2 * 12;

  // ROI
  const roiAnual = inversionTotal > 0 ? (ingresoAnualUSD / inversionTotal) * 100 : 0;

  return {
    supNave,
    costoObraTotal,
    inversionTotal,
    ingresoAnualUSD,
    roiAnual: Number(roiAnual.toFixed(2)),
  };
};

// Obtenemos la opción con mayor ROI en tiempo real para destacar en los selectors
const maxRoiCalculado = itemsSeleccionados.length > 0
  ? Math.max(...itemsSeleccionados.map((it) => calcularMetricasItem(it).roiAnual))
  : 0;
  
  return {
    router,
    loading,
    setLoading,
    propiedadesBD,    
    catalogoFiltrado,  
    parquesBD,
    busqueda,
    setBusqueda,
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
    recomMostrar,
    setRecomMostrar,
    recomTituloGeneral,
    setRecomTituloGeneral,
    itemsSeleccionados,
    setItemsSeleccionados,
    togglePropiedad,
    parseSeguro,
    extraerSuperficieLote,
    tarjetasRecom,
    agregarTarjetaRecom,
    eliminarTarjetaRecom,
    actualizarTarjetaRecom,
    calcularMetricasItem,
    maxRoiCalculado,
  };
}