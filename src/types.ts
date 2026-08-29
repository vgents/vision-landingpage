export type OperatingSystem = 'windows' | 'mac' | 'linux' | 'unknown';

/** Sistemas que têm um perfil de plataforma, publicados ou não. */
export type SupportedOS = 'windows' | 'mac' | 'linux';

export type DownloadStatus = 'available' | 'coming-soon';

/**
 * Tudo o que muda de um sistema para outro. Fonte única do conteúdo específico
 * de plataforma — sem isso as mesmas strings se espalham pelos componentes e
 * cada um adapta por conta própria.
 */
export interface PlatformProfile {
  os: SupportedOS;
  /** Rótulo curto, para botões e frases: "macOS", "Windows", "Linux". */
  name: string;
  /** Nome com a versão mínima, para cards e requisitos. */
  fullName: string;
  icon: 'Apple' | 'Monitor' | 'Terminal';
  status: DownloadStatus;
  fileFormat: string;
  arch: string;
  requirements: string;
  /** Rótulo do CTA principal — some do padrão "Baixar para X" quando não há build. */
  ctaLabel: string;
  /** Preenchidos apenas quando status === 'available'. */
  version?: string;
  fileSize?: string;
  url?: string;
  /** Linha secundária do CTA do hero, ex. "x64 · 227 MB". */
  ctaDetail?: string;
  installSteps?: string[];
  /** Aviso do sistema na primeira execução: Gatekeeper no mac, SmartScreen no Windows. */
  firstRun?: { title: string; note: string };
  /** Exibido no lugar do CTA e dos requisitos quando ainda não há build publicado. */
  comingSoonNote?: string;
  /** Nota da linha de espaço em disco nos requisitos. */
  diskNote?: string;
  /** Versões no ar para este sistema: duas em cada sistema publicado, nenhuma no Linux. */
  releases: ReleaseOption[];
}

export interface ReleaseOption {
  id: 'atual' | 'estavel';
  label: string;
  version: string;
  fileSize: string;
  tagline: string;
  description: string;
  url: string;
  /** Se a atualização automática aponta para esta versão. */
  autoUpdate: boolean;
}

export interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  category: string;
}

export interface SecondaryFeature {
  id: string;
  title: string;
  description: string;
  icon: 'GitPullRequest' | 'Blocks' | 'Languages' | 'HardDrive';
}

export interface LibraryHighlight {
  id: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  /** Quando presente, a pergunta só aparece para quem está nesse sistema. */
  os?: SupportedOS;
}

export interface RequirementItem {
  label: string;
  value: string;
  note?: string;
  icon: 'Monitor' | 'Cpu' | 'HardDrive' | 'Terminal' | 'KeyRound';
}
