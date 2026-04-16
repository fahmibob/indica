# INDICA

**A Database of Indonesian Medicinal Plants, Phytochemical Compounds, and Anticancer Activities Extracted from Biomedical Literature**

> Version 0.1 β · April 2026 · Universitas Brawijaya

---

## Overview

INDICA is a structured, searchable knowledge base that links Indonesian medicinal plant species and their bioactive phytochemical compounds to molecular targets (genes/proteins) and cancer diseases. All relationships are automatically extracted from PubMed biomedical literature (~8,900 abstracts, 2010–2025) using state-of-the-art NLP pipelines, enabling systematic phytopharmaca drug discovery research.

---

## Data Coverage

| Metric | Value |
|---|---|
| Records | ~5,975 |
| PubMed Articles | ~2,500+ |
| Literature Years | 2010–2025 |
| Relationship Types | 12 types |
| Data Version | 0.1 β |
| Last Updated | April 2026 |

---

## Data Pipeline

```
PubMed abstracts
      │
      ▼
Named Entity Recognition (NER)
  └─ PubTator Central — species, genes, diseases, chemicals
      │
      ▼
Relation Extraction (RE)
  └─ BioBERT, BioM-ELECTRA, PubMedBERT
     fine-tuned on DrugProt (compound–gene) + BioRED (gene–disease)
      │
      ▼
Normalization
  └─ Species → NCBI Taxonomy
     Disease  → MeSH IDs
     Gene     → NCBI Gene IDs
      │
      ▼
INDICA Database
```

### Data Schema

Each record captures a five-level relationship:

`Family → Species → Compound → Gene/Protein → Disease`

| Field | Description |
|---|---|
| `species` | Plant species (e.g. *Curcuma longa*) |
| `family` | Plant family (e.g. Zingiberaceae) |
| `pmid` | PubMed article ID |
| `compound` | Bioactive phytochemical (e.g. quercetin) |
| `gene` | Gene or protein target (e.g. JAK2) |
| `disease` | Cancer / disease type (e.g. Breast Cancer) |
| `np_gene_rel` | Compound → Gene relationship type |
| `gene_disease_rel` | Gene → Disease relationship type |

The dataset is stored in `public/data/triplets_clean.tsv`.

---

## Features

- **Simple & Advanced Search** — full-text across all fields, or field-specific queries with AND/OR logic
- **Additive Filters** — click any entity (species, compound, gene, disease) in the results to stack filters
- **Results Table** — sortable, paginated, with CSV export of all filtered results
- **Sankey Diagram** — interactive flow visualization: Family → Species → Compound → Gene → Disease, including skip-level connections for records with missing intermediate entities
- **Facet Sidebar** — top species, genes, diseases, and families with record counts
- **Responsive** — works on mobile, tablet, and desktop

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4
- **Table:** TanStack Table v8
- **Visualization:** Custom SVG Sankey (no external graph library)
- **Fonts:** Inter + Poppins via `next/font/google`
- **Data:** Static TSV file served from `public/data/`

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Institution

**Universitas Brawijaya**  
PS SMONAGENES — Pusat Studi Molekul Cerdas dari Sumber Genetik Alami (Smart Molecule of Natural Genetics Resource)  
AI CENTER — Artificial Intelligence Research Center

> **Disclaimer:** INDICA is a research prototype (TRL 4–6). Data is automatically extracted using NLP/AI and may contain errors. Always verify findings with the original PubMed article via the PMID link. For research use only.
