//ejemplo de componente contenedor que envuelve a otro componente, para poder agregarle lógica 

'use client'; // Si necesita interactividad
import { Propiedad } from '@prisma-client';
import PropertyView from './property-view';

export default function PropertyCard({ propiedad }: { propiedad: Propiedad }) {
  // Acá podés meter lógica en el futuro: tracking de clicks, estados locales, etc.
  return <PropertyView propiedad={propiedad} />;
}