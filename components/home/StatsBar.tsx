'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalRecords: number;
  uniqueSpecies: number;
  uniqueFamilies: number;
  uniqueCompounds: number;
  uniqueGenes: number;
  uniqueDiseases: number;
  uniquePMIDs: number;
}

function AnimatedCount({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}</span>;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats);
  }, []);

  const items = stats ? [
    { label: 'Records',         value: stats.totalRecords,    color: 'var(--color-primary)' },
    { label: 'Plant Families',  value: stats.uniqueFamilies,  color: 'var(--color-family)' },
    { label: 'Species',         value: stats.uniqueSpecies,   color: 'var(--color-species)' },
    { label: 'Compounds',       value: stats.uniqueCompounds, color: 'var(--color-compound)' },
    { label: 'Genes / Proteins',value: stats.uniqueGenes,     color: 'var(--color-gene)' },
    { label: 'Diseases',        value: stats.uniqueDiseases,  color: 'var(--color-disease)' },
    { label: 'PubMed Articles', value: stats.uniquePMIDs,     color: 'var(--color-accent)' },
  ] : [];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`px-4 py-4 text-center ${
              i < items.length - 1 ? 'border-r border-b sm:border-b-0 border-gray-100' : ''
            }`}
          >
            <div
              className="text-2xl font-bold tabular-nums"
              style={{ color: item.color, fontFamily: 'var(--font-poppins), Poppins' }}
            >
              {stats ? <AnimatedCount target={item.value} /> : (
                <span className="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse" />
              )}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5 font-medium uppercase tracking-wide leading-tight">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
