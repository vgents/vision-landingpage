import React, { useState } from 'react';
import {
  LayoutGrid, GitBranch, MonitorSmartphone, Palette, CheckCircle2, Sparkles,
  FileText, GitPullRequest, Blocks, Languages, HardDrive, FileUp,
  Check, AlertTriangle, Clock, Figma, Printer
} from 'lucide-react';
import { FEATURE_ITEMS, SECONDARY_FEATURES } from '../data/softwareData';

const FEATURE_ICON: Record<string, React.ElementType> = {
  'lean-inception': LayoutGrid,
  'user-flow': GitBranch,
  'documentacao': FileText,
  'prototype': MonitorSmartphone,
  'design-system': Palette
};

const SECONDARY_ICON: Record<string, React.ElementType> = {
  GitPullRequest,
  Blocks,
  Languages,
  HardDrive
};

export const FeatureShowcase: React.FC = () => {
  const [activeFeatureId, setActiveFeatureId] = useState(FEATURE_ITEMS[0].id);
  const activeFeature = FEATURE_ITEMS.find((f) => f.id === activeFeatureId) || FEATURE_ITEMS[0];

  return (
    <section id="recursos" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-xs uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Funcionalidades</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-cream-strong tracking-tight mb-5">
            O que existe <span className="text-gradient-aurora font-semibold">dentro do app</span>
          </h2>
          <p className="text-cream/75 text-sm sm:text-base leading-relaxed">
            Nada de módulo genérico: cada etapa foi construída para um problema específico de quem
            leva produto da descoberta à entrega.
          </p>
        </div>

        {/* Seletor — rolável no mobile para não quebrar em quatro linhas */}
        <div className="scroll-x flex lg:justify-center gap-2.5 mb-8 sm:mb-12 -mx-4 px-4 sm:mx-0 sm:px-0">
          {FEATURE_ITEMS.map((item) => {
            const Icon = FEATURE_ICON[item.id] || Sparkles;
            const isActive = item.id === activeFeatureId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveFeatureId(item.id)}
                className={`shrink-0 min-h-11 px-4 sm:px-5 py-3 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-accent text-ink-deep shadow-lg shadow-accent/25'
                    : 'bg-cream/5 hover:bg-cream/10 text-cream/75 hover:text-cream-strong border border-cream/8'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.category}</span>
              </button>
            );
          })}
        </div>

        <div className="glass-panel rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="inline-block px-3 py-1 rounded-md bg-accent-soft/50 text-accent-strong text-xs">
                {activeFeature.category}
              </span>

              <h3 className="text-xl sm:text-3xl font-light text-cream-strong leading-tight">
                {activeFeature.title}
              </h3>

              <p className="text-accent-strong font-medium text-sm">{activeFeature.subtitle}</p>

              <p className="text-cream/75 text-sm leading-relaxed">{activeFeature.description}</p>

              <div className="space-y-3 pt-1">
                {activeFeature.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-cream/85 leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden border border-cream/10 bg-ink-deep p-4 sm:p-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                {activeFeature.id === 'lean-inception' && (
                  <div className="relative space-y-3">
                    <div className="flex items-center gap-2 text-xs text-cream/70 pb-3 border-b border-cream/10">
                      <FileUp className="w-4 h-4 text-accent" />
                      <span className="truncate">ata-kickoff.md, edital-2026.md → extraídos</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { t: 'Visão', s: 'ok' },
                        { t: 'Objetivos', s: 'ok' },
                        { t: 'Problema', s: 'ok' },
                        { t: 'Personas', s: 'warn' },
                        { t: 'Funcionalidades', s: 'ok' },
                        { t: 'Critérios', s: 'pend' }
                      ].map((col) => (
                        <div key={col.t} className="p-3 rounded-lg bg-panel border border-cream/8">
                          <span className="block text-[11px] text-muted mb-2">{col.t}</span>
                          <div className="space-y-1.5 mb-2.5">
                            <div className="h-1.5 rounded bg-cream/15" />
                            <div className="h-1.5 w-3/4 rounded bg-cream/10" />
                          </div>
                          {col.s === 'ok' && <Check className="w-3.5 h-3.5 text-ok" />}
                          {col.s === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-warn" />}
                          {col.s === 'pend' && <Clock className="w-3.5 h-3.5 text-muted" />}
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg bg-warn/10 border border-warn/25 text-xs text-warn flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
                      <span>
                        Conflito: a nova ata contradiz a regra de prazo aprovada na versão anterior.
                      </span>
                    </div>
                  </div>
                )}

                {activeFeature.id === 'user-flow' && (
                  <div className="relative space-y-3">
                    <div className="flex flex-wrap gap-1.5 pb-3 border-b border-cream/10">
                      {['Tela', 'Erro', 'Estado vazio', 'Sem permissão', 'Sucesso', 'Externa'].map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded border border-cream/15 text-cream/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { n: 'Busca de bolsas', t: 'Tela', c: 'border-cream/20' },
                        { n: 'Formulário de inscrição', t: 'Tela', c: 'border-cream/20' },
                        { n: 'Consulta à base do MEC', t: 'Externa', c: 'border-info/40' },
                        { n: 'Inscrição enviada', t: 'Sucesso', c: 'border-ok/40' }
                      ].map((node, index) => (
                        <div key={node.n} className="flex items-center gap-2.5">
                          <span className="text-[10px] text-muted w-4 shrink-0">{index + 1}</span>
                          <div
                            className={`flex-1 p-2.5 rounded-lg bg-panel border ${node.c} flex items-center justify-between gap-2`}
                          >
                            <span className="text-xs text-cream/90 truncate">{node.n}</span>
                            <span className="text-[10px] text-muted shrink-0">{node.t}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeFeature.id === 'documentacao' && (
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between text-xs text-cream/70 pb-3 border-b border-cream/10">
                      <span>Gerado da inception e dos fluxos</span>
                      <span className="flex items-center gap-1.5 text-accent-strong">
                        <Printer className="w-3.5 h-3.5" />
                        A4 · PDF
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { t: 'Documento de Visão', v: 'v2', ok: true },
                        { t: 'Documento de Requisitos', v: 'v2', ok: false }
                      ].map((doc) => (
                        <div key={doc.t} className="p-3 rounded-lg bg-panel border border-cream/8">
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            <span className="text-xs text-cream-strong leading-snug">{doc.t}</span>
                            <span className="text-[10px] text-muted shrink-0">{doc.v}</span>
                          </div>
                          <div className="space-y-1.5 mb-2.5">
                            <div className="h-1.5 rounded bg-cream/15" />
                            <div className="h-1.5 rounded bg-cream/10" />
                            <div className="h-1.5 w-2/3 rounded bg-cream/10" />
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${
                              doc.ok
                                ? 'text-ok border-ok/30 bg-ok/10'
                                : 'text-warn border-warn/30 bg-warn/10'
                            }`}
                          >
                            {doc.ok ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                            {doc.ok ? 'Validado' : 'Aguardando validação'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-lg bg-accent-soft/40 border border-accent/25 text-[11px] text-cream/85">
                      Validou os dois? O protótipo é construído a partir deles.
                    </div>
                  </div>
                )}

                {activeFeature.id === 'prototype' && (
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between text-xs text-cream/70 pb-3 border-b border-cream/10">
                      <span>src/screens/BuscaBolsas.tsx</span>
                      <span className="text-accent-strong">Editando: Mobile</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-lg bg-panel border border-cream/8 space-y-1.5">
                        <span className="block text-[10px] text-muted mb-1.5">Camadas</span>
                        {['Cabeçalho', 'Filtro', 'Lista', 'Card'].map((l, i) => (
                          <div
                            key={l}
                            className={`text-[10px] px-1.5 py-1 rounded ${
                              i === 3 ? 'bg-accent-soft/60 text-accent-strong' : 'text-cream/60'
                            }`}
                          >
                            {l}
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-lg bg-ink border border-accent/25 flex flex-col justify-center gap-1.5">
                        <div className="h-1.5 w-2/3 rounded bg-cream/20" />
                        <div className="h-1.5 rounded bg-cream/10" />
                        <div className="h-8 rounded bg-accent/15 border border-accent/25 mt-1" />
                      </div>
                      <div className="p-2.5 rounded-lg bg-panel border border-cream/8 space-y-2">
                        <span className="block text-[10px] text-muted">Propriedades</span>
                        <div className="text-[10px] px-1.5 py-1 rounded bg-ink/60 text-cream/80">
                          padding: 16
                        </div>
                        <div className="text-[10px] px-1.5 py-1 rounded bg-ink/60 text-cream/80 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-accent" />
                          accent
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted">
                      A alteração escreve no código-fonte, com escopo no breakpoint selecionado.
                    </p>
                  </div>
                )}

                {activeFeature.id === 'design-system' && (
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between text-xs text-cream/70 pb-3 border-b border-cream/10">
                      <span>Tokens do sistema</span>
                      <span className="flex items-center gap-1.5 text-accent-strong">
                        <Figma className="w-3.5 h-3.5" />
                        vision-figma.v1
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['#d97a56', '#e0a95c', '#6fbf87', '#8aa5f0'].map((color) => (
                        <div key={color} className="rounded-lg overflow-hidden border border-cream/10">
                          <div className="h-10" style={{ backgroundColor: color }} />
                          <div className="px-1.5 py-1 bg-panel text-[9px] text-muted text-center">
                            {color}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      {['surface.accent', 'text.strong', 'border.subtle'].map((token) => (
                        <div
                          key={token}
                          className="flex items-center justify-between p-2 rounded-lg bg-panel border border-cream/8 text-[11px]"
                        >
                          <span className="text-cream/85">{token}</span>
                          <span className="text-muted">semântico</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-lg bg-accent-soft/40 border border-accent/25 text-[11px] text-cream/85">
                      Editou no design system → reflete em todos os protótipos ligados a ele.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Faixa secundária */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 sm:mt-12">
          {SECONDARY_FEATURES.map((item) => {
            const Icon = SECONDARY_ICON[item.icon] || Sparkles;
            return (
              <div key={item.id} className="glass-card glass-card-hover rounded-2xl p-5">
                <span className="w-10 h-10 rounded-xl bg-accent-soft/50 border border-accent/20 flex items-center justify-center mb-3.5">
                  <Icon className="w-5 h-5 text-accent-strong" />
                </span>
                <h4 className="text-sm font-semibold text-cream-strong mb-2">{item.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
