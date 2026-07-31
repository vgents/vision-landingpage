import React, { useState } from 'react';
import {
  LayoutGrid, GitBranch, FileText, MonitorSmartphone, Check, AlertTriangle,
  Clock, Smartphone, Tablet, Monitor, ArrowRight, FileCheck2, Printer
} from 'lucide-react';
import { APP_VERSION } from '../data/softwareData';

type Stage = 'inception' | 'fluxo' | 'documentacao' | 'prototipo';
type CardStatus = 'aprovado' | 'ressalva' | 'pendente';

const STAGES: { id: Stage; label: string; icon: React.ElementType }[] = [
  { id: 'inception', label: 'Inception', icon: LayoutGrid },
  { id: 'fluxo', label: 'Fluxo', icon: GitBranch },
  { id: 'documentacao', label: 'Documentação', icon: FileText },
  { id: 'prototipo', label: 'Protótipo', icon: MonitorSmartphone }
];

const STATUS_STYLE: Record<CardStatus, { label: string; className: string; icon: React.ElementType }> = {
  aprovado: { label: 'Aprovado', className: 'text-ok border-ok/30 bg-ok/10', icon: Check },
  ressalva: { label: 'Com ressalva', className: 'text-warn border-warn/30 bg-warn/10', icon: AlertTriangle },
  pendente: { label: 'Pendente', className: 'text-muted border-cream/15 bg-cream/5', icon: Clock }
};

const INCEPTION_COLUMNS = [
  {
    title: 'Visão',
    cards: [{ id: 'v1', text: 'Centralizar a inscrição em bolsas de estudo em um só lugar' }]
  },
  {
    title: 'Personas',
    cards: [
      { id: 'p1', text: 'Candidato — busca e se inscreve' },
      { id: 'p2', text: 'Analista — valida documentação' }
    ]
  },
  {
    title: 'Funcionalidades',
    cards: [
      { id: 'f1', text: 'Busca de bolsas por curso e instituição' },
      { id: 'f2', text: 'Envio de documentos comprobatórios' },
      { id: 'f3', text: 'Painel de acompanhamento da inscrição' }
    ]
  },
  {
    title: 'Regras de negócio',
    cards: [
      { id: 'r1', text: 'Inscrição bloqueada após o prazo do edital' },
      { id: 'r2', text: 'Renda familiar per capita define a faixa da bolsa' }
    ]
  }
];

const INITIAL_STATUS: Record<string, CardStatus> = {
  v1: 'aprovado',
  p1: 'aprovado',
  p2: 'ressalva',
  f1: 'aprovado',
  f2: 'aprovado',
  f3: 'pendente',
  r1: 'aprovado',
  r2: 'pendente'
};

const FLOW_NODES = [
  { id: 'n1', name: 'Busca de bolsas', type: 'Tela', persona: 'Candidato' },
  { id: 'n2', name: 'Nenhuma bolsa encontrada', type: 'Estado vazio', persona: 'Candidato' },
  { id: 'n3', name: 'Formulário de inscrição', type: 'Tela', persona: 'Candidato' },
  { id: 'n4', name: 'Consulta à base do MEC', type: 'Externa', persona: 'Candidato' },
  { id: 'n5', name: 'Inscrição enviada', type: 'Sucesso', persona: 'Candidato' },
  { id: 'n6', name: 'Fila de validação', type: 'Tela', persona: 'Analista' },
  { id: 'n7', name: 'Sem permissão para aprovar', type: 'Sem permissão', persona: 'Analista' },
  { id: 'n8', name: 'Falha no envio do documento', type: 'Erro', persona: 'Candidato' }
];

const NODE_TYPE_COLOR: Record<string, string> = {
  'Tela': 'text-cream border-cream/20 bg-cream/5',
  'Erro': 'text-red-300 border-red-400/30 bg-red-400/10',
  'Estado vazio': 'text-muted border-cream/15 bg-cream/5',
  'Sem permissão': 'text-warn border-warn/30 bg-warn/10',
  'Sucesso': 'text-ok border-ok/30 bg-ok/10',
  'Externa': 'text-info border-info/30 bg-info/10'
};

