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

  const {
    propiedades,
    totalPropiedades,
    currentPage,
    totalPages,
    localidades,
    subtipos,
    esFallback
  } = await renderPageByPropertyType({
    searchParams: params,
    mercadoSlug: mercadoParam
  });

  return <ResultsView
    propiedades={propiedades}
    localidades={localidades}
    subtipos={subtipos}
    esFallback={esFallback}
    totalPropiedades={totalPropiedades}
    currentPage={currentPage}
    totalPages={totalPages}
  />
}