import { renderPageByPropertyType } from '.';
import ResultsView from '@/features/filtrado/components/results-view';
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IndustrialPage({ searchParams }: PageProps) {
  
  const params = await searchParams;

  const mercadoParam = Array.isArray(params.mercado) 
    ? params.mercado[0] 
    : params.mercado;

  const mercadoSlug = mercadoParam;
 
  const [propiedades, localidades, subtipos ] = await renderPageByPropertyType({
      searchParams: params,
      mercadoSlug: mercadoSlug
  }); 

  return <ResultsView 
      propiedades={propiedades as any} 
      localidades={localidades} 
      subtipos={subtipos} 
    />
}