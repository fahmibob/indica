'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { PhytoRecord } from '@/lib/types';
import ResultsTable from '@/components/search/ResultsTable';
import SankeyDiagram from '@/components/search/SankeyDiagram';
import FacetSidebar from '@/components/search/FacetSidebar';
import { Table2, GitFork, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { formatSpeciesName } from '@/lib/format';

interface SearchResult {
  records: PhytoRecord[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    topSpecies:   Array<{ name: string; count: number }>;
    topGenes:     Array<{ name: string; count: number }>;
    topDiseases:  Array<{ name: string; count: number }>;
    topFamilies:  Array<{ name: string; count: number }>;
  };
}

const PAGE_SIZES = [10, 20, 50];

function ActiveFilters({ sp }: { sp: URLSearchParams }) {
  const router = useRouter();
  const fields = ['q', 'species', 'family', 'gene', 'disease', 'compound', 'pmid'];
  const active = fields.filter((f) => sp.get(f));
  if (!active.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-3 items-center">
      <span className="text-xs text-gray-400 font-medium">Active filters:</span>
      {active.map((f) => (
        <span
          key={f}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: 'var(--color-primary-pale)', color: 'var(--color-primary)' }}
        >
          <span className="opacity-60">{f}:</span>
          <span className="font-semibold">
            {f === 'species' ? formatSpeciesName(sp.get(f)) : sp.get(f)}
          </span>
          <button
            onClick={() => {
              const next = new URLSearchParams(sp.toString());
              next.delete(f);
              next.set('page', '1');
              router.push(`/search?${next.toString()}`);
            }}
            className="ml-0.5 opacity-60 hover:opacity-100"
            aria-label={`Remove ${f} filter`}
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={() => router.push('/search')}
        className="text-xs text-red-400 hover:text-red-600 font-medium ml-1"
      >
        Clear all
      </button>
    </div>
  );
}

export default function SearchPageClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'sankey'>('table');
  const [allRecords, setAllRecords] = useState<PhytoRecord[]>([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const page     = parseInt(sp.get('page')     ?? '1');
  const pageSize = parseInt(sp.get('pageSize') ?? '10');
  const hasQuery = ['q','species','family','gene','disease','compound','pmid'].some((f) => sp.get(f));

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/search?${sp.toString()}`);
    const data: SearchResult = await res.json();
    setResult(data);
    setLoading(false);
  }, [sp]);

  const fetchAll = useCallback(async () => {
    const allSp = new URLSearchParams(sp.toString());
    allSp.set('pageSize', '9000');
    allSp.set('page', '1');
    const res  = await fetch(`/api/search?${allSp.toString()}`);
    const data: SearchResult = await res.json();
    setAllRecords(data.records);
  }, [sp]);

  useEffect(() => { fetchResults(); }, [fetchResults]);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const navigate = (newParams: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(newParams).forEach(([k, v]) => next.set(k, v));
    router.push(`/search?${next.toString()}`);
  };

  const totalPages = result ? Math.ceil(result.total / pageSize) : 0;

  /* ── Empty state (no query yet) ── */
  if (!hasQuery && !loading && (!result || result.total === 0)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Search size={40} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2"
          style={{ fontFamily: 'var(--font-poppins), Poppins' }}
        >
          Start your search
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Search for a plant species, compound, gene, or disease to explore INDICA data.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Curcuma Longa', 'quercetin', 'VEGF', 'Breast Cancer', 'Zingiberaceae'].map((ex) => (
            <button
              key={ex}
              onClick={() => router.push(`/search?q=${encodeURIComponent(ex)}`)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-5">

      {/* Results header row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          {loading ? (
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-sm text-gray-600">
              {result && result.total > 0 ? (
                <>
                  <strong className="text-gray-900">
                    {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, result.total)}
                  </strong>
                  {' of '}
                  <strong className="text-gray-900">{result.total.toLocaleString()}</strong>
                  {' results'}
                </>
              ) : result ? (
                <span className="text-gray-400">No results found.</span>
              ) : null}
            </p>
          )}
        </div>

        {/* Mobile: toggle sidebar */}
        <button
          className="md:hidden flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50"
          onClick={() => setShowMobileSidebar((v) => !v)}
        >
          <SlidersHorizontal size={13} />
          Filters
        </button>
      </div>

      {/* Active filters chips */}
      <ActiveFilters sp={sp} />

      {/* Mobile sidebar overlay */}
      {showMobileSidebar && result && (
        <div className="md:hidden mb-4">
          <FacetSidebar
            topSpecies={result.facets.topSpecies}
            topGenes={result.facets.topGenes}
            topDiseases={result.facets.topDiseases}
            topFamilies={result.facets.topFamilies}
          />
        </div>
      )}

      <div className="flex gap-5 items-start">
        {/* Desktop sidebar */}
        {result && (
          <FacetSidebar
            topSpecies={result.facets.topSpecies}
            topGenes={result.facets.topGenes}
            topDiseases={result.facets.topDiseases}
            topFamilies={result.facets.topFamilies}
          />
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* View toggle + page size */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm shadow-sm">
              <button
                onClick={() => setView('table')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 transition-colors text-xs font-medium ${
                  view === 'table' ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={view === 'table' ? { backgroundColor: 'var(--color-primary)' } : {}}
              >
                <Table2 size={13} /> Table
              </button>
              <button
                onClick={() => setView('sankey')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 transition-colors text-xs font-medium border-l border-gray-200 ${
                  view === 'sankey' ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={view === 'sankey' ? { backgroundColor: 'var(--color-primary)' } : {}}
              >
                <GitFork size={13} /> Sankey
              </button>
            </div>

            {view === 'table' && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>Rows:</span>
                {PAGE_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => navigate({ pageSize: String(s), page: '1' })}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-medium transition-colors ${
                      pageSize === s
                        ? 'border-transparent text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                    style={pageSize === s ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : view === 'table' ? (
            <>
              <ResultsTable records={result?.records ?? []} total={result?.total} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-5">
                  <button
                    disabled={page <= 1}
                    onClick={() => navigate({ page: String(page - 1) })}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {(() => {
                    const pages: (number | '…')[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (page > 3) pages.push('…');
                      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                      if (page < totalPages - 2) pages.push('…');
                      pages.push(totalPages);
                    }
                    return pages.map((p, i) =>
                      p === '…' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => navigate({ page: String(p) })}
                          className={`w-8 h-8 text-xs font-medium rounded-lg border transition-colors ${
                            p === page ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                          style={p === page ? { backgroundColor: 'var(--color-primary)' } : {}}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => navigate({ page: String(page + 1) })}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="sankey-container p-4">
              <SankeyDiagram records={allRecords} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
