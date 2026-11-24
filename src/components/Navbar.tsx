import React, { useState, useEffect, useRef } from 'react';
import { Apple, Monitor, Terminal, Download, Menu, X } from 'lucide-react';
import { VisionLogo } from './VisionLogo';
import { APP_VERSION } from '../data/softwareData';
import { availabilityShort, downloadTarget } from '../data/platforms';
import { OperatingSystem, SupportedOS } from '../types';
import { handleLinkClick } from '../lib/router';
import { ACCOUNT_COPY } from '../data/account';
import { signOut } from '../lib/account';
import { useSignedIn } from '../lib/useAccount';

interface NavbarProps {
  onOpenDownload: (os?: SupportedOS) => void;
  detectedOS: OperatingSystem;
}

const OS_ICON = { Apple, Monitor, Terminal };

const NAV_LINKS = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#recursos', label: 'Funcionalidades' },
  { href: '/#downloads', label: 'Download' },
  { href: '/#biblioteca', label: 'Biblioteca' },
  { href: '/#requisitos', label: 'Requisitos' },
  { href: '/planos', label: 'Planos' },
  { href: '/#faq', label: 'FAQ' }
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenDownload, detectedOS }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const signedIn = useSignedIn();
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
    : 'Publicado para macOS, Windows e Linux';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink/85 backdrop-blur-xl backdrop-saturate-150 border-b border-cream/10 py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <a
            href="/"
            onClick={(event) => handleLinkClick(event, '/')}
            className="flex items-center gap-3 group shrink-0" aria-label="Vision Design, início">
            <VisionLogo size={36} className="transition-transform duration-300 group-hover:scale-105" />
            <span className="flex flex-col leading-none">
              <span className="font-heading font-extrabold tracking-[-0.03em] text-lg sm:text-xl text-cream-strong">
                Vision <span className="font-extrabold text-accent">Design</span>
              </span>
              <span className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase mt-1">
                v{target?.version ?? APP_VERSION}
              </span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-sm font-semibold text-cream">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleLinkClick(event, link.href)}
                className="px-2 xl:px-3 py-2 rounded-lg whitespace-nowrap hover:bg-ink-deep hover:text-cream-strong transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            {/* A pílula só cabe a partir de 2xl — com a Inter (mais larga) ela empurrava o CTA para fora em 1440px. */}
            <span className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-cream/10 bg-panel shadow-sm text-cream text-xs font-semibold whitespace-nowrap">
              <PillIcon className="w-3.5 h-3.5 text-ok" />
              <span>{pillLabel}</span>
            </span>

            {signedIn ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-accent hover:bg-accent-soft transition-colors whitespace-nowrap"
              >
                {ACCOUNT_COPY.navLogout}
              </button>
            ) : (
              <a
                href="/entrar"
                onClick={(event) => handleLinkClick(event, '/entrar')}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-accent hover:bg-accent-soft transition-colors whitespace-nowrap"
              >
                {ACCOUNT_COPY.navLogin}
              </a>
            )}

            {target ? (
              <button
                onClick={() => onOpenDownload(target.os)}
                className="group px-4 xl:px-5 py-2.5 rounded-[10px] bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm transition-all active:translate-y-px flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>{target.ctaLabel}</span>
              </button>
            ) : (
              <a
                href="/#downloads"
                onClick={(event) => handleLinkClick(event, '/#downloads')}
                className="group px-4 xl:px-5 py-2.5 rounded-[10px] bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm transition-all active:translate-y-px flex items-center gap-2 whitespace-nowrap"
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
                  onClick={(event) => {
                    setMobileMenuOpen(false);
                    handleLinkClick(event, link.href);
                  }}
                  className="py-3.5 border-b border-cream/5 hover:text-accent-strong transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {signedIn ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void signOut();
                }}
                className="w-full py-3 text-left text-cream hover:text-accent-strong transition-colors"
              >
                {ACCOUNT_COPY.navLogout}
              </button>
            ) : (
              <a
                href="/entrar"
                onClick={(event) => {
                  setMobileMenuOpen(false);
                  handleLinkClick(event, '/entrar');
                }}
                className="block py-3 text-cream hover:text-accent-strong transition-colors"
              >
                {ACCOUNT_COPY.navLogin}
              </a>
            )}

            {target ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDownload(target.os);
                }}
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>
                  Baixar {target.version} para {target.name}
                </span>
              </button>
            ) : (
              <a
                href="/#downloads"
                onClick={(event) => {
                  setMobileMenuOpen(false);
                  handleLinkClick(event, '/#downloads');
                }}
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-colors"
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
