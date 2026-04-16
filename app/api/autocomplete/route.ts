import { NextRequest, NextResponse } from 'next/server';
import { getAllRecords } from '@/lib/data';
import { PhytoRecord } from '@/lib/types';

const SUGGESTION_FIELDS: (keyof PhytoRecord)[] = ['species', 'family', 'gene', 'disease', 'compound'];

export async function GET(req: NextRequest) {
  const field = req.nextUrl.searchParams.get('field') as keyof PhytoRecord | null;
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().replace(/_/g, ' ') || '';

  if (!q) return NextResponse.json({ suggestions: [] });

  const records = getAllRecords();
  const seen = new Set<string>();
  const results: string[] = [];

  const fields = field ? [field] : SUGGESTION_FIELDS;

  for (const r of records) {
    for (const f of fields) {
      const v = r[f];
      if (v && !seen.has(String(v))) {
        const norm = String(v).toLowerCase();
        if (norm.startsWith(q) || norm.includes(q)) {
          seen.add(String(v));
          results.push(String(v));
          if (results.length >= 12) break;
        }
      }
    }
    if (results.length >= 12) break;
  }

  // Sort: starts-with first
  results.sort((a, b) => {
    const al = a.toLowerCase(), bl = b.toLowerCase();
    return (al.startsWith(q) ? 0 : 1) - (bl.startsWith(q) ? 0 : 1);
  });

  return NextResponse.json({ suggestions: results.slice(0, 8) });
}
