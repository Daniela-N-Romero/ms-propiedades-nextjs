import { orderValueSettings } from '@/features/filtrado/index';

export default function OrdenarSelect() {

 const { currentOrder, handleChange} = orderValueSettings();  

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-500 font-medium">Ordenar por:</span>
      <select 
        value={currentOrder}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-dark"
      >
        <option value="">Relevancia</option>
        <option value="precio_asc">Precio: Menor a Mayor</option>
        <option value="precio_desc">Precio: Mayor a Menor</option>
        <option value="sup_asc">Superficie: Menor a Mayor</option>
        <option value="sup_desc">Superficie: Mayor a Menor</option>
      </select>
    </div>
  );
}