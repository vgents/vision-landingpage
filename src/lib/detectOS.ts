import { OperatingSystem } from '../types';

/** O que a detecção precisa saber do ambiente. Isolado para poder ser testado. */
export interface DetectionInput {
  userAgent: string;
  /** `navigator.userAgentData.platform`, quando o navegador expõe. */
  platform?: string;
  maxTouchPoints: number;
  /** `location.search` — permite forçar o sistema com ?os=windows. */
  search?: string;
}

const OS_BY_PARAM: Record<string, OperatingSystem> = {
  mac: 'mac',
  macos: 'mac',
  windows: 'windows',
  win: 'windows',
  linux: 'linux'
};

/**
 * Resolve o sistema do visitante a partir do ambiente, sem tocar em globais.
 *
 * Celular e tablet voltam como `unknown` de propósito: o Vision Design é um app
 * desktop, então não há instalador para oferecer. Isso exige ordem — o iPad se
 * reporta como Macintosh e a user agent do Android contém "Linux", então a
 * checagem de mobile vem antes da de desktop.
 */
export function resolveOS({
  userAgent,
  platform,
  maxTouchPoints,
  search
}: DetectionInput): OperatingSystem {
  // Override explícito: serve para quem está num sistema e quer ver outro.
  if (search) {
    const asked = new URLSearchParams(search).get('os')?.toLowerCase();
    if (asked && OS_BY_PARAM[asked]) return OS_BY_PARAM[asked];
  }

  const ua = userAgent.toLowerCase();

  if (/android|iphone|ipod|windows phone/.test(ua)) return 'unknown';
  // iPad no modo desktop se identifica como Macintosh; o toque o entrega.
  if (/ipad/.test(ua) || (/macintosh/.test(ua) && maxTouchPoints > 1)) return 'unknown';

  // userAgentData é mais confiável que a user agent, quando existe.
  const source = platform ? platform.toLowerCase() : ua;

  // ChromeOS não é Linux desktop: o AppImage não serve, então cai no estado
  // neutro em vez de prometer a build de Linux que está em preparação.
  if (/cros|chrome os/.test(source)) return 'unknown';

  if (/mac|darwin/.test(source)) return 'mac';
  if (/win/.test(source)) return 'windows';
  if (/linux|x11/.test(source)) return 'linux';

  return 'unknown';
}

/** Lê o ambiente do navegador e resolve o sistema. */
export function detectOS(): OperatingSystem {
  if (typeof navigator === 'undefined') return 'unknown';

  return resolveOS({
    userAgent: navigator.userAgent,
    platform: (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
      ?.platform,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    search: typeof location === 'undefined' ? undefined : location.search
  });
}
