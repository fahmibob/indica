import { FlaskConical } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

          {/* Brand */}
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)' }}
            >
              <FlaskConical size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-base"
                  style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif', color: 'var(--color-primary)' }}
                >
                  INDICA
                </span>
                <span className="beta-badge">β BETA</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 max-w-sm leading-relaxed">
                A Database of Indonesian Medicinal Plants, Phytochemical Compounds,
                and Anticancer Activities Extracted from Biomedical Literature
              </p>
            </div>
          </div>

          {/* Institution info */}
          <div className="text-center md:text-right">
            <p className="text-xs font-semibold text-gray-700">Universitas Brawijaya</p>
            <p className="text-xs text-gray-500 mt-0.5">PS SMONAGENES · AI CENTER</p>
            <p className="text-xs text-gray-400 mt-1">
              Literature: 2010–2025 · Last updated: April 2026
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© 2026 INDICA Database. Data extracted from PubMed using NLP/AI pipelines.</p>
          <p className="italic">For research use only. Not for clinical decision-making.</p>
        </div>
      </div>
    </footer>
  );
}
