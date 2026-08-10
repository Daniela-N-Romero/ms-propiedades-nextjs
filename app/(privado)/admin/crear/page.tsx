
import { getFormData } from '@/backend/services/property.service';
import PropertyForm from '@/features/admin/form/property-form';
import { Suspense } from 'react';


export default async function CrearPropiedadPage() {

  const { propiedad, mercados, subtipos, zonasPadre, localidades, agentes, propietarios, colegas} = await getFormData();
  
  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <Suspense>
      <PropertyForm
        initialData={propiedad} 
        mercados={mercados} 
        subtiposIniciales ={subtipos}
        zonasPadre ={zonasPadre}
        localidadesIniciales ={localidades}
        agentes ={agentes}
        propietarios ={propietarios}
        colegas ={colegas}              
        />
        </Suspense>
    </div>
  );
}
