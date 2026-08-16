import React, { useState, useEffect, useRef } from 'react';
import { Apple, Monitor, Terminal, Download, Menu, X } from 'lucide-react';
import { VisionLogo } from './VisionLogo';
import { APP_VERSION } from '../data/softwareData';
import { availabilityShort, downloadTarget } from '../data/platforms';
import { OperatingSystem, SupportedOS } from '../types';

interface NavbarProps {
  onOpenDownload: (os?: SupportedOS) => void;
  detectedOS: OperatingSystem;
}

const OS_ICON = { Apple, Monitor, Terminal };

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#recursos', label: 'Funcionalidades' },
  { href: '#downloads', label: 'Download' },
  { href: '#biblioteca', label: 'Biblioteca' },
  { href: '#requisitos', label: 'Requisitos' },
  { href: '#faq', label: 'FAQ' }
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenDownload, detectedOS }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha com ESC e trava a rolagem do fundo enquanto o menu está aberto.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const target = downloadTarget(detectedOS);
  const PillIcon = target ? OS_ICON[target.icon] : Download;
  const pillLabel = target
    ? `Pronto para o seu ${target.name}`
    : detectedOS === 'linux'
      ? 'Linux em preparação'
      : 'Publicado para macOS e Windows';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink/90 backdrop-blur-xl border-b border-cream/10 py-3 shadow-2xl shadow-black/40'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3 group shrink-0" aria-label="Vision Design, início">
            <VisionLogo size={36} className="transition-transform duration-300 group-hover:scale-105" />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-lg sm:text-xl text-cream-strong">
                Vision <span className="font-semibold text-accent">Design</span>
              </span>
              <span className="text-[11px] tracking-widest text-muted uppercase mt-1">
                v{target?.version ?? APP_VERSION}
              </span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-sm text-cream/80">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2 whitespace-nowrap hover:text-cream-strong transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            {/* A pílula só cabe a partir de xl — em 1024px ela empurrava o CTA para fora da tela. */}
            <span className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/25 bg-accent-soft/40 text-accent-strong text-xs whitespace-nowrap">
              <PillIcon className="w-3.5 h-3.5" />
              <span>{pillLabel}</span>
            </span>

            {target ? (
              <button
                onClick={() => onOpenDownload(target.os)}
                className="group px-4 xl:px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>{target.ctaLabel}</span>
              </button>
            ) : (
              <a
                href="#downloads"
                className="group px-4 xl:px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm shadow-lg shadow-accent/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>Ver downloads</span>
              </a>
            )}
          </div>

          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="lg:hidden p-3 -mr-1 rounded-lg text-cream/80 hover:text-cream-strong hover:bg-cream/5 transition-colors"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="menu-mobile"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="menu-mobile"
          className="lg:hidden bg-ink/98 backdrop-blur-2xl border-b border-cream/10 mt-3 max-h-[calc(100dvh-5rem)] overflow-y-auto"
        >
          <div className="px-4 sm:px-6 py-6 space-y-5">
            <nav className="flex flex-col text-cream">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3.5 border-b border-cream/5 hover:text-accent-strong transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {target ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDownload(target.os);
                }}
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>
                  Baixar {target.version} para {target.name}
                </span>
              </button>
            ) : (
              <a
                href="#downloads"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-ink-deep font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Ver plataformas disponíveis</span>
              </a>
            )}

            <p className="text-xs text-muted text-center">{availabilityShort(detectedOS)}</p>
          </div>
        </div>
      )}
    </header>
  );
};
