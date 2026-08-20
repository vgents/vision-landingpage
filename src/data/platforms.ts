import { OperatingSystem, PlatformProfile, RequirementItem, SupportedOS } from '../types';
import { CATALOG, RELEASE_FEED, RELEASES } from './softwareData';

/**
 * Perfis de plataforma: o conteúdo do site que muda conforme o sistema do
 * visitante. Os componentes leem daqui em vez de embutir texto de macOS.
 *
 * O que está publicado hoje: macOS e Windows, cada um com duas versões no ar
 * (a atual e a anterior, como recuo) e cada um no seu próprio número — ver
 * `RELEASES`. O Linux tem build no código, mas ainda sem binário publicado.
 */

const artifactUrl = (version: string, file: string) =>
  `${RELEASE_FEED}/stable/versions/${version}/vision-design-${version}-${file}`;

const dmgUrl = (version: string) => artifactUrl(version, 'mac-arm64.dmg');
const exeUrl = (version: string) => artifactUrl(version, 'win-x64.exe');

/**
 * Tamanhos conferidos no Content-Length de cada artefato publicado, em MiB
 * arredondado. Cada linha é de uma versão específica: ao trocar uma versão em
 * `RELEASES`, meça o arquivo novo em vez de reaproveitar o número antigo.
 */
const SIZES = {
  /** 0.8.36 */ macAtual: '281 MB',
  /** 0.8.35 */ macAnterior: '281 MB',
  /** 0.8.32 */ winAtual: '224 MB',
  /** 0.8.30 */ winAnterior: '223 MB'
};

const AI_ENGINE_STEP =
  'Configure o motor de IA: o app procura os CLIs de agente instalados, ou você informa a sua chave de modelo.';

const MAC: PlatformProfile = {
  os: 'mac',
  name: 'macOS',
  fullName: 'macOS 12 Monterey ou superior',
  icon: 'Apple',
  status: 'available',
  version: RELEASES.mac.current,
  fileSize: SIZES.macAtual,
  fileFormat: 'Imagem .DMG',
  arch: 'Apple Silicon (M1–M4) e Intel',
  url: dmgUrl(RELEASES.mac.current),
  requirements: `macOS 12.0+ · ~1 GB livres em disco · um CLI de agente instalado ou chave própria de modelo`,
  ctaLabel: 'Baixar para macOS',
  ctaDetail: `Apple Silicon e Intel · ${SIZES.macAtual}`,
  diskNote: `Instalador de ${SIZES.macAtual}, mais os seus projetos`,
  installSteps: [
    'Abra o arquivo .dmg baixado.',
    'Arraste o ícone do Vision Design para a pasta Aplicações.',
    'Na primeira abertura, clique com o botão direito no app e escolha "Abrir" — o macOS pede confirmação porque a build usa assinatura própria.',
    AI_ENGINE_STEP
  ],
  firstRun: {
    title: 'Aviso do Gatekeeper na primeira abertura',
    note: 'A build é assinada com identidade própria, não notarizada pela Apple. Na primeira vez, abra pelo botão direito → "Abrir", ou libere em Privacidade e Segurança.'
  },
  releases: [
    {
      id: 'atual',
      label: 'Atual',
      version: RELEASES.mac.current,
      fileSize: SIZES.macAtual,
      tagline: 'Alvo da atualização automática',
      description:
        'A versão mais recente, com as últimas correções e novidades. É para cá que o app se atualiza sozinho — instale esta se você não tem motivo para escolher a outra.',
      url: dmgUrl(RELEASES.mac.current),
      autoUpdate: true
    },
    {
      id: 'estavel',
      label: 'Estável',
      version: RELEASES.mac.previous,
      fileSize: SIZES.macAnterior,
      tagline: 'Recuo, se algo der errado',
      description:
        'A versão anterior, já rodada por mais tempo. Instale por cima da atual se encontrar um problema que impeça o seu trabalho, e nos conte o que aconteceu.',
      url: dmgUrl(RELEASES.mac.previous),
      autoUpdate: false
    }
  ]
};

const WINDOWS: PlatformProfile = {
  os: 'windows',
  name: 'Windows',
  fullName: 'Windows 10 ou 11',
  icon: 'Monitor',
  status: 'available',
  version: RELEASES.windows.current,
  fileSize: SIZES.winAtual,
  fileFormat: 'Instalador .EXE (NSIS)',
  arch: 'x64',
  url: exeUrl(RELEASES.windows.current),
  requirements: `Windows 10 ou 11 em x64 · ~1 GB livres em disco · um CLI de agente instalado ou chave própria de modelo`,
  ctaLabel: 'Baixar para Windows',
  ctaDetail: `x64 · ${SIZES.winAtual}`,
  diskNote: `Instalador de ${SIZES.winAtual}, mais os seus projetos`,
  installSteps: [
    'Execute o instalador .exe baixado.',
    'O Windows avisa que o autor não é reconhecido: clique em "Mais informações" e depois em "Executar assim mesmo".',
    'A instalação é por usuário e não pede senha de administrador.',
    AI_ENGINE_STEP
  ],
  firstRun: {
    title: 'Aviso do SmartScreen na primeira execução',
    note: 'A build é assinada com identidade própria, sem certificado comercial de autoria, então o Windows mostra o aviso de autor não reconhecido. Clique em "Mais informações" e em "Executar assim mesmo".'
  },
  releases: [
    {
      id: 'atual',
      label: 'Atual',
      version: RELEASES.windows.current,
      fileSize: SIZES.winAtual,
      tagline: 'Alvo da atualização automática',
      description:
        'A versão de Windows mais recente publicada, com as últimas correções e novidades. É para cá que o app se atualiza sozinho — instale esta se você não tem motivo para escolher a outra.',
      url: exeUrl(RELEASES.windows.current),
      autoUpdate: true
    },
    {
      id: 'estavel',
      label: 'Estável',
      version: RELEASES.windows.previous,
      fileSize: SIZES.winAnterior,
      tagline: 'Recuo, se algo der errado',
      description:
        'A versão anterior, já rodada por mais tempo. Instale por cima da atual se encontrar um problema que impeça o seu trabalho, e nos conte o que aconteceu.',
      url: exeUrl(RELEASES.windows.previous),
      autoUpdate: false
    }
  ]
};

