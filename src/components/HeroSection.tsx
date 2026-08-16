import React from 'react';
import {
  Download, Play, Apple, Monitor, HardDrive, Terminal, Palette, Figma, ArrowDown
} from 'lucide-react';
import { APP_VERSION, CATALOG } from '../data/softwareData';
import { availabilityLine, downloadTarget } from '../data/platforms';
import { OperatingSystem, SupportedOS } from '../types';

interface HeroSectionProps {
  onOpenDownload: (os?: SupportedOS) => void;
  detectedOS: OperatingSystem;
}

const OS_ICON = { Apple, Monitor, Terminal };

const STATS = [
  {
    icon: HardDrive,
    value: 'Local-first',
    label: 'Seus arquivos em disco',
    detail: 'Projetos, telas e documentos ficam na sua máquina. A nuvem é opcional.'
  },
  {
    icon: Terminal,
    value: `${CATALOG.agentClis} CLIs`,
    label: 'Agentes reconhecidos',
    detail: 'Usa o Claude Code, Codex, Gemini CLI ou Cursor que você já tem instalado.'
  },
  {
    icon: Palette,
    value: `${CATALOG.designSystems}`,
    label: 'Design systems inclusos',
    detail: `Mais ${CATALOG.skills} skills e ${CATALOG.designTemplates} templates prontos para usar.`
  },
  {
    icon: Figma,
    value: 'Figma',
    label: 'Exportação em camadas',
    detail: 'O design sai do protótipo e entra no Figma como camadas editáveis.'
  }
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDownload, detectedOS }) => {
  /** Nulo quando não há instalador para oferecer: Linux, ou sistema não identificado. */
  const target = downloadTarget(detectedOS);
  const TargetIcon = target ? OS_ICON[target.icon] : null;

  return (
    <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 md:pt-44 md:pb-28 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] pointer-events-none opacity-40 blur-3xl rounded-full bg-gradient-to-r from-accent/25 via-warn/15 to-accent/20 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 rounded-full bg-accent-soft/50 border border-accent/25 backdrop-blur-md mb-7">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
          <span className="text-xs tracking-wider text-accent-strong">VERSÃO {target?.version ?? APP_VERSION}</span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-cream/80">Biblioteca pública e revisão de PR</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-cream-strong max-w-4xl mx-auto leading-[1.15] mb-6">
          Do briefing ao{' '}
          <span className="font-semibold text-gradient-aurora">protótipo funcional</span>
        </h1>

        <p className="text-base sm:text-lg text-cream/75 max-w-2xl mx-auto mb-9 leading-relaxed">
          Envie os documentos e acompanhe: lean inception, fluxo de usuário, telas em React que você
          edita clicando e a documentação de visão e requisitos. Tudo na sua máquina, dirigido pelo
          agente de IA que você já usa.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12">
          {target && TargetIcon ? (
            <button
              onClick={() => onOpenDownload(target.os)}
              className="px-7 py-4 rounded-2xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold shadow-xl shadow-accent/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
            >
              <Download className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
              <span className="text-left">
                <span className="block text-sm leading-tight flex items-center gap-2">
                  {target.ctaLabel}
                  <TargetIcon className="w-4 h-4 opacity-70" />
                </span>
                <span className="block text-[11px] font-medium opacity-70">
                  {target.ctaDetail}
                </span>
              </span>
            </button>
          ) : (
            /* Sem build para o sistema detectado: manda escolher em vez de prometer arquivo. */
            <a
              href="#downloads"
              className="px-7 py-4 rounded-2xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold shadow-xl shadow-accent/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
            >
              <ArrowDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
              <span className="text-left">
                <span className="block text-sm leading-tight">Ver plataformas disponíveis</span>
                <span className="block text-[11px] font-medium opacity-70">
                  macOS e Windows publicados
                </span>
              </span>
            </a>
          )}

          <a
            href="#como-funciona"
            className="px-7 py-4 rounded-2xl bg-cream/5 hover:bg-cream/10 border border-cream/10 text-cream hover:text-cream-strong font-medium backdrop-blur-md transition-all flex items-center justify-center gap-2.5 group"
          >
            <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors shrink-0">
              <Play className="w-4 h-4 text-accent-strong fill-current translate-x-px" />
            </span>
            <span>Ver como funciona</span>
          </a>
        </div>

        <p className="text-xs sm:text-sm text-muted mb-16">
          {availabilityLine(detectedOS)} · Requer um CLI de agente instalado ou a sua chave de modelo
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl relative overflow-hidden"
              >
                <Icon className="absolute top-4 right-4 w-9 h-9 text-accent opacity-10" />
                <div className="text-2xl sm:text-3xl font-light text-gradient-purple mb-1.5">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-cream uppercase tracking-wider mb-1.5">
                  {stat.label}
                </div>
                <div className="text-xs text-muted leading-relaxed">{stat.detail}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
