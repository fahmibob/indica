import { Database, BookOpen, Cpu, Building2, GitBranch, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const pipeline = [
    { label: 'PubMed', sub: '~8,900 abstracts\n2010–2025' },
    { label: 'NER', sub: 'PubTator Central\nEntity tagging' },
    { label: 'Relation Extraction', sub: 'BioBERT · BioM-ELECTRA\nPubMedBERT on DrugProt+BioRED' },
    { label: 'Normalization', sub: 'Species · MeSH\nGene IDs' },
    { label: 'INDICA DB', sub: 'Web interface\n+ Download' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

      {/* Beta notice */}
      <div className="mb-8 flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <div>
          <strong>Beta Notice</strong> — INDICA is an active research prototype (TRL 4–6).
          The data is automatically extracted using NLP/AI and may contain errors.
          Always verify findings with the original literature via PMID links.
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-3xl sm:text-4xl font-bold mb-2"
        style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
      >
        About INDICA
      </h1>
      <p className="text-gray-500 mb-1 text-sm font-medium">
        A Database of Indonesian Medicinal Plants, Phytochemical Compounds, and Anticancer
        Activities Extracted from Biomedical Literature
      </p>
      <p className="text-gray-400 text-xs mb-10">Version 0.1 β · April 2026</p>

      {/* Mission */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins' }}>
            Mission
          </h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm">
          INDICA provides a structured, searchable knowledge base linking Indonesian medicinal
          plant species and their bioactive compounds to molecular targets (genes/proteins)
          and cancer diseases — enabling systematic phytopharmaca drug discovery research.
          All knowledge is automatically extracted from PubMed biomedical literature using
          state-of-the-art NLP pipelines.
        </p>
      </section>

      {/* Data Pipeline */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins' }}>
            Data Pipeline
          </h2>
        </div>

        {/* Pipeline steps */}
        <div className="flex flex-wrap items-center gap-1 mb-4">
          {pipeline.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1">
              <div
                className="rounded-lg px-3 py-2 text-center"
                style={{ backgroundColor: 'var(--color-primary)', minWidth: '7rem' }}
              >
                <div className="text-white text-xs font-semibold">{step.label}</div>
                <div className="text-green-200 text-[10px] mt-0.5 whitespace-pre-line leading-tight">
                  {step.sub}
                </div>
              </div>
              {i < pipeline.length - 1 && (
                <span className="text-gray-300 font-bold text-lg">→</span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 text-sm text-gray-600">
          <p>
            <strong>Named Entity Recognition (NER):</strong> PubTator Central is used to
            automatically annotate species, genes/proteins, diseases, and chemicals directly
            from PubMed abstracts.
          </p>
          <p>
            <strong>Relation Extraction (RE):</strong> BioBERT, BioM-ELECTRA, and PubMedBERT
            models fine-tuned on the DrugProt corpus (compound–gene) and BioRED corpus
            (gene–disease) to classify relationship types between annotated entities.
          </p>
          <p>
            <strong>Normalization:</strong> Species names normalized to NCBI Taxonomy;
            diseases mapped to MeSH IDs; genes mapped to NCBI Gene IDs.
          </p>
        </div>
      </section>

      {/* Data Coverage */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Database size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins' }}>
            Data Coverage
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Records', value: '~5,975' },
            { label: 'PubMed Articles', value: '~2,500+' },
            { label: 'Literature Years', value: '2010–2025' },
            { label: 'Relationship Types', value: '12 types' },
            { label: 'Data Version', value: '0.1 β' },
            { label: 'Last Updated', value: 'April 2026' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins' }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Institution */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins' }}>
            Institution
          </h2>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-sm text-gray-700 space-y-1.5">
          <p className="font-bold text-base text-gray-900">Universitas Brawijaya</p>
          <p>PS SMONAGENES — Sains dan Manajemen Genomik Fungsional</p>
          <p>AI CENTER — Artificial Intelligence Research Center</p>
          <p className="text-gray-400 pt-2 text-xs">TRL 4–6 Prototype · For research use only</p>
        </div>
      </section>

      {/* Citation */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins' }}>
            How to Use
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Start Searching →
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Documentation
          </Link>
        </div>
      </section>
    </div>
  );
}
