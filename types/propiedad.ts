import { Agente, Imagen, Propiedad, TipoInmueble, Zona } from "@prisma-client";

export type PropertyFullData = Omit<
  Propiedad, 
  'precio' | 'superficieTotal' | 'superficieCubierta' | 'latitud' | 'longitud' //Tomamos todo el modelo Propiedad, pero reemplazamos la firma de esos campos numéricos por number
> & {
  precio: number;
  superficieTotal: number | null;
  superficieCubierta: number | null;
  latitud: number | null;
  longitud: number | null;
  zona: Zona & { padre?: Zona | null };  // agregamos las relaciones extendidas
  tipoInmueble: TipoInmueble & { padre?: TipoInmueble | null };
  imagenes: Imagen[];
  agente: Agente;
};

// Extendemos el tipo Propiedad para asegurar que venga con la Zona incluida
export type PropertyWithZona = Propiedad & {
  zona: Zona;
  tipoInmueble: TipoInmueble
};


// Extendemos el tipo Propiedad para asegurar que venga con la Zona y el Tipo de inmueble incluidos
export type PropertyWithZonaAndType = Propiedad & {
  zona: Zona;
  tipoInmueble: TipoInmueble
};

