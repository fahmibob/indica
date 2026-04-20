export interface PhytoRecord {
  species: string;
  family: string | null;
  pmid: string;
  compound: string | null;
  gene: string | null;
  disease: string | null;
  npGeneRel: string | null;
  geneDiseaseRel: string | null;
  speciesSynonyms: string | null;
}

export interface SearchParams {
  query?: string;
  species?: string;
  family?: string;
  gene?: string;
  disease?: string;
  compound?: string;
  pmid?: string;
  synonym?: string;
  logic?: 'AND' | 'OR';
  page?: number;
  pageSize?: number;
  sortBy?: keyof PhytoRecord;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  records: PhytoRecord[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    topSpecies: Array<{ name: string; count: number }>;
    topGenes: Array<{ name: string; count: number }>;
    topDiseases: Array<{ name: string; count: number }>;
    topFamilies: Array<{ name: string; count: number }>;
  };
}
