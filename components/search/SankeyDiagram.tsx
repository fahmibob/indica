'use client';

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { PhytoRecord } from '@/lib/types';
import { formatSpeciesName } from '@/lib/format';
import { ZoomIn, ZoomOut, Download, Info, Move } from 'lucide-react';

/* ─────────────────── Types ─────────────────── */
type NodeType = 'family' | 'species' | 'compound' | 'gene' | 'disease';

interface LNode {
  id: string;
  type: NodeType;
  rawLabel: string;
  color: string;
  value: number;
  x0: number; x1: number;
  y0: number; y1: number;
  _srcY: number;
  _tgtY: number;
}
interface LLink {
  source: LNode;
  target: LNode;
  value: number;
  width: number;
  y0: number;
  y1: number;
}

/* ─────────────────── Constants ─────────────────── */
const TYPE_DEPTH: Record<NodeType, number> = {
  family: 0, species: 1, compound: 2, gene: 3, disease: 4,
};
const NODE_COLORS: Record<NodeType, string> = {
  family:   '#606c38',
  species:  '#2d6a4f',
  compound: '#1565c0',
  gene:     '#b5451b',
  disease:  '#6a1b9a',
};
const COLUMNS: { label: string; type: NodeType }[] = [
  { label: 'Family',   type: 'family'   },
  { label: 'Species',  type: 'species'  },
  { label: 'Compound', type: 'compound' },
  { label: 'Gene',     type: 'gene'     },
  { label: 'Disease',  type: 'disease'  },
];
const NUM_COLS   = 5;
const TOP_N      = 15;
const NODE_W     = 16;
const NODE_PAD   = 8;
const HEADER_H   = 36;
const MARGIN_L   = 130;
const MARGIN_R   = 170;
const MIN_NODE_H = 5;
const MAX_NODE_H = 64;
const CHART_H    = 660;
const MIN_W      = 940;
const ZOOM_STEP  = 0.25;

/* ─────────────────── Build raw graph ─────────────────── */
function buildRawGraph(records: PhytoRecord[]) {
  const nodeMap  = new Map<string, { id: string; type: NodeType; rawLabel: string; count: number }>();
  const linkCount = new Map<string, number>();

  const top = (field: keyof PhytoRecord) => {
    const m: Record<string, number> = {};
    records.forEach((r) => { const v = r[field]; if (v) m[String(v)] = (m[String(v)] ?? 0) + 1; });
    return new Set(Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, TOP_N).map(([k]) => k));
  };

  const topFamily   = top('family');
  const topSpecies  = top('species');
  const topCompound = top('compound');
  const topGene     = top('gene');
  const topDisease  = top('disease');

  const addNode = (prefix: string, val: string, type: NodeType) => {
    const id = `${prefix}:${val}`;
    if (!nodeMap.has(id)) nodeMap.set(id, { id, type, rawLabel: val, count: 0 });
    nodeMap.get(id)!.count++;
    return id;
  };
  const addLink = (src: string, tgt: string) => {
    if (src === tgt) return;
    const key = `${src}→${tgt}`;
    linkCount.set(key, (linkCount.get(key) ?? 0) + 1);
  };

  for (const r of records) {
    const fa = r.family   && topFamily.has(r.family)     ? addNode('fa', r.family,   'family')   : null;
    const sp = r.species  && topSpecies.has(r.species)   ? addNode('sp', r.species,  'species')  : null;
    const cp = r.compound && topCompound.has(r.compound) ? addNode('cp', r.compound, 'compound') : null;
    const gn = r.gene     && topGene.has(r.gene)         ? addNode('gn', r.gene,     'gene')     : null;
    const di = r.disease  && topDisease.has(r.disease)   ? addNode('di', r.disease,  'disease')  : null;

    if (fa && sp) addLink(fa, sp);
    if (sp && cp) addLink(sp, cp);
    if (cp && gn) addLink(cp, gn);
    else if (sp && gn && !cp) addLink(sp, gn);
    if (gn && di) addLink(gn, di);
    else if (cp && di && !gn) addLink(cp, di);
    else if (sp && di && !cp && !gn) addLink(sp, di);
  }

  const rawLinks = [...linkCount.entries()].map(([key, value]) => {
    const [src, tgt] = key.split('→');
    return { source: src, target: tgt, value };
  });
  const usedIds  = new Set(rawLinks.flatMap((l) => [l.source, l.target]));
  const rawNodes = [...nodeMap.values()].filter((n) => usedIds.has(n.id));
  return { rawNodes, rawLinks };
}

