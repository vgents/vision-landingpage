import React from 'react';

interface VisionLogoProps {
  /** Aresta do quadrado em px. */
  size?: number;
  className?: string;
}

/**
 * Marca do Vision Design: quatro cantos de crop mark (enquadramento) com um
 * asterisco de oito pontas no centro. Reproduz apps/web/public/logo.svg do
 * repo do produto, com a moldura em currentColor para funcionar sobre fundo
 * escuro — no original ela é #1F1B16, pensada para fundo claro.
 */
export const VisionLogo: React.FC<VisionLogoProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="Vision Design"
    className={className}
  >
    <g stroke="currentColor" strokeWidth="3.4" strokeLinecap="square" fill="none">
      <path d="M10 24 L10 10 L24 10" />
      <path d="M40 10 L54 10 L54 24" />
      <path d="M54 40 L54 54 L40 54" />
      <path d="M24 54 L10 54 L10 40" />
    </g>
    <g stroke="#d97a56" strokeWidth="3" strokeLinecap="round">
      <line x1="32" y1="20" x2="32" y2="44" />
      <line x1="20" y1="32" x2="44" y2="32" />
      <line x1="23.51" y1="23.51" x2="40.49" y2="40.49" />
      <line x1="40.49" y1="23.51" x2="23.51" y2="40.49" />
    </g>
  </svg>
);