const DOCUMENTS = [
  {
    id: 'visao',
    title: 'Documento de Visão',
    meta: '8 páginas · versão 2',
    sections: ['Contexto e problema', 'Objetivos do produto', 'Personas', 'Escopo e não-escopo']
  },
  {
    id: 'requisitos',
    title: 'Documento de Requisitos',
    meta: '14 páginas · versão 2',
    sections: ['Requisitos funcionais', 'Regras de negócio', 'Critérios de aceite', 'Fluxos cobertos']
  }
];

const BREAKPOINTS = [
  { id: 'mobile', label: 'Mobile', width: '38%', icon: Smartphone, size: '390px' },
  { id: 'tablet', label: 'Tablet', width: '68%', icon: Tablet, size: '834px' },
  { id: 'desktop', label: 'Desktop', width: '100%', icon: Monitor, size: '1440px' }
];

export const InteractiveAppDemo: React.FC = () => {
  const [stage, setStage] = useState<Stage>('inception');
  const [cardStatus, setCardStatus] = useState<Record<string, CardStatus>>(INITIAL_STATUS);
  const [selectedCard, setSelectedCard] = useState('f3');
  const [persona, setPersona] = useState('Todas');
  const [validated, setValidated] = useState<Record<string, boolean>>({ visao: true, requisitos: false });
  const [openDoc, setOpenDoc] = useState('requisitos');
  const [breakpoint, setBreakpoint] = useState('desktop');

  const pendingCount = Object.values(cardStatus).filter((s) => s === 'pendente').length;
  const visibleNodes = persona === 'Todas' ? FLOW_NODES : FLOW_NODES.filter((n) => n.persona === persona);
  const activeBreakpoint = BREAKPOINTS.find((b) => b.id === breakpoint) || BREAKPOINTS[2];
  const allValidated = DOCUMENTS.every((doc) => validated[doc.id]);

  const setStatus = (id: string, status: CardStatus) => {
    setCardStatus((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <section id="como-funciona" className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-xs uppercase tracking-widest mb-4">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>O fluxo, ponta a ponta</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-cream-strong tracking-tight mb-4">
            Quatro etapas, <span className="text-gradient-aurora font-semibold">uma ferramenta só</span>
          </h2>
          <p className="text-cream/75 text-sm sm:text-base leading-relaxed">
            Percorra abaixo as mesmas etapas que o Vision Design executa — da inception aprovada aos
            documentos validados, e deles ao protótipo respondendo em cada breakpoint.
          </p>
        </div>

        <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden">
          {/* Barra de janela */}
          <div className="bg-ink-deep px-4 py-3 border-b border-cream/10 flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-warn/70" />
              <span className="w-3 h-3 rounded-full bg-ok/70" />
            </div>
            <span className="text-xs text-muted truncate hidden sm:block">
              Vision Design · Portal de Bolsas · Versão {APP_VERSION}
            </span>
          </div>

          {/* Abas das etapas — roláveis no mobile */}
          <div className="border-b border-cream/10 bg-panel/60">
            <div className="scroll-x flex items-center gap-1 p-2">
              {STAGES.map((item, index) => {
                const Icon = item.icon;
                const isActive = stage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setStage(item.id)}
                    className={`shrink-0 min-h-11 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-accent text-ink-deep font-semibold'
                        : 'text-cream/70 hover:text-cream-strong hover:bg-cream/5'
                    }`}
                  >
                    <span className={`text-[10px] ${isActive ? 'opacity-60' : 'opacity-40'}`}>
                      {index + 1}
                    </span>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-ink-deep/60 min-h-[26rem]">
            {/* ETAPA 1 — INCEPTION */}
            {stage === 'inception' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-cream/70">
                    Colunas extraídas de <span className="text-cream-strong">edital-2026.md</span> e
                    da ata da reunião de kickoff.
                  </p>
                  <span
                    className={`text-xs px-3 py-1.5 rounded-lg border self-start ${
                      pendingCount > 0
                        ? 'text-warn border-warn/30 bg-warn/10'
                        : 'text-ok border-ok/30 bg-ok/10'
                    }`}
                  >
                    {pendingCount > 0
                      ? `${pendingCount} card(s) pendente(s) — avanço bloqueado`
                      : 'Inception aprovada, pode avançar'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {INCEPTION_COLUMNS.map((column) => (
                    <div key={column.title} className="rounded-xl bg-panel/70 border border-cream/8 p-3">
                      <h4 className="text-[11px] uppercase tracking-wider text-muted mb-2.5">
                        {column.title}
                      </h4>
                      <div className="space-y-2">
                        {column.cards.map((card) => {
                          const status = cardStatus[card.id];
                          const style = STATUS_STYLE[status];
                          const StatusIcon = style.icon;
                          return (
                            <button
                              key={card.id}
                              onClick={() => setSelectedCard(card.id)}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                                selectedCard === card.id
                                  ? 'border-accent/50 bg-accent-soft/40'
                                  : 'border-cream/8 bg-ink/50 hover:border-cream/20'
                              }`}
                            >
                              <span className="block text-xs text-cream/90 leading-snug mb-2">
                                {card.text}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${style.className}`}
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                {style.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-cream/10 bg-panel/70 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <span className="text-xs text-muted">
                    Card selecionado — defina o status para liberar o avanço:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(STATUS_STYLE) as CardStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatus(selectedCard, status)}
                        className={`min-h-11 px-3.5 py-2 rounded-lg text-xs border transition-all ${
                          cardStatus[selectedCard] === status
                            ? STATUS_STYLE[status].className
                            : 'text-cream/60 border-cream/10 hover:border-cream/25'
                        }`}
                      >
                        {STATUS_STYLE[status].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 2 — FLUXO */}
            {stage === 'fluxo' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted mr-1">Filtrar por persona:</span>
                  {['Todas', 'Candidato', 'Analista'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setPersona(item)}
                      className={`min-h-10 px-3.5 py-1.5 rounded-lg text-xs border transition-all ${
                        persona === item
                          ? 'bg-accent text-ink-deep border-accent font-semibold'
                          : 'text-cream/70 border-cream/10 hover:border-cream/25'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {visibleNodes.map((node) => (
                    <div
                      key={node.id}
                      className="rounded-xl bg-panel/70 border border-cream/8 p-3.5 hover:border-accent/30 transition-colors"
                    >
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded border mb-2 ${
                          NODE_TYPE_COLOR[node.type]
                        }`}
                      >
                        {node.type}
                      </span>
                      <p className="text-xs text-cream/90 leading-snug mb-1.5">{node.name}</p>
                      <span className="text-[10px] text-muted">{node.persona}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-accent/25 bg-accent-soft/30 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <span className="text-xs text-cream/80">
                    Fluxo aprovado — as rotas do protótipo passam a apontar para estas telas.
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-accent-strong font-medium shrink-0">
                    Aplicar navegação
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}

            {/* ETAPA 3 — DOCUMENTAÇÃO */}
            {stage === 'documentacao' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-cream/70">
                  Redigidos a partir dos briefings, da inception e dos fluxos. Valide os dois para
                  liberar a geração do protótipo.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {DOCUMENTS.map((doc) => {
                    const isValid = validated[doc.id];
                    const isOpen = openDoc === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isOpen ? 'border-accent/40 bg-accent-soft/25' : 'border-cream/8 bg-panel/70'
                        }`}
                      >
                        <button
                          onClick={() => setOpenDoc(doc.id)}
                          className="w-full text-left flex items-start justify-between gap-3 mb-3"
                        >
                          <span>
                            <span className="block text-sm text-cream-strong font-medium leading-snug">
                              {doc.title}
                            </span>
                            <span className="block text-[11px] text-muted mt-0.5">{doc.meta}</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded border shrink-0 ${
                              isValid
                                ? 'text-ok border-ok/30 bg-ok/10'
                                : 'text-warn border-warn/30 bg-warn/10'
                            }`}
                          >
                            {isValid ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                            {isValid ? 'Validado' : 'Aguardando'}
                          </span>
                        </button>

                        {/* Prévia paginada em A4 */}
                        <div className="rounded-lg bg-ink border border-cream/8 p-3 mb-3 space-y-2">
                          {doc.sections.map((section) => (
                            <div key={section}>
                              <span className="block text-[10px] text-accent-strong mb-1">
                                {section}
                              </span>
                              <div className="space-y-1">
                                <div className="h-1 rounded bg-cream/12" />
                                <div className="h-1 w-4/5 rounded bg-cream/8" />
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted">
                            <Printer className="w-3 h-3" />
                            Paginado em A4, pronto para PDF
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            setValidated((prev) => ({ ...prev, [doc.id]: !prev[doc.id] }))
                          }
                          className={`w-full min-h-11 py-2 rounded-lg text-xs font-medium border transition-all ${
                            isValid
                              ? 'text-cream/70 border-cream/15 hover:border-cream/30'
                              : 'bg-accent text-ink-deep border-accent hover:bg-accent-strong font-semibold'
                          }`}
                        >
                          {isValid ? 'Revogar validação' : 'Validar documento'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div
                  className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between transition-all ${
                    allValidated
                      ? 'border-accent/25 bg-accent-soft/30'
                      : 'border-warn/25 bg-warn/10'
                  }`}
                >
                  <span className="text-xs text-cream/80 flex items-start gap-2">
                    <FileCheck2
                      className={`w-4 h-4 shrink-0 mt-px ${allValidated ? 'text-accent-strong' : 'text-warn'}`}
                    />
                    {allValidated
                      ? 'Documentos validados — o protótipo será construído a partir deles.'
                      : 'Enquanto houver documento sem validação, o protótipo não é gerado.'}
                  </span>
                  {allValidated && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-accent-strong font-medium shrink-0">
                      Gerar protótipo
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ETAPA 4 — PROTÓTIPO */}
            {stage === 'prototipo' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted mr-1">Editar no breakpoint:</span>
                  {BREAKPOINTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setBreakpoint(item.id)}
                        className={`min-h-10 px-3.5 py-1.5 rounded-lg text-xs border transition-all flex items-center gap-1.5 ${
                          breakpoint === item.id
                            ? 'bg-accent text-ink-deep border-accent font-semibold'
                            : 'text-cream/70 border-cream/10 hover:border-cream/25'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {item.label}
                      </button>
                    );
                  })}
                  <span className="text-[11px] text-muted ml-auto">{activeBreakpoint.size}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-3 rounded-xl bg-panel/70 border border-cream/8 p-3">
                    <h4 className="text-[11px] uppercase tracking-wider text-muted mb-2.5">
                      Camadas
                    </h4>
                    <div className="space-y-1 text-xs">
                      {['Cabeçalho', 'Filtro de busca', 'Lista de bolsas', 'Card de bolsa', 'Rodapé'].map(
                        (layer, index) => (
                          <div
                            key={layer}
                            className={`px-2.5 py-2 rounded-lg ${
                              index === 3
                                ? 'bg-accent-soft/50 text-accent-strong border border-accent/30'
                                : 'text-cream/75 hover:bg-cream/5'
                            }`}
                            style={{ paddingLeft: `${index === 3 ? 20 : 10}px` }}
                          >
                            {layer}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-xl bg-ink border border-cream/8 p-4 flex flex-col items-center justify-center min-h-[15rem]">
                    <div
                      className="rounded-lg border border-accent/25 bg-panel p-4 transition-all duration-500 w-full"
                      style={{ maxWidth: activeBreakpoint.width }}
                    >
                      <div className="h-2.5 w-2/3 rounded bg-cream/20 mb-3" />
                      <div className="h-2 w-full rounded bg-cream/10 mb-2" />
                      <div className="h-2 w-4/5 rounded bg-cream/10 mb-4" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 rounded bg-accent/15 border border-accent/25" />
                        <div className="h-12 rounded bg-cream/5 border border-cream/10" />
                      </div>
                    </div>
                    <span className="text-[11px] text-muted mt-3">
                      Projeto React + Vite renderizado no canvas
                    </span>
                  </div>

                  <div className="lg:col-span-3 rounded-xl bg-panel/70 border border-cream/8 p-3">
                    <h4 className="text-[11px] uppercase tracking-wider text-muted mb-2.5">
                      Propriedades
                    </h4>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="block text-[11px] text-muted mb-1">Espaçamento</span>
                        <div className="px-2.5 py-2 rounded-lg bg-ink/60 border border-cream/10 text-cream/85">
                          16 px
                        </div>
                      </div>
                      <div>
                        <span className="block text-[11px] text-muted mb-1">Token de cor</span>
                        <div className="px-2.5 py-2 rounded-lg bg-ink/60 border border-cream/10 text-cream/85 flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded bg-accent shrink-0" />
                          surface.accent
                        </div>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed pt-1">
                        A alteração vale só para {activeBreakpoint.label.toLowerCase()} e escreve
                        direto no código-fonte.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