/* ─────────────────── Custom layout engine ─────────────────── */
function computeLayout(
  rawNodes: ReturnType<typeof buildRawGraph>['rawNodes'],
  rawLinks: ReturnType<typeof buildRawGraph>['rawLinks'],
  chartW: number,
): { nodes: LNode[]; links: LLink[]; colStep: number } | null {
  if (!rawNodes.length || !rawLinks.length) return null;

  const usableW = chartW - MARGIN_L - MARGIN_R;
  const colStep = usableW / (NUM_COLS - 1);
  const colX    = (col: number) => MARGIN_L + col * colStep;

  // Build nodes with forced column x-positions
  const nodeById = new Map<string, LNode>();
  const nodes: LNode[] = rawNodes.map((n) => {
    const x  = colX(TYPE_DEPTH[n.type] ?? 0);
    const ln = {
      id: n.id, type: n.type, rawLabel: n.rawLabel,
      color: NODE_COLORS[n.type],
      value: 1,
      x0: x, x1: x + NODE_W,
      y0: 0, y1: 0, _srcY: 0, _tgtY: 0,
    } as LNode;
    nodeById.set(n.id, ln);
    return ln;
  });

  // Accumulate node values from links
  const valIn  = new Map<string, number>();
  const valOut = new Map<string, number>();
  const links: LLink[] = [];

  for (const rl of rawLinks) {
    const src = nodeById.get(rl.source);
    const tgt = nodeById.get(rl.target);
    if (!src || !tgt) continue;
    links.push({ source: src, target: tgt, value: rl.value, width: 0, y0: 0, y1: 0 });
    valOut.set(src.id, (valOut.get(src.id) ?? 0) + rl.value);
    valIn.set( tgt.id, (valIn.get(tgt.id)  ?? 0) + rl.value);
  }
  nodes.forEach((n) => {
    n.value = Math.max(valIn.get(n.id) ?? 0, valOut.get(n.id) ?? 0, 1);
  });

  // Y-positions per column — proportional to value, centred vertically
  const availH = CHART_H - HEADER_H;
  COLUMNS.forEach(({ type }) => {
    const col = nodes.filter((n) => n.type === type).sort((a, b) => b.value - a.value);
    if (!col.length) return;
    const totalPad = (col.length - 1) * NODE_PAD;
    const totalVal = col.reduce((s, n) => s + n.value, 0);
    const ky       = (availH - totalPad) / totalVal;
    const heights  = col.map((n) => Math.min(MAX_NODE_H, Math.max(MIN_NODE_H, n.value * ky)));
    const totalH   = heights.reduce((s, h) => s + h, 0) + totalPad;
    let   y        = HEADER_H + Math.max(0, (availH - totalH) / 2);
    col.forEach((n, i) => {
      n.y0 = y; n.y1 = y + heights[i];
      n._srcY = n.y0; n._tgtY = n.y0;
      y += heights[i] + NODE_PAD;
    });
  });

  // Link widths (scale to source node height, proportional to value)
  links.forEach((l) => {
    const srcH      = l.source.y1 - l.source.y0;
    const totalOutV = links.filter((x) => x.source.id === l.source.id).reduce((s, x) => s + x.value, 0) || 1;
    l.width = Math.max(1, (l.value / totalOutV) * srcH);
  });

  // Normalize incoming widths at each target so they never overflow the node bar
  nodes.forEach((n) => {
    const inc  = links.filter((l) => l.target.id === n.id);
    const sumW = inc.reduce((s, l) => s + l.width, 0);
    const nodeH = n.y1 - n.y0;
    if (sumW > nodeH && sumW > 0) {
      const scale = nodeH / sumW;
      inc.forEach((l) => { l.width = Math.max(1, l.width * scale); });
    }
  });

  // y0 at source (sorted top-to-bottom by target centre)
  nodes.forEach((n) => {
    const out = links.filter((l) => l.source.id === n.id);
    out.sort((a, b) => (a.target.y0 + a.target.y1) / 2 - (b.target.y0 + b.target.y1) / 2);
    out.forEach((l) => { l.y0 = n._srcY + l.width / 2; n._srcY += l.width; });
  });
  // y1 at target (sorted top-to-bottom by source centre)
  nodes.forEach((n) => {
    const inc = links.filter((l) => l.target.id === n.id);
    inc.sort((a, b) => (a.source.y0 + a.source.y1) / 2 - (b.source.y0 + b.source.y1) / 2);
    inc.forEach((l) => { l.y1 = n._tgtY + l.width / 2; n._tgtY += l.width; });
  });

  return { nodes, links, colStep };
}

/* ─────────────────── Link bezier path ─────────────────── */
function linkPath(l: LLink): string {
  const x0 = l.source.x1, x1 = l.target.x0;
  const mx = (x0 + x1) / 2;
  return `M${x0},${l.y0} C${mx},${l.y0} ${mx},${l.y1} ${x1},${l.y1}`;
}

