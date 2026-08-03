import React from 'react';
import { Download, Apple, Monitor, Terminal, HardDrive } from 'lucide-react';
import { VisionLogo } from './VisionLogo';
import { APP_VERSION } from '../data/softwareData';
import { PUBLISHED, downloadTarget } from '../data/platforms';
import { OperatingSystem, SupportedOS } from '../types';

interface FooterProps {
  onOpenDownload: (os?: SupportedOS) => void;
  detectedOS: OperatingSystem;
}

const OS_ICON = { Apple, Monitor, Terminal };

const PRODUCT_LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#recursos', label: 'Funcionalidades' },
  { href: '#biblioteca', label: 'Biblioteca' }
];

const SUPPORT_LINKS = [
  { href: '#downloads', label: 'Download' },
  { href: '#requisitos', label: 'Requisitos' },
  { href: '#faq', label: 'Perguntas frequentes' }
];

export const Footer: React.FC<FooterProps> = ({ onOpenDownload, detectedOS }) => {
  const target = downloadTarget(detectedOS);
  const PlatformIcon = target ? OS_ICON[target.icon] : Download;
  const platformChip = target ? target.fullName : 'macOS e Windows';

  return (
    <footer className="relative bg-ink-deep border-t border-cream/10 pt-14 pb-10 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <VisionLogo size={34} />
              <span className="font-heading text-xl text-cream-strong">
                Vision <span className="font-semibold text-accent">Design</span>
              </span>
            </div>

            <p className="text-muted text-sm max-w-sm leading-relaxed">
              Do documento à tela navegável, na sua máquina. Lean inception, fluxo de usuário,
              protótipo React editável e documentação — dirigidos pelo agente de IA que você já usa.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream/5 border border-cream/10 text-xs text-cream/70">
                <HardDrive className="w-3.5 h-3.5 text-accent" />
                Local-first
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream/5 border border-cream/10 text-xs text-cream/70">
                <PlatformIcon className="w-3.5 h-3.5 text-accent" />
                {platformChip}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase text-cream-strong font-semibold tracking-wider">
              Produto
            </h4>
            <ul className="space-y-2.5 text-cream/70">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block py-2 hover:text-accent-strong transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase text-cream-strong font-semibold tracking-wider">
              Instalação
            </h4>
            <ul className="space-y-2.5 text-cream/70">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block py-2 hover:text-accent-strong transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {target ? (
              <button
                onClick={() => onOpenDownload(target.os)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar {APP_VERSION} para {target.name}
              </button>
            ) : (
              <a
                href="#downloads"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Ver downloads
              </a>
            )}
          </div>
        </div>

        <div className="pt-7 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-soft">
          <span>© {new Date().getFullYear()} Vision Design</span>
          <span>
            Versão {APP_VERSION} · {PUBLISHED.map((p) => p.name).join(' e ')} · Linux em preparação
          </span>
        </div>
      </div>
    </footer>
  );
};
