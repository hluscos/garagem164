export type CollectionBrand = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  introduction: string;
  detail: string;
};

export const collectionBrands: CollectionBrand[] = [
  {
    slug: "hotwheels",
    name: "Hot Wheels",
    metaTitle: "Hot Wheels Portugal: miniaturas 1:64",
    metaDescription:
      "Explora miniaturas Hot Wheels 1:64 em Portugal e acompanha anúncios colocados à venda pela comunidade Garagem164.",
    introduction:
      "Explora miniaturas Hot Wheels em Portugal num espaço pensado para colecionadores. A Garagem164 aproxima quem procura novas peças de quem quer dar uma nova garagem à sua coleção.",
    detail:
      "Nesta coleção podes seguir os anúncios de Hot Wheels disponíveis e continuar a explorar o marketplace sempre que surgirem novos modelos.",
  },
  {
    slug: "minigt",
    name: "Mini GT",
    metaTitle: "Mini GT Portugal: miniaturas 1:64",
    metaDescription:
      "Descobre miniaturas Mini GT 1:64 em Portugal e encontra anúncios de colecionadores na Garagem164.",
    introduction:
      "A coleção Mini GT reúne uma escala apreciada pelo detalhe e pelas réplicas de automóveis contemporâneos. Na Garagem164 podes acompanhar miniaturas Mini GT colocadas à venda por colecionadores em Portugal.",
    detail:
      "Visita os anúncios para encontrar modelos Mini GT disponíveis e regressa à coleção para descobrires novas entradas da comunidade.",
  },
  {
    slug: "inno64",
    name: "Inno64",
    metaTitle: "Inno64 Portugal: miniaturas 1:64",
    metaDescription:
      "Encontra miniaturas Inno64 1:64 em Portugal e acompanha anúncios de colecionadores na Garagem164.",
    introduction:
      "A coleção Inno64 é um ponto de encontro para quem procura miniaturas 1:64 com atenção ao detalhe. A Garagem164 ajuda a comunidade portuguesa a descobrir e a vender estas peças de coleção.",
    detail:
      "Explora os anúncios de Inno64 disponíveis e guarda esta coleção para acompanhares os próximos modelos publicados.",
  },
];

export function getCollectionBrand(slug: string) {
  return collectionBrands.find((brand) => brand.slug === slug);
}