/* ─────────────────── Node display label ─────────────────── */
function displayLabel(n: LNode): string {
  const raw  = n.rawLabel ?? n.id.replace(/^\w+:/, '');
  const text = n.type === 'species' ? formatSpeciesName(raw) : raw;
  return text.length > 28 ? text.slice(0, 26) + '…' : text;
}

/* ─────────────────── Component ─────────────────── */
export default function SankeyDiagram({ records }: { records: PhytoRecord[] }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const svgRef        = useRef<SVGSVGElement>(null);
  const panRef        = useRef({ active: false, startX: 0, startY: 0, sl: 0, st: 0 });

  const [zoom,        setZoom]        = useState(1);
  const [containerW,  setContainerW]  = useState(MIN_W);
  const [tooltip,     setTooltip]     = useState<{ x: number; y: number; text: string } | null>(null);
  const [panCursor,   setPanCursor]   = useState<'default' | 'grab' | 'grabbing'>('default');

  /* Observe container width */
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((e) => setContainerW(Math.max(e[0]?.contentRect.width ?? MIN_W, MIN_W)));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* ── Ctrl + drag to pan ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') setPanCursor('grab');
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        panRef.current.active = false;
        setPanCursor('default');
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      panRef.current = { active: true, startX: e.clientX, startY: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
      setPanCursor('grabbing');
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!panRef.current.active) return;
      el.scrollLeft = panRef.current.sl - (e.clientX - panRef.current.startX);
      el.scrollTop  = panRef.current.st  - (e.clientY - panRef.current.startY);
    };
    const onMouseUp = () => {
      if (panRef.current.active) {
        panRef.current.active = false;
        setPanCursor('grab'); // still holding ctrl
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    el.addEventListener('mousedown',   onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      el.removeEventListener('mousedown',   onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, []);

  const chartW = Math.max(containerW - 4, MIN_W);

  const graph = useMemo(() => {
    const { rawNodes, rawLinks } = buildRawGraph(records);
    return computeLayout(rawNodes, rawLinks, chartW);
  }, [records, chartW]);

  /* Download SVG */
  const downloadSVG = useCallback(() => {
    const el = svgRef.current;
    if (!el) return;
    const clone = el.cloneNode(true) as SVGSVGElement;
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    s.textContent = 'text{font-family:Inter,system-ui,sans-serif}';
    clone.prepend(s);
    const str = new XMLSerializer().serializeToString(clone);
    const a   = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([str], { type: 'image/svg+xml;charset=utf-8' })),
      download: 'neuphillm_sankey.svg',
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  if (records.length === 0)
    return <EmptyState text="No data to display." />;
  if (!graph)
    return <EmptyState text="Not enough linked data for a Sankey diagram." />;

  const { nodes, links, colStep } = graph;
  const svgH = CHART_H + HEADER_H;

  // Column x-centers for headers / bands
  const colCenters: Partial<Record<NodeType, number>> = {};
  nodes.forEach((n) => {
    if (colCenters[n.type] === undefined) colCenters[n.type] = n.x0 + NODE_W / 2;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Top {TOP_N} per column · {nodes.length} nodes · {links.length} links
          </span>
          {/* Pan hint */}
          <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
            panCursor !== 'default'
              ? 'bg-blue-50 border-blue-200 text-blue-600 font-medium'
              : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}>
            <Move size={9} />
            Hold <kbd className="font-mono font-bold">Ctrl</kbd> + drag to pan
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ZoomCtrl zoom={zoom} onZoom={setZoom} step={ZOOM_STEP} />
          <button
            onClick={downloadSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Download size={13} /> SVG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-xl border border-gray-200 bg-white relative"
        style={{
          cursor: panCursor,
          minHeight: Math.min(svgH * zoom + 8, 700),
          userSelect: 'none',
        }}
      >
        <div style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: `${100 / zoom}%`,
          minWidth: MIN_W,
        }}>
          <svg
            ref={svgRef}
            width={chartW}
            height={svgH}
            viewBox={`0 0 ${chartW} ${svgH}`}
            style={{ display: 'block', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {/* ── Column background bands ── */}
            {COLUMNS.map((c, i) => {
              const cx = colCenters[c.type];
              if (cx === undefined) return null;
              // Band spans half a colStep on each side, clamped to SVG edges
              const bx  = Math.max(0, cx - colStep * 0.45);
              const bx2 = Math.min(chartW, cx + colStep * 0.45);
              const bw  = bx2 - bx;
              return (
                <rect
                  key={`band-${c.type}`}
                  x={bx} y={0} width={bw} height={svgH}
                  fill={NODE_COLORS[c.type]}
                  opacity={i % 2 === 0 ? 0.04 : 0.025}
                  rx={0}
                />
              );
            })}

            {/* ── Column header pills ── */}
            {COLUMNS.map((c) => {
              const cx = colCenters[c.type];
              if (cx === undefined) return null;
              const col = NODE_COLORS[c.type];
              return (
                <g key={`hdr-${c.type}`}>
                  {/* Pill background */}
                  <rect x={cx - 36} y={5} width={72} height={24} rx={12} fill={col} opacity={0.15} />
                  {/* Pill text */}
                  <text
                    x={cx} y={20}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight="800"
                    letterSpacing="0.08em"
                    fill={col}
                    style={{ textTransform: 'uppercase' }}
                  >
                    {c.label.toUpperCase()}
                  </text>
                  {/* Thin vertical guide line from header to bottom */}
                  <line
                    x1={cx} y1={31} x2={cx} y2={svgH - 4}
                    stroke={col} strokeWidth={1}
                    strokeOpacity={0.12}
                    strokeDasharray="3 5"
                  />
                </g>
              );
            })}

            {/* ── Links ── */}
            {links.map((l, i) => {
              const colSpan = Math.abs(TYPE_DEPTH[l.target.type] - TYPE_DEPTH[l.source.type]);
              return (
                <path
                  key={i}
                  d={linkPath(l)}
                  fill="none"
                  stroke={l.source.color}
                  strokeWidth={l.width}
                  strokeOpacity={colSpan > 1 ? 0.18 : 0.30}   // skip links are more transparent
                  strokeDasharray={colSpan > 1 ? '6 3' : undefined}  // skip links are dashed
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => setTooltip({
                    x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY,
                    text: `${displayLabel(l.source)} → ${displayLabel(l.target)}  ×${l.value}`,
                  })}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}

            {/* ── Nodes ── */}
            {nodes.map((n) => {
              const h      = Math.max(MIN_NODE_H, n.y1 - n.y0);
              // Family (first col): labels LEFT into MARGIN_L space.
              // All others: labels RIGHT — species/compound/gene into inter-column gap, disease into MARGIN_R.
              const lx     = n.type === 'family' ? n.x0 - 5 : n.x1 + 5;
              const anchor = n.type === 'family' ? 'end' : ('start' as const);
              return (
                <g
                  key={n.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => setTooltip({
                    x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY,
                    text: `${n.type.charAt(0).toUpperCase() + n.type.slice(1)}: ${displayLabel(n)} · ${n.value} records`,
                  })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Node bar */}
                  <rect
                    x={n.x0} y={n.y0} width={NODE_W} height={h}
                    fill={n.color} rx={3} opacity={0.92}
                  />
                  {/* Node label */}
                  <text
                    x={lx} y={n.y0 + h / 2} dy="0.35em"
                    textAnchor={anchor}
                    fontSize={n.type === 'family' ? 9.5 : 10}
                    fontStyle={n.type === 'species' ? 'italic' : 'normal'}
                    fontWeight={480}
                    fill={n.color}
                  >
                    {displayLabel(n)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 bg-gray-900/95 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap"
            style={{ left: tooltip.x + 14, top: Math.max(4, tooltip.y - 8) }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 items-center">
        {COLUMNS.map((c) => (
          <span key={c.type} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: NODE_COLORS[c.type] }} />
            {c.label}
          </span>
        ))}
        <span className="text-gray-300 ml-1">|</span>
        <span className="text-gray-400 flex items-center gap-1">
          <span className="inline-block w-5 h-0.5 bg-gray-400" style={{ borderBottom: '2px dashed #9ca3af' }} />
          skip-level link
        </span>
      </div>
    </div>
  );
}

/* ─────────────────── Sub-components ─────────────────── */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Info size={28} className="mb-2 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ZoomCtrl({
  zoom, onZoom, step,
}: {
  zoom: number;
  onZoom: (fn: (z: number) => number) => void;
  step: number;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => onZoom((z) => Math.max(0.4, +(z - step).toFixed(2)))}
        disabled={zoom <= 0.4}
        className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 transition-all"
        title="Zoom out"
      >
        <ZoomOut size={14} className="text-gray-600" />
      </button>
      <button
        onClick={() => onZoom(() => 1)}
        className="px-2 py-1 rounded-md text-xs font-mono text-gray-600 hover:bg-white min-w-[3rem] text-center"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={() => onZoom((z) => Math.min(3, +(z + step).toFixed(2)))}
        disabled={zoom >= 3}
        className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 transition-all"
        title="Zoom in"
      >
        <ZoomIn size={14} className="text-gray-600" />
      </button>
    </div>
  );
}
