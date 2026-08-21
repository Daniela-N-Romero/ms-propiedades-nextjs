export default function PropertyDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* HEADER DE BREADCRUMBS Y TÍTULO */}
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded-md w-1/4" />
        <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
      </div>

      {/* GRILLA DE GALERÍA Y DETALLES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: GALERÍA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-slate-200 rounded-2xl w-full" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-xl" />
            ))}
          </div>
          {/* DESCRIPCIÓN */}
          <div className="space-y-2 pt-6">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        </div>

        {/* COLUMNA DERECHA: FICHA LATERAL Y CONTACTO */}
        <div className="space-y-4">
          <div className="p-6 bg-slate-100 rounded-2xl space-y-4 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-10 bg-slate-200 rounded-xl w-full" />
            <div className="h-12 bg-slate-200 rounded-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}