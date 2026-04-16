'use client';

import { useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { PhytoRecord } from '@/lib/types';
import { formatSpeciesName } from '@/lib/format';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const helper = createColumnHelper<PhytoRecord>();

/** Build a URL that ADDS/REPLACES a single field filter, preserving all other active params */
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

function CellBtn({ children, onClick, className }: {
  children: React.ReactNode; onClick: () => void; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left hover:underline underline-offset-2 ${className ?? ''}`}
      title="Click to filter by this value"
    >
      {children}
    </button>
  );
}

export default function ResultsTable({ records, downloadRecords }: { records: PhytoRecord[]; downloadRecords?: PhytoRecord[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const addFilter = useAddFilter();

  const columns = [
    helper.accessor('family', {
      header: 'Family',
      cell: (info) =>
        info.getValue() ? (
          <CellBtn className="family-cell" onClick={() => addFilter('family', info.getValue()!)}>
            {info.getValue()}
          </CellBtn>
        ) : (
          <span className="null-value">—</span>
        ),
    }),
    helper.accessor('species', {
      header: 'Species',
      cell: (info) => (
        <CellBtn className="species-cell" onClick={() => addFilter('species', info.getValue())}>
          {formatSpeciesName(info.getValue())}
        </CellBtn>
      ),
    }),
    helper.accessor('pmid', {
      header: 'PMID',
      cell: (info) => (
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/${info.getValue()}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="pmid-link inline-flex items-center gap-0.5 whitespace-nowrap"
        >
          {info.getValue()}
          <ExternalLink size={10} />
        </a>
      ),
    }),
    helper.accessor('compound', {
      header: 'Compound',
      cell: (info) =>
        info.getValue() ? (
          <CellBtn className="compound-cell" onClick={() => addFilter('compound', info.getValue()!)}>
            {info.getValue()}
          </CellBtn>
        ) : (
          <span className="null-value">—</span>
        ),
    }),
    helper.accessor('gene', {
      header: 'Gene / Protein',
      cell: (info) =>
        info.getValue() ? (
          <CellBtn className="gene-cell" onClick={() => addFilter('gene', info.getValue()!)}>
            {info.getValue()}
          </CellBtn>
        ) : (
          <span className="null-value">—</span>
        ),
    }),
    helper.accessor('disease', {
      header: 'Disease',
      cell: (info) =>
        info.getValue() ? (
          <CellBtn className="disease-cell" onClick={() => addFilter('disease', info.getValue()!)}>
            {info.getValue()}
          </CellBtn>
        ) : (
          <span className="null-value">—</span>
        ),
    }),
  ];

  const table = useReactTable({
    data: records,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const downloadCSV = useCallback(() => {
    const headers = ['family', 'species', 'pmid', 'compound', 'gene', 'disease'];
    const rows = (downloadRecords ?? records).map((r) =>
      [r.family, formatSpeciesName(r.species), r.pmid, r.compound, r.gene, r.disease]
        .map((v) => (v == null ? '' : `"${String(v).replace(/"/g, '""')}"`))
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const a   = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })),
      download: 'indica_results.csv',
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }, [records]);

  if (records.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">No results found.</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={downloadCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <Download size={13} />
          Download CSV ({(downloadRecords ?? records).length})
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm min-w-[700px]">
          <thead style={{ backgroundColor: 'var(--color-primary)' }}>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left cursor-pointer select-none text-xs font-semibold text-white/90 uppercase tracking-wider whitespace-nowrap hover:bg-black/10 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? (
                        <ChevronUp size={12} />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={12} className="opacity-40" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`transition-colors hover:bg-green-50/40 ${i % 2 !== 0 ? 'bg-gray-50/60' : 'bg-white'}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2.5 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
