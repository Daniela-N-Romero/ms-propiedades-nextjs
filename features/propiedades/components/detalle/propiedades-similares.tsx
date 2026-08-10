import { PropertyCard } from '@/features/propiedades';

interface PropiedadesSimilaresProps {
  propiedades: any[];
}

export function PropiedadesSimilares({ propiedades }: PropiedadesSimilaresProps) {
  if (!propiedades || propiedades.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-spartan font-bold text-slate-900 uppercase tracking-wider">
            🏢 Propiedades Similares
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Opciones recomendadas con características o ubicación semejantes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {propiedades.map((prop) => (
          <PropertyCard key={prop.id} propiedad={prop} />
        ))}
      </div>
    </section>
  );
}