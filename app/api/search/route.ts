import { NextRequest, NextResponse } from 'next/server';
import { search } from '@/lib/search';
import { PhytoRecord } from '@/lib/types';

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const result = search({
    query:    params.q        || undefined,
    species:  params.species  || undefined,
    family:   params.family   || undefined,
    gene:     params.gene     || undefined,
    disease:  params.disease  || undefined,
    compound: params.compound || undefined,
    pmid:     params.pmid     || undefined,
    synonym:  params.synonym  || undefined,
    logic:    (params.logic as 'AND' | 'OR') || 'AND',
    page:     parseInt(params.page     || '1'),
    pageSize: parseInt(params.pageSize || '10'),
    sortBy:   (params.sortBy as keyof PhytoRecord) || undefined,
    sortOrder:(params.sortOrder as 'asc' | 'desc') || undefined,
  });
  return NextResponse.json(result);
}
