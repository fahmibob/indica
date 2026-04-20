'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatSpeciesName } from '@/lib/format';
import { ChevronRight, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface FacetItem { name: string; count: number }

interface Props {
  topSpecies:  FacetItem[];
  topGenes:    FacetItem[];
  topDiseases: FacetItem[];
  topFamilies: FacetItem[];
}

function useAddFilter() {
  const router = useRouter();
  const sp     = useSearchParams();
  return (field: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    next.set(field, value);
    next.set('page', '1');
    router.push(`/search?${next.toString()}`);
  };
}

// 5 items × ~30px each ≈ 150px
const LIST_MAX_H = '150px';

function FacetGroup({
  title, items, field, colorVar, italic,
}: {
  title: string;
  items: FacetItem[];
  field: string;
  colorVar: string;
  italic?: boolean;
}) {
  const sp        = useSearchParams();
  const addFilter = useAddFilter();
  const active    = sp.get(field);

  const [q, setQ]           = useState('');
  const [acItems, setAcItems] = useState<string[]>([]);
  const timer                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = (raw: string) =>
    field === 'species' ? formatSpeciesName(raw) : raw;

  // Fetch autocomplete when user types
  useEffect(() => {
    if (!q.trim()) { setAcItems([]); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/autocomplete?field=${field}&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setAcItems(data.suggestions ?? []);
      } catch { /* ignore */ }
    }, 200);
  }, [q, field]);

  // What to show in the list
  const listItems: Array<{ name: string; count?: number }> =
    q.trim()
      ? acItems.map((s) => ({ name: s }))
      : items.map((i) => ({ name: i.name, count: i.count }));

  if (!items.length) return null;

  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1" style={{ color: colorVar }}>
        {title}
      </div>

      {/* Search input */}
      <div className="relative mb-1.5">
        <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
          className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 bg-gray-50"
          style={{ '--tw-ring-color': colorVar } as React.CSSProperties}
        />
      </div>

      {/* List — max 3 visible, scroll for more */}
      {listItems.length > 0 && (
        <ul className="overflow-y-auto space-y-0.5" style={{ maxHeight: LIST_MAX_H }}>
          {listItems.map((item) => {
            const isActive = active === item.name;
            return (
              <li key={item.name}>
                <button
                  onClick={() => { addFilter(field, item.name); setQ(''); }}
                  className={`w-full flex justify-between items-center text-left text-xs px-2 py-1.5 rounded-lg transition-all ${
                    isActive ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: colorVar } : {}}
                  title={`Filter by ${title}: ${displayName(item.name)}`}
                >
                  <span
                    className={`truncate flex-1 ${italic ? 'italic' : ''}`}
                    style={isActive ? {} : { color: colorVar }}
                  >
                    {displayName(item.name)}
                  </span>
                  {item.count != null && (
                    <span className={`ml-1.5 shrink-0 text-[9px] rounded-full px-1.5 py-0.5 font-medium ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {q.trim() && listItems.length === 0 && (
        <p className="text-[10px] text-gray-400 px-2 py-1">No matches</p>
      )}
    </div>
  );
}

export default function FacetSidebar({ topSpecies, topGenes, topDiseases, topFamilies }: Props) {
  const router = useRouter();
  const sp     = useSearchParams();
  const hasFilters = ['species', 'gene', 'disease', 'family', 'compound'].some((f) => sp.get(f));

  return (
    <aside className="w-52 xl:w-60 shrink-0 hidden md:block">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-[4.5rem]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Refine Results
          </h2>
          {hasFilters && (
            <button
              onClick={() => router.push('/search')}
              className="text-[10px] text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <FacetGroup title="Family"         items={topFamilies} field="family"  colorVar="var(--color-family)"   />
        <FacetGroup title="Species"        items={topSpecies}  field="species" colorVar="var(--color-species)"  italic />
        <FacetGroup title="Gene / Protein" items={topGenes}    field="gene"    colorVar="var(--color-gene)"     />
        <FacetGroup title="Disease"        items={topDiseases} field="disease" colorVar="var(--color-disease)"  />

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-1.5 text-[10px] text-gray-400">
          <ChevronRight size={10} className="mt-0.5 shrink-0" />
          <span>Clicking a value <strong>adds</strong> it as an active filter</span>
        </div>
      </div>
    </aside>
  );
}
