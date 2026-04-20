import { getAllRecords } from './data';
import { PhytoRecord, SearchParams, SearchResult } from './types';

/** Normalize search terms: lowercase + replace underscores with spaces */
function norm(s: string) {
  return s.toLowerCase().replace(/_/g, ' ').trim();
}

export function search(params: SearchParams): SearchResult {
  let records = getAllRecords();

  if (params.query) {
    const q = norm(params.query);
    records = records.filter((r) =>
      [r.species, r.family, r.pmid, r.compound, r.gene, r.disease, r.speciesSynonyms]
        .some((v) => v && norm(String(v)).includes(q))
    );
  }

  const filters: Array<(r: PhytoRecord) => boolean> = [];

  if (params.species) {
    const s = norm(params.species);
    filters.push((r) =>
      norm(r.species).includes(s) ||
      (!!r.speciesSynonyms && norm(r.speciesSynonyms).includes(s))
    );
  }
  if (params.synonym) {
    const s = norm(params.synonym);
    filters.push((r) => !!r.speciesSynonyms && norm(r.speciesSynonyms).includes(s));
  }
  if (params.family) {
    const f = norm(params.family);
    filters.push((r) => !!r.family && norm(r.family).includes(f));
  }
  if (params.gene) {
    const g = norm(params.gene);
    filters.push((r) => !!r.gene && norm(r.gene).includes(g));
  }
  if (params.disease) {
    const d = norm(params.disease);
    filters.push((r) => !!r.disease && norm(r.disease).includes(d));
  }
  if (params.compound) {
    const c = norm(params.compound);
    filters.push((r) => !!r.compound && norm(r.compound).includes(c));
  }
  if (params.pmid) {
    filters.push((r) => r.pmid === params.pmid);
  }

  if (filters.length > 0) {
    records =
      params.logic === 'OR'
        ? records.filter((r) => filters.some((f) => f(r)))
        : records.filter((r) => filters.every((f) => f(r)));
  }

  if (params.sortBy) {
    const key = params.sortBy;
    const dir = params.sortOrder === 'desc' ? -1 : 1;
    records = [...records].sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }

  const countBy = (field: keyof PhytoRecord) => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const v = r[field];
      if (v) map[String(v)] = (map[String(v)] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  };

  const facets = {
    topSpecies: countBy('species'),
    topGenes: countBy('gene'),
    topDiseases: countBy('disease'),
    topFamilies: countBy('family'),
  };

  const total = records.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const paginated = records.slice((page - 1) * pageSize, page * pageSize);

  return { records: paginated, total, page, pageSize, facets };
}
