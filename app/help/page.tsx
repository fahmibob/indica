export default function HelpPage() {
  const fields = [
    { name: 'species', desc: 'Plant species name (e.g. Curcuma longa, Morinda citrifolia)', example: 'Curcuma longa', color: 'var(--color-species)' },
    { name: 'family', desc: 'Plant family (e.g. Zingiberaceae, Rubiaceae)', example: 'Zingiberaceae', color: 'var(--color-family)' },
    { name: 'pmid', desc: 'PubMed article ID — links to pubmed.ncbi.nlm.nih.gov', example: '31768613', color: 'var(--color-accent)' },
    { name: 'compound', desc: 'Bioactive compound / phytochemical (NA = not reported)', example: 'quercetin', color: 'var(--color-compound)' },
    { name: 'gene', desc: 'Gene or protein name (NA = not reported)', example: 'JAK2', color: 'var(--color-gene)' },
    { name: 'disease', desc: 'Cancer / disease type (NA = not reported)', example: 'Breast Cancer', color: 'var(--color-disease)' },
    { name: 'np_gene_rel', desc: 'Compound→Gene relationship type (Sankey link color)', example: 'DIRECT-REGULATOR' },
    { name: 'gene_disease_rel', desc: 'Gene→Disease relationship type (Sankey link color)', example: 'Association' },
  ];

  const faq = [
    {
      q: 'Why do some cells show "—"?',
      a: 'A dash means the value was not reported in the source publication (stored as NA in the dataset).',
    },
    {
      q: 'What does clicking a species/gene/disease/compound do?',
      a: 'It triggers a new search filtered to that exact value.',
    },
    {
      q: 'What is the Sankey diagram?',
      a: 'It visualizes the relationship flow: Family → Species → Compound → Gene → Disease. Link width represents the number of records sharing that connection.',
    },
    {
      q: 'Why does the Sankey only show some nodes?',
      a: 'Each column is capped at the top 15 most frequent nodes for readability. Use the zoom controls to explore a bigger view.',
    },
    {
      q: 'How accurate is the data?',
      a: 'Data is automatically extracted using NLP models and may contain errors. Always verify with the original PubMed article via the PMID link.',
    },
    {
      q: 'Can I search with multiple conditions?',
      a: 'Yes — use Advanced Search to add multiple field conditions with AND (all must match) or OR (any can match) logic.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">

      <div>
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
        >
          Help & Documentation
        </h1>
        <p className="text-sm text-gray-500">INDICA Database — User Guide</p>
      </div>

      <section>
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
          Simple Search
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Type any term in the search box. The query is matched against <em>all fields</em>:
          species, family, compound, gene, disease, and PMID. Examples:{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">quercetin</code>,{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">breast cancer</code>,{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">JAK2</code>,{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Zingiberaceae</code>.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
          Advanced Search
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed mb-2">
          Use the <strong>Advanced Search</strong> tab to search specific fields. Add multiple
          rows and choose <strong>ALL</strong> (AND) or <strong>ANY</strong> (OR) logic.
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li><strong>ALL (AND)</strong>: every condition must match — produces narrower results</li>
          <li><strong>ANY (OR)</strong>: at least one condition must match — produces broader results</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
          Results Table
        </h2>
        <p className="text-sm text-gray-700 mb-2">
          The table shows: Family, Species, PMID, Compound, Gene, Disease.
          Click any column header to sort. Click any entity value to filter.
          PMID links open the article on PubMed.
        </p>
        <p className="text-sm text-gray-500">
          Use the <strong>Download CSV</strong> button to export the current results.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
          Sankey Diagram
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Switch to the <strong>Sankey</strong> view to see the flow:
          Family → Species → Compound → Gene → Disease.
          Use <strong>+ / −</strong> buttons to zoom. Use the <strong>Download SVG</strong> button to save.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>
          Data Fields Reference
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
              <tr>
                <th className="px-4 py-2.5 text-left">Field</th>
                <th className="px-4 py-2.5 text-left">Description</th>
                <th className="px-4 py-2.5 text-left hidden sm:table-cell">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((f) => (
                <tr key={f.name} className="hover:bg-gray-50/60">
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold" style={{ color: f.color ?? 'var(--color-primary)' }}>
                    {f.name}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs">{f.desc}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400 hidden sm:table-cell">{f.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>
          Frequently Asked Questions
        </h2>
        <dl className="space-y-4">
          {faq.map((item) => (
            <div key={item.q} className="bg-white rounded-xl border border-gray-200 p-4">
              <dt className="font-semibold text-sm text-gray-800 mb-1">{item.q}</dt>
              <dd className="text-sm text-gray-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
