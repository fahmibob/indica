import fs from 'fs';
import path from 'path';
import { PhytoRecord } from './types';

let _cache: PhytoRecord[] | null = null;

export function getAllRecords(): PhytoRecord[] {
  if (_cache) return _cache;

  // Use triplets_clean.tsv which has family field and proper species names
  // Columns: species, family, pmid, compound, compound_id, gene, gene_id, disease, disease_id, np_gene_rel, gene_disease_rel
  const filePath = path.join(process.cwd(), 'public/data/triplets_clean.tsv');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.trim().split('\n');

  const toNull = (v: string) => (!v || v.trim() === 'NA' || v.trim() === '' ? null : v.trim());

  _cache = lines.slice(1).map((line) => {
    const cols = line.split('\t');
    return {
      species:       toNull(cols[0]) ?? '',
      family:        toNull(cols[1]),
      pmid:          toNull(cols[2]) ?? '',
      compound:      toNull(cols[3]),
      // cols[4] = compound_id (skip)
      gene:          toNull(cols[5]),
      // cols[6] = gene_id (skip)
      disease:       toNull(cols[7]),
      // cols[8] = disease_id (skip)
      npGeneRel:     toNull(cols[9]),
      geneDiseaseRel: toNull(cols[10]),
    };
  });

  return _cache;
}

export function getStats() {
  const records = getAllRecords();
  return {
    totalRecords: records.length,
    uniqueSpecies: new Set(records.map((r) => r.species)).size,
    uniqueFamilies: new Set(records.filter((r) => r.family).map((r) => r.family)).size,
    uniqueGenes: new Set(records.filter((r) => r.gene).map((r) => r.gene)).size,
    uniqueDiseases: new Set(records.filter((r) => r.disease).map((r) => r.disease)).size,
    uniquePMIDs: new Set(records.map((r) => r.pmid)).size,
    uniqueCompounds: new Set(records.filter((r) => r.compound).map((r) => r.compound)).size,
  };
}
