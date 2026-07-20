import { renderPageByPropertyType } from '..';
import ResultsView from '../components/results-view';
import { TipoPropiedadEnum } from "@/prisma/generated/enums";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IndustrialPage({ searchParams }: PageProps) {
  
  const params = await searchParams;
  const [propiedades, localidades, subtipos ] = await renderPageByPropertyType({
      searchParams: params,
      tipoPropiedad: TipoPropiedadEnum.industrial
  }); 

  return <ResultsView 
      propiedades={propiedades as any} 
      localidades={localidades} 
      subtipos={subtipos} 
    />
}