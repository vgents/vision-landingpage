export type OperatingSystem = 'windows' | 'mac' | 'linux' | 'unknown';

export type DownloadStatus = 'available' | 'coming-soon';

export interface DownloadOption {
  id: string;
  os: 'windows' | 'mac' | 'linux';
  osName: string;
  status: DownloadStatus;
  /** Só preenchido quando status === 'available'. */
  version?: string;
  fileSize?: string;
  fileFormat: string;
  arch: string;
  requirements: string;
  /** Texto exibido no lugar do CTA quando ainda não há build publicado. */
  comingSoonNote?: string;
  badge?: string;
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
}

export interface RequirementItem {
  label: string;
  value: string;
  note?: string;
  icon: 'Monitor' | 'Cpu' | 'HardDrive' | 'Terminal' | 'KeyRound';
}