const LINUX: PlatformProfile = {
  os: 'linux',
  name: 'Linux',
  fullName: 'Linux (AppImage)',
  icon: 'Terminal',
  status: 'coming-soon',
  fileFormat: 'Executável .AppImage',
  arch: 'x86_64',
  requirements: 'Integração de ícone e atalho via ~/.local/share',
  ctaLabel: 'Ver plataformas disponíveis',
  comingSoonNote:
    'A build existe no código e roda, mas ainda não há binário publicado no mesmo ritmo do macOS e do Windows.',
  releases: []
};

export const PLATFORMS: PlatformProfile[] = [MAC, WINDOWS, LINUX];

export const PLATFORM_BY_OS: Record<SupportedOS, PlatformProfile> = {
  mac: MAC,
  windows: WINDOWS,
  linux: LINUX
};

/** Sistemas com instalador publicado, na ordem em que aparecem no texto. */
export const PUBLISHED = PLATFORMS.filter((p) => p.status === 'available');

/**
 * O perfil para o qual apontar o download, ou `null` quando não há o que
 * oferecer — Linux ainda sem binário, ou sistema não identificado (celular,
 * tablet, navegador que não se entrega).
 */
export function downloadTarget(os: OperatingSystem): PlatformProfile | null {
  if (os === 'unknown') return null;
  const profile = PLATFORM_BY_OS[os];
  return profile.status === 'available' ? profile : null;
}

/**
 * De onde tirar as versões e os avisos de instalação quando o sistema do
 * visitante não tem build. Cai no macOS, que é o mais completo.
 */
export function referenceProfile(os: OperatingSystem): PlatformProfile {
  return downloadTarget(os) ?? MAC;
}

/** Frase de disponibilidade sob o CTA principal, do ponto de vista do visitante. */
export function availabilityLine(os: OperatingSystem): string {
  switch (os) {
    case 'mac':
      return 'Detectamos que você está no macOS. Windows também publicado · Linux em preparação';
    case 'windows':
      return 'Detectamos que você está no Windows. macOS também publicado · Linux em preparação';
    case 'linux':
      return 'Linux em preparação · macOS e Windows já publicados';
    default:
      return 'Publicado para macOS e Windows · Linux em preparação';
  }
}

/** Versão curta da frase acima, para o rodapé e o menu mobile. */
export function availabilityShort(os: OperatingSystem): string {
  const target = downloadTarget(os);
  if (target) return `${target.fullName} · Linux em preparação`;
  return 'macOS e Windows · Linux em preparação';
}

/**
 * Requisitos do sistema. As três primeiras linhas mudam com a plataforma; o
 * motor de IA e a chave de modelo valem para todas.
 */
export function requirementsFor(os: OperatingSystem): RequirementItem[] {
  const target = downloadTarget(os);

  return [
    {
      label: 'Sistema operacional',
      value: target ? target.fullName : 'macOS 12+ ou Windows 10 e 11',
      note: target ? 'Linux em preparação' : 'Linux em preparação',
      icon: 'Monitor'
    },
    {
      label: 'Arquitetura',
      value: target ? target.arch : 'Apple Silicon, Intel e x64',
      note: target?.os === 'mac' ? 'Binário universal, sem Rosetta' : undefined,
      icon: 'Cpu'
    },
    {
      label: 'Espaço em disco',
      value: 'Cerca de 1 GB',
      note: target?.diskNote ?? 'O instalador ocupa entre 220 e 280 MB, mais os seus projetos',
      icon: 'HardDrive'
    },
    {
      label: 'Motor de IA',
      value: 'Um CLI de agente instalado no PATH',
      note: `O app detecta ${CATALOG.agentClis} CLIs — entre eles Claude Code, Codex, Gemini CLI, Cursor Agent, Copilot CLI e OpenCode`,
      icon: 'Terminal'
    },
    {
      label: 'Alternativa ao CLI',
      value: 'Sua própria chave de modelo',
      note: 'Anthropic, OpenAI, Azure ou Google, configurada no app',
      icon: 'KeyRound'
    }
  ];
}
