interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropiedadDetallePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Detalle de la Propiedad: {id}</h1>

    </div>
  );
}

export {}; 
