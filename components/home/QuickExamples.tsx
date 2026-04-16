'use client';

import { useRouter } from 'next/navigation';

const examples = [
  { label: 'quercetin', query: '?q=quercetin' },
  { label: 'Nasopharyngeal Carcinoma', query: '?q=Nasopharyngeal+Carcinoma' },
  { label: 'Curcuma longa', query: '?species=Curcuma+Longa' },
  { label: 'VEGF', query: '?gene=VEGF' },
  { label: 'Zingiberaceae', query: '?family=Zingiberaceae' },
  { label: 'JAK2', query: '?gene=JAK2' },
];

export default function QuickExamples() {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      <span className="text-sm text-green-200/80">Try:</span>
      {examples.map((ex) => (
        <button
          key={ex.label}
          onClick={() => router.push(`/search${ex.query}`)}
          className="px-3 py-1 text-xs rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white/90 transition-all"
        >
          {ex.label}
        </button>
      ))}
    </div>
  );
}
