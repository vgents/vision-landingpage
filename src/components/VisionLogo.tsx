import React from 'react';

interface VisionLogoProps {
  /** Aresta do quadrado em px. */
  size?: number;
  className?: string;
}

/**
 * Marca do Vision Design: roda de oito segmentos coloridos ao redor de uma íris
 * azul-marinho com dois catchlights — o olho que enxerga o produto antes dele
 * existir. Reproduz o ícone do aplicativo em vetor, sem a placa de fundo.
 *
 * Os divisores brancos ficam deslocados 8° dos eixos, como no ícone original.
 */

/** Setores em sentido horário a partir do topo. Raio externo 30.1, centro 32,32. */
const SEGMENTS: ReadonlyArray<readonly [color: string, path: string]> = [
  ['#F85D2D', 'M32 32 L13.89 7.96 A30.1 30.1 0 0 1 36.19 2.19 Z'],
  ['#ED0567', 'M32 32 L36.19 2.19 A30.1 30.1 0 0 1 56.04 13.89 Z'],
  ['#735EBE', 'M32 32 L56.04 13.89 A30.1 30.1 0 0 1 61.81 36.19 Z'],
  ['#2483ED', 'M32 32 L61.81 36.19 A30.1 30.1 0 0 1 50.11 56.04 Z'],
  ['#01BFE8', 'M32 32 L50.11 56.04 A30.1 30.1 0 0 1 27.81 61.81 Z'],
  ['#33D46C', 'M32 32 L27.81 61.81 A30.1 30.1 0 0 1 7.96 50.11 Z'],
  ['#91C447', 'M32 32 L7.96 50.11 A30.1 30.1 0 0 1 2.19 27.81 Z'],
  ['#F8BC26', 'M32 32 L2.19 27.81 A30.1 30.1 0 0 1 13.89 7.96 Z'],
];

export const VisionLogo: React.FC<VisionLogoProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-label="Vision Design"
    className={className}
  >
    {/* Base branca: vira o anel externo sob o stroke dos setores. */}
    <circle cx="32" cy="32" r="31" fill="#fff" />

    <g stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
      {SEGMENTS.map(([color, path]) => (
        <path key={color} d={path} fill={color} />
      ))}
    </g>

    <circle cx="32" cy="32" r="17.8" fill="#fff" />
    <circle cx="32" cy="32" r="16" fill="#001C3B" />
    <circle cx="38.11" cy="25.31" r="4.62" fill="#fff" />
    <circle cx="26.56" cy="40.92" r="2.81" fill="#fff" />
  </svg>
);
