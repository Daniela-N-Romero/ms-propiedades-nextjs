import { EstadoPropiedadEnum } from '@/prisma/generated/enums';

interface EstadoBadgeProps {
  status?: EstadoPropiedadEnum | string;
  className?: string;
}

export function EstadoBadge({ status, className = '' }: EstadoBadgeProps) {
  // Si está disponible o no hay status, no muestra ningún banner
  if (!status || status === EstadoPropiedadEnum.disponible || status === 'disponible') {
    return null;
  }

  const isReservada = status === EstadoPropiedadEnum.reservada || status === 'reservada';
  
  const label = isReservada ? 'RESERVADA' : status.toUpperCase();

  // Colores según el estado
  const colorStyles = isReservada
    ? 'bg-amber-600 text-white shadow-amber-900/20'
    : 'bg-red-600 text-white shadow-red-900/20';

  return (
    <div className={`absolute top-0 left-0 w-32 h-32 overflow-hidden z-20 pointer-events-none ${className}`}>
      <div
        className={`absolute top-6 -left-10 w-40 py-1.5 text-center font-spartan font-black text-[11px] tracking-widest uppercase shadow-md transform -rotate-45 border-y border-white/20 ${colorStyles}`}
      >
        {label}
      </div>
    </div>
  );
}