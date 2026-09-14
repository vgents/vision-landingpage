import { OperatingSystem, PlatformProfile, RequirementItem, SupportedOS } from '../types';
import { CATALOG, RELEASE_FEED, RELEASES } from './softwareData';

/**
 * Perfis de plataforma: o conteúdo do site que muda conforme o sistema do
 * visitante. Os componentes leem daqui em vez de embutir texto de macOS.
 *
 * O que está publicado hoje: macOS, Windows e Linux. macOS e Windows têm duas
 * versões no ar (a atual e a anterior, como recuo); o Linux estreou na 0.8.37 e
 * ainda não tem para onde recuar. Cada plataforma segue o seu próprio número —
 * ver `RELEASES`.
 */

const artifactUrl = (version: string, file: string) =>
  `${RELEASE_FEED}/stable/versions/${version}/vision-design-${version}-${file}`;

const dmgUrl = (version: string) => artifactUrl(version, 'mac-arm64.dmg');
const exeUrl = (version: string) => artifactUrl(version, 'win-x64.exe');

/**
 * O feed publica dois artefatos de Linux — o `.AppImage` e um `.deb` — mas o
 * site oferece só o AppImage de propósito: a atualização automática do app
 * procura exclusivamente o artefato `appImage` do feed
 * (`apps/desktop/src/main/updater.ts`). Quem instalasse pelo `.deb` ficaria
 * preso na versão baixada, sem aviso.
 */
const appImageUrl = (version: string) => artifactUrl(version, 'linux-x64.AppImage');

/**
 * Tamanhos conferidos no Content-Length de cada artefato publicado, em MiB
 * arredondado. Cada linha é de uma versão específica: ao trocar uma versão em
 * `RELEASES`, meça o arquivo novo em vez de reaproveitar o número antigo.
 */
const SIZES = {
  /** 0.8.37 */ macAtual: '281 MB',
  /** 0.8.36 */ macAnterior: '281 MB',
  /** 0.8.37 */ winAtual: '227 MB',
  /** 0.8.34 */ winAnterior: '226 MB',
  /** 0.8.37 */ linuxAtual: '290 MB'
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
        'O instalador de Windows anterior, já rodado por mais tempo. Instale por cima da atual se encontrar um problema que impeça o seu trabalho, e nos conte o que aconteceu.',
      url: exeUrl(RELEASES.windows.previous),
      autoUpdate: false
    }
  ]
};

const LINUX: PlatformProfile = {
  os: 'linux',
  name: 'Linux',
  fullName: 'Linux x86-64 (AppImage)',
  icon: 'Terminal',
  status: 'available',
  version: RELEASES.linux.current,
  fileSize: SIZES.linuxAtual,
  fileFormat: 'Executável .AppImage',
  arch: 'x86-64',
  url: appImageUrl(RELEASES.linux.current),
  requirements: `Linux x86-64 · FUSE 2 para montar o AppImage · ~1 GB livres em disco · um CLI de agente instalado ou chave própria de modelo`,
  ctaLabel: 'Baixar para Linux',
  ctaDetail: `x86-64 · ${SIZES.linuxAtual}`,
  diskNote: `AppImage de ${SIZES.linuxAtual}, mais os seus projetos`,
  installSteps: [
    'Baixe o arquivo .AppImage.',
    `Dê permissão de execução: chmod +x vision-design-${RELEASES.linux.current}-linux-x64.AppImage`,
    'Execute o arquivo. Se a sua distribuição não trouxer o FUSE 2, instale o libfuse2 ou rode com --appimage-extract-and-run.',
    AI_ENGINE_STEP
  ],
  firstRun: {
    title: 'O AppImage precisa de permissão de execução',
    note: 'O navegador não marca o arquivo baixado como executável. Rode `chmod +x` no .AppImage, ou marque "Permitir execução" nas propriedades do arquivo, antes de abrir pela primeira vez. O ícone e o atalho são integrados em ~/.local/share na primeira execução.'
  },
  releases: [
    {
      id: 'atual',
      label: 'Atual',
      version: RELEASES.linux.current,
      fileSize: SIZES.linuxAtual,
      tagline: 'Alvo da atualização automática',
      description:
        'A primeira versão de Linux publicada no feed. O app se atualiza sozinho para cá — no Linux ele baixa o AppImage novo e entrega para você abrir, em vez de trocar o arquivo por conta própria.',
      url: appImageUrl(RELEASES.linux.current),
      autoUpdate: true
    }
  ]
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
 * oferecer — sistema não identificado: celular, tablet, Chromebook, navegador
 * que não se entrega. Os três sistemas desktop têm instalador publicado.
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
      return 'Detectamos que você está no macOS. Windows e Linux também publicados';
    case 'windows':
      return 'Detectamos que você está no Windows. macOS e Linux também publicados';
    case 'linux':
      return 'Detectamos que você está no Linux. macOS e Windows também publicados';
    default:
      return 'Publicado para macOS, Windows e Linux';
  }
}

/** Versão curta da frase acima, para o rodapé e o menu mobile. */
export function availabilityShort(os: OperatingSystem): string {
  const target = downloadTarget(os);
  if (target) return `${target.fullName} · os três sistemas no ar`;
  return 'macOS, Windows e Linux publicados';
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
      value: target ? target.fullName : 'macOS 12+, Windows 10 e 11 ou Linux x86-64',
      note: target ? undefined : 'Os três com instalador publicado',
      icon: 'Monitor'
    },
    {
      label: 'Arquitetura',
      value: target ? target.arch : 'Apple Silicon, Intel e x86-64',
      note: target?.os === 'mac' ? 'Binário universal, sem Rosetta' : undefined,
      icon: 'Cpu'
    },
    {
      label: 'Espaço em disco',
      value: 'Cerca de 1 GB',
      note: target?.diskNote ?? 'O instalador ocupa entre 227 e 290 MB, mais os seus projetos',
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
