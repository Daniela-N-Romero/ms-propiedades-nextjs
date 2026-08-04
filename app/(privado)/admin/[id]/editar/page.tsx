import { notFound } from 'next/navigation';
import PropertyForm from '@/features/admin/form/property-form';
import { getFormData } from '@/backend/services/property.service';

interface EditarPropiedadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPropiedadPage({ params }: EditarPropiedadPageProps) {
  const { id } = await params;
  const propertyId = parseInt(id, 10);

  if (isNaN(propertyId)) {
    notFound();
  }

  const { propiedad, mercados, subtipos, zonasPadre, localidades, agentes, propietarios, colegas } =
    await getFormData(propertyId);

  if (!propiedad) {
    notFound();
  }

  return (
    <div className="py-8 bg-slate-100 min-h-screen">
      <PropertyForm
        initialData={propiedad}
        mercados={mercados}
        subtiposIniciales={subtipos}
        zonasPadre={zonasPadre}
        localidadesIniciales={localidades}
        agentes={agentes}
        propietarios={propietarios}
        colegas={colegas}
      />
    </div>
  );
}