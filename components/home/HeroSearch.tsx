'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, X, ChevronDown } from 'lucide-react';

type FieldOption = { value: string; label: string };

const FIELD_OPTIONS: FieldOption[] = [
  { value: 'species', label: 'Species' },
  { value: 'family', label: 'Family' },
  { value: 'gene', label: 'Gene / Protein' },
  { value: 'disease', label: 'Disease' },
  { value: 'compound', label: 'Compound' },
  { value: 'pmid', label: 'PMID' },
];

interface AdvRow {
  id: number;
  field: string;
  value: string;
}

let _nextId = 2;

export default function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<'simple' | 'advanced'>('simple');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<AdvRow[]>([
    { id: 1, field: 'species', value: '' },
  ]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSug, setShowSug] = useState(false);
  const sugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSimple = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleAdvanced = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filled = rows.filter((r) => r.value.trim());
    if (!filled.length) return;

    // Build URL params — handle multiple values for same field
    const params = new URLSearchParams();
    const fieldValues: Record<string, string[]> = {};
    filled.forEach((r) => {
      if (!fieldValues[r.field]) fieldValues[r.field] = [];
      fieldValues[r.field].push(r.value.trim());
    });

    // For each field, use the first value (multiple same-field values unsupported in API)
    Object.entries(fieldValues).forEach(([field, vals]) => {
      params.set(field, vals[0]);
    });
    params.set('logic', logic);
    router.push(`/search?${params.toString()}`);
  };

  const addRow = () => {
    const usedFields = new Set(rows.map((r) => r.field));
    const nextField = FIELD_OPTIONS.find((f) => !usedFields.has(f.value))?.value ?? 'gene';
    setRows((prev) => [...prev, { id: _nextId++, field: nextField, value: '' }]);
  };

  const removeRow = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id: number, key: keyof AdvRow, val: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: val } : r)));

  // Autocomplete for simple search
  useEffect(() => {
    if (!query.trim() || tab !== 'simple') { setSuggestions([]); return; }
    if (sugTimer.current) clearTimeout(sugTimer.current);
    sugTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setShowSug(true);
      } catch { /* ignore */ }
    }, 200);
  }, [query, tab]);

  const inputStyle =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow';
  const ringStyle = { '--tw-ring-color': 'var(--color-primary-light)' } as React.CSSProperties;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['simple', 'advanced'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            style={tab === t ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            {t === 'simple' ? 'Simple Search' : 'Advanced Search'}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'simple' ? (
          <form onSubmit={handleSimple} className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => suggestions.length && setShowSug(true)}
                  onBlur={() => setTimeout(() => setShowSug(false), 150)}
                  placeholder="Search species, gene, compound, disease..."
                  className={inputStyle + ' pl-9 py-3'}
                  style={ringStyle}
                  autoFocus
                />
                {/* Autocomplete dropdown */}
                {showSug && suggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-52 overflow-y-auto text-sm">
                    {suggestions.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onMouseDown={() => { setQuery(s); setShowSug(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-3 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Search
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdvanced} className="space-y-3">
            {/* Global logic toggle */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span>Match</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                {(['AND', 'OR'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLogic(l)}
                    className={`px-3 py-1.5 transition-colors ${logic === l ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    style={logic === l ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <span className="text-gray-500">of these conditions</span>
            </div>

            {/* Rows */}
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={row.field}
                    onChange={(e) => updateRow(row.id, 'field', e.target.value)}
                    className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-sm bg-white focus:outline-none focus:ring-2 shrink-0"
                    style={{ ...ringStyle, minWidth: '9rem' }}
                  >
                    {FIELD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                  placeholder={`Enter ${FIELD_OPTIONS.find((o) => o.value === row.field)?.label}…`}
                  className={inputStyle + ' flex-1'}
                  style={ringStyle}
                />
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded"
                    aria-label="Remove row"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={addRow}
                disabled={rows.length >= FIELD_OPTIONS.length}
                className="flex items-center gap-1 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: 'var(--color-accent)' }}
              >
                <Plus size={14} /> Add condition
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Search
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
