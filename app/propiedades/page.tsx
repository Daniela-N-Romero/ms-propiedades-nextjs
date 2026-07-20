interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SearchResults({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Resultados de busqueda</h1>

    </div>
  );
}

export {}; 
