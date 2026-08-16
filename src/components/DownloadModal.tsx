import React, { useEffect, useRef } from 'react';
import { X, Download, Apple, Terminal, Monitor, ShieldAlert, Clock } from 'lucide-react';
import { PLATFORM_BY_OS, PUBLISHED } from '../data/platforms';
import { SupportedOS } from '../types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOS: SupportedOS;
}

const OS_ICON = { Apple, Monitor, Terminal };

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, selectedOS }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const option = PLATFORM_BY_OS[selectedOS];
  const isAvailable = option.status === 'available';
  const Icon = OS_ICON[option.icon];
  /** A versão de recuo só existe onde há mais de uma no ar. */
  const fallback = option.releases[1];

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Mantém o foco dentro do diálogo enquanto ele estiver aberto.
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-download"
        onClick={(event) => event.stopPropagation()}
        className="glass-panel rounded-3xl border border-cream/10 max-w-lg w-full shadow-2xl relative bg-panel max-h-[90dvh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-panel/95 backdrop-blur-md px-5 sm:px-7 pt-6 pb-4 border-b border-cream/10 flex items-start gap-3.5">
          <span className="w-11 h-11 rounded-2xl bg-accent-soft/50 border border-accent/25 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-accent-strong" />
          </span>

          <div className="flex-1 min-w-0">
            <span className="text-xs text-accent-strong uppercase tracking-wider block">
              {isAvailable ? 'Instalação' : 'Ainda não publicado'}
            </span>
            <h3 id="titulo-download" className="text-lg font-medium text-cream-strong">
              Vision Design {isAvailable ? option.version : ''}
            </h3>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-full bg-cream/5 hover:bg-cream/10 text-muted hover:text-cream-strong transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-7 py-6 space-y-5">
          {isAvailable ? (
            <>
              <div className="p-4 rounded-2xl bg-ink-deep/70 border border-cream/8 flex items-center justify-between gap-3 text-xs">
                <span className="text-cream/80">{option.fileFormat}</span>
                <span className="text-accent-strong font-medium">{option.fileSize}</span>
              </div>

              <div>
                <h4 className="text-xs uppercase text-muted tracking-wider mb-3">
                  Passos de instalação
                </h4>
                <ol className="space-y-2.5">
                  {(option.installSteps ?? []).map((step, index) => (
                    <li key={step} className="flex items-start gap-3 text-sm text-cream/85">
                      <span className="w-6 h-6 rounded-full bg-accent-soft/60 text-accent-strong text-xs flex items-center justify-center shrink-0 mt-px">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-warn/10 border border-warn/25 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                <p className="text-xs text-cream/80 leading-relaxed">{option.firstRun?.note}</p>
              </div>

              <div className="space-y-2.5">
                <a
                  href={option.url}
                  download
                  className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar o instalador ({option.fileSize})
                </a>
                <p className="text-center text-xs text-soft pt-1 leading-relaxed">
                  {fallback ? (
                    <>
                      Precisa voltar atrás? A versão {fallback.version} continua disponível{' '}
                      <a
                        href="#downloads"
                        onClick={onClose}
                        className="text-muted hover:text-accent-strong underline underline-offset-2 transition-colors"
                      >
                        na central de downloads
                      </a>
                      .
                    </>
                  ) : (
                    <>
                      Esta é a primeira versão de {option.name} publicada, então ainda não há uma
                      anterior para recuar. A partir da próxima, as duas ficam no ar.
                    </>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-cream/5 border border-cream/10 flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                <p className="text-sm text-cream/80 leading-relaxed">{option.comingSoonNote}</p>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Publicados hoje: {PUBLISHED.map((p) => p.fullName).join(' e ')}.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-cream/5 hover:bg-cream/10 border border-cream/10 text-cream font-medium text-sm transition-colors"
              >
                Entendi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
