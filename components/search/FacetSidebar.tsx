'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatSpeciesName } from '@/lib/format';
import { ChevronRight } from 'lucide-react';

interface FacetItem { name: string; count: number }

interface Props {
  topSpecies:  FacetItem[];
  topGenes:    FacetItem[];
  topDiseases: FacetItem[];
  topFamilies: FacetItem[];
}

/** Add or replace a single field filter, keeping all other active params */
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

function FacetGroup({
  title, items, field, colorVar, italic,
}: {
  title: string;
  items: FacetItem[];
  field: string;
  colorVar: string;
  italic?: boolean;
}) {
  const sp      = useSearchParams();
  const addFilter = useAddFilter();
  const active  = sp.get(field);

  if (!items.length) return null;

  const displayName = (raw: string) =>
    field === 'species' ? formatSpeciesName(raw) : raw;

  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: colorVar }}>
        {title}
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = active === item.name;
          return (
            <li key={item.name}>
              <button
                onClick={() => addFilter(field, item.name)}
                className={`w-full flex justify-between items-center text-left text-xs px-2.5 py-1.5 rounded-lg transition-all ${
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
                <span
                  className={`ml-2 shrink-0 text-[10px] rounded-full px-1.5 py-0.5 font-medium ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
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
        <div className="flex items-center justify-between mb-4">
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

        <FacetGroup title="Family"        items={topFamilies} field="family"  colorVar="var(--color-family)"   />
        <FacetGroup title="Species"       items={topSpecies}  field="species" colorVar="var(--color-species)"  italic />
        <FacetGroup title="Gene / Protein" items={topGenes}  field="gene"    colorVar="var(--color-gene)"     />
        <FacetGroup title="Disease"       items={topDiseases} field="disease" colorVar="var(--color-disease)"  />

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-1.5 text-[10px] text-gray-400">
          <ChevronRight size={10} className="mt-0.5 shrink-0" />
          <span>Clicking a value <strong>adds</strong> it as an active filter</span>
        </div>
      </div>
    </aside>
  );
}
