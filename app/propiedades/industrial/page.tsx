import { renderPageByPropertyType } from '..';
import ResultsView from '@/features/filtrado/components/results-view';
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IndustrialPage({ searchParams }: PageProps) {
  
  const params = await searchParams;
  const [propiedades, localidades, subtipos ] = await renderPageByPropertyType({
      searchParams: params,
      mercadoSlug: 'industrial'
  }); 

  return <ResultsView 
      propiedades={propiedades as any} 
      localidades={localidades} 
      subtipos={subtipos} 
    />
}