import React from 'react';
import {
  Monitor, Apple, Terminal, Download, Cpu, HardDrive,
  RefreshCw, ShieldAlert, Clock, History
} from 'lucide-react';
import { DOWNLOAD_OPTIONS, RELEASES, APP_VERSION } from '../data/softwareData';
import { OperatingSystem } from '../types';

interface DownloadCenterProps {
  onOpenDownload: (os?: 'windows' | 'mac' | 'linux') => void;
  detectedOS: OperatingSystem;
}

const OS_ICON = { windows: Monitor, mac: Apple, linux: Terminal };

export const DownloadCenter: React.FC<DownloadCenterProps> = ({ onOpenDownload, detectedOS }) => {
  return (
    <section id="downloads" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-xs uppercase tracking-widest mb-4">
            <Download className="w-3.5 h-3.5" />
            <span>Versão {APP_VERSION}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-cream-strong tracking-tight mb-5">
            Baixe o <span className="text-gradient-aurora font-semibold">Vision Design</span>
          </h2>
          <p className="text-cream/75 text-sm sm:text-base leading-relaxed">
            O instalador do macOS é o que está publicado hoje, em duas versões — a atual e a
            anterior, para o caso de precisar voltar atrás. Linux e Windows já existem no código e
            entram assim que forem publicados no mesmo ritmo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 mb-10 sm:mb-14">
          {DOWNLOAD_OPTIONS.map((opt) => {
            const Icon = OS_ICON[opt.os];
            const isAvailable = opt.status === 'available';
            const isDetected = detectedOS === opt.os;

            return (
              <div
                key={opt.id}
                className={`glass-card rounded-3xl p-5 sm:p-7 flex flex-col relative transition-all duration-300 ${
                  isAvailable
                    ? 'border-accent/40 shadow-2xl shadow-accent/10 glass-card-hover'
                    : 'opacity-70'
                }`}
              >
                {isAvailable && isDetected && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-ink-deep text-[11px] font-bold shadow-lg whitespace-nowrap">
                    Seu sistema
                  </span>
                )}

                <div className="flex items-center justify-between mb-5">
                  <span className="w-12 h-12 rounded-2xl bg-cream/5 border border-cream/10 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${isAvailable ? 'text-accent-strong' : 'text-muted'}`} />
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md border ${
                      isAvailable
                        ? 'bg-ok/10 text-ok border-ok/25'
                        : 'bg-cream/5 text-muted border-cream/10'
                    }`}
                  >
                    {isAvailable ? `v${opt.version}` : 'Em breve'}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-cream-strong mb-4">{opt.osName}</h3>

                <div className="space-y-2 mb-5 text-xs text-cream/75">
                  <div className="flex items-start gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span>
                      {opt.fileFormat}
                      {opt.fileSize ? ` · ${opt.fileSize}` : ''}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Cpu className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span>{opt.arch}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-ink-deep/70 border border-cream/8 text-xs text-muted mb-5 leading-relaxed flex-1">
                  <span className="block text-cream/85 font-medium mb-1">
                    {isAvailable ? 'Requisitos' : 'Situação'}
                  </span>
                  {isAvailable ? opt.requirements : opt.comingSoonNote}
                </div>

                {isAvailable ? (
                  <button
                    onClick={() => onOpenDownload(opt.os)}
                    className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-colors flex items-center justify-center gap-2 group"
                  >
                    <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                    <span>Baixar para {opt.os === 'mac' ? 'macOS' : opt.osName}</span>
                  </button>
                ) : (
                  <span className="w-full py-3.5 rounded-xl bg-cream/5 border border-cream/10 text-muted font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                    <Clock className="w-4 h-4" />
                    Em preparação
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Duas versões sempre no ar: a atual e o recuo */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-medium text-cream-strong mb-2">
              Duas versões, sempre disponíveis
            </h3>
            <p className="text-xs sm:text-sm text-muted max-w-2xl mx-auto leading-relaxed">
              Se algo quebrar na versão atual, você não fica preso: a anterior continua no ar para
              instalar por cima, a qualquer momento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RELEASES.map((release) => (
              <div
                key={release.id}
                className={`glass-card rounded-2xl p-5 flex flex-col ${
                  release.autoUpdate ? 'border-accent/35' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        release.autoUpdate ? 'bg-accent-soft/60' : 'bg-cream/5 border border-cream/10'
                      }`}
                    >
                      {release.autoUpdate ? (
                        <RefreshCw className="w-4 h-4 text-accent-strong" />
                      ) : (
                        <History className="w-4 h-4 text-muted" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-cream-strong leading-tight">
                        {release.label}
                      </span>
                      <span className="block text-[11px] text-muted mt-0.5">
                        {release.tagline}
                      </span>
                    </span>
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md border shrink-0 ${
                      release.autoUpdate
                        ? 'bg-ok/10 text-ok border-ok/25'
                        : 'bg-cream/5 text-muted border-cream/10'
                    }`}
                  >
                    v{release.version}
                  </span>
                </div>

                <p className="text-xs text-muted leading-relaxed mb-4 flex-1">
                  {release.description}
                </p>

                <a
                  href={release.url}
                  download
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    release.autoUpdate
                      ? 'bg-accent hover:bg-accent-strong text-ink-deep shadow-lg shadow-accent/20'
                      : 'bg-cream/5 hover:bg-cream/10 border border-cream/15 text-cream'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Baixar {release.version} · {release.fileSize}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl p-5 flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-accent-soft/50 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-accent-strong" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-cream-strong mb-1.5">
                A atualização automática sempre vai para a atual
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                O app consulta o feed de releases e se atualiza sozinho para a versão mais recente.
                Se você voltar para a estável, a atualização automática vai trazê-lo de volta à
                atual na sequência.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-warn/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-warn" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-cream-strong mb-1.5">
                Aviso do Gatekeeper na primeira abertura
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                A build é assinada com identidade própria, não notarizada pela Apple. Na primeira
                vez, abra pelo botão direito → "Abrir", ou libere em Privacidade e Segurança.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
