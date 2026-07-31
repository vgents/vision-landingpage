import React from 'react';
import { Library, Copy, Check, Users, Globe } from 'lucide-react';
import { LIBRARY_HIGHLIGHTS } from '../data/softwareData';

/**
 * Cards ilustrativos: representam a grade da Biblioteca sem forjar projetos,
 * autores ou métricas que não existem.
 */
const SHOWCASE = [
  { title: 'Portal de bolsas', meta: 'Inception · Fluxos · 6 telas', scope: 'Público' },
  { title: 'App de agendamento', meta: 'Fluxos · 9 telas · Documentos', scope: 'Público' },
  { title: 'Painel administrativo', meta: 'Inception · 12 telas', scope: 'Organização' }
];

export const PublicLibrarySection: React.FC = () => {
  return (
    <section id="biblioteca" className="py-16 sm:py-24 relative bg-ink-deep/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-xs uppercase tracking-widest mb-4">
            <Library className="w-3.5 h-3.5" />
            <span>Biblioteca</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-cream-strong tracking-tight mb-5">
            Comece de um projeto que{' '}
            <span className="text-gradient-aurora font-semibold">já existe</span>
          </h2>
          <p className="text-cream/75 text-sm sm:text-base leading-relaxed">
            Projetos publicados ficam disponíveis para qualquer pessoa copiar para o ambiente local
            dela. Você decide o que expor — e para quem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Grade ilustrativa */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 scroll-x">
                <span className="shrink-0 px-3 py-1.5 rounded-lg bg-accent text-ink-deep text-xs font-semibold">
                  Bibliotecas
                </span>
                <span className="shrink-0 px-3 py-1.5 rounded-lg text-cream/70 text-xs border border-cream/10">
                  Meus projetos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SHOWCASE.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-cream/10 bg-panel overflow-hidden group hover:border-accent/30 transition-colors"
                  >
                    {/* Thumbnail: composição tipográfica, não foto de banco de imagens */}
                    <div className="h-28 bg-gradient-to-br from-accent-soft/60 to-ink flex items-center justify-center border-b border-cream/8 p-3">
                      <div className="w-full space-y-1.5">
                        <div className="h-1.5 w-1/2 rounded bg-accent/40" />
                        <div className="h-1.5 rounded bg-cream/15" />
                        <div className="h-1.5 w-3/4 rounded bg-cream/10" />
                        <div className="h-6 w-full rounded bg-cream/5 border border-cream/10 mt-2" />
                      </div>
                    </div>

                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-sm text-cream-strong font-medium leading-tight">
                          {item.title}
                        </h4>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                            item.scope === 'Público'
                              ? 'text-ok border-ok/25 bg-ok/10'
                              : 'text-info border-info/25 bg-info/10'
                          }`}
                        >
                          {item.scope}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mb-3">{item.meta}</p>
                      <span className="inline-flex items-center gap-1.5 text-xs text-accent-strong">
                        <Copy className="w-3.5 h-3.5" />
                        Copiar para o meu local
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted text-center mt-4">
                Representação da interface do app — não são projetos reais publicados.
              </p>
            </div>
          </div>

          {/* Explicação da feature */}
          <div className="lg:col-span-5 space-y-3">
            {LIBRARY_HIGHLIGHTS.map((item) => (
              <div key={item.id} className="glass-card glass-card-hover rounded-2xl p-5 flex gap-3.5">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-cream-strong mb-1.5">{item.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-1">
              <span className="inline-flex items-center gap-2 text-xs text-cream/70 px-3 py-2 rounded-lg bg-cream/5 border border-cream/10">
                <Globe className="w-3.5 h-3.5 text-accent" />
                Público
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-cream/70 px-3 py-2 rounded-lg bg-cream/5 border border-cream/10">
                <Users className="w-3.5 h-3.5 text-accent" />
                Restrito à organização
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
