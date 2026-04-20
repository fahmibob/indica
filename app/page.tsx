import Link from 'next/link';
import HeroSearch from '@/components/home/HeroSearch';
import StatsBar from '@/components/home/StatsBar';
import QuickExamples from '@/components/home/QuickExamples';
import { Database, BookOpen, Dna, Leaf, FlaskConical, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Beta banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle size={14} className="shrink-0" />
          <span>
            <strong>Beta version</strong> — NeuPhiLLM is under active development. Data may be incomplete or contain extraction errors.
            <Link href="/about" className="ml-2 underline font-medium hover:text-amber-900">Learn more</Link>
          </span>
        </div>
      </div>

      {/* Hero */}
      <div
        className="py-14 sm:py-20 px-4"
        style={{
          background: 'linear-gradient(150deg, #1b4332 0%, #2d6a4f 55%, #1e6091 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto text-center text-white mb-10">
          {/* Icon + badge */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <FlaskConical size={24} className="text-white" />
            </div>
            <span className="beta-badge">β BETA</span>
          </div>

          <h1
            className="hero-title text-4xl sm:text-5xl mb-4 text-white"
          >
            NeuPhiLLM
          </h1>
          <p className="text-green-100 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-2">
            A Database of Indonesian Medicinal Plants, Phytochemical Compounds,
            and Anticancer Activities
          </p>
          <p className="text-green-200/70 text-sm max-w-xl mx-auto">
            Extracted from Biomedical Literature via NLP · ~8,803 records · PubMed 2010–2026
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <HeroSearch />
          <div className="mt-4 flex justify-center">
            <QuickExamples />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <StatsBar />
      </div>

      {/* Feature highlights */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Leaf size={20} />,
              color: '#1b4332',
              title: 'Plant Species',
              desc: 'Indonesian medicinal plants with taxonomic family classification',
            },
            {
              icon: <FlaskConical size={20} />,
              color: '#1e6091',
              title: 'Phytochemicals',
              desc: 'Bioactive compounds including alkaloids, flavonoids, and terpenoids',
            },
            {
              icon: <Dna size={20} />,
              color: '#b5451b',
              title: 'Genes & Proteins',
              desc: 'Molecular targets with compound–gene relationship types',
            },
            {
              icon: <Database size={20} />,
              color: '#6a1b9a',
              title: 'Cancer Diseases',
              desc: 'Gene–disease associations across multiple cancer types',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white mb-3"
                style={{ backgroundColor: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About snippet */}
      <div className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins' }}>
              About NeuPhiLLM
            </h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
            NeuPhiLLM maps biomedical anticancer knowledge of Indonesian medicinal plants extracted
            from ~2,323 PubMed records (2010–2026) using NLP pipelines (BioBERT, PubTator, DrugProt).
            It covers relationships between plant species, bioactive compounds, genes/proteins,
            and cancer diseases.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Learn more
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Start searching
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
