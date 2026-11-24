import { useCallback, useEffect, useState } from 'react';
import { ACCOUNT_COPY } from '../data/account';
import { DOWNLOADS_PAUSED } from '../data/softwareData';
import { currentAccessToken, signOut } from './account';
import { requestDownload, type ArtifactType, type PlatformKey } from './download';
import { navigate } from './router';

export interface DownloadTarget {
  platformKey: PlatformKey;
  artifactType: ArtifactType;
  version?: string;
}

/** Caminho de /entrar que volta a este download depois do login. */
export function loginPathFor(target: DownloadTarget): string {
  const p = new URLSearchParams({ next: 'download', platform: target.platformKey });
  if (target.version) p.set('version', target.version);
  return `/entrar?${p.toString()}`;
}

/**
 * Pede o link assinado e abre. Sem sessão leva ao login; com sessão vencida
 * (401) encerra a sessão da aba e pede para entrar de novo.
 */
export async function startDownload(target: DownloadTarget): Promise<{ started: true } | { started: false; message: string | null }> {
  if (DOWNLOADS_PAUSED) return { started: false, message: ACCOUNT_COPY.download.paused };
  const token = await currentAccessToken();
  if (!token) {
    navigate(loginPathFor(target));
    return { started: false, message: null };
  }
  const out = await requestDownload(target.platformKey, target.artifactType, token, target.version);
  if (out.ok) {
    window.location.assign(out.url);
    return { started: true };
  }
  if (out.ok === false) {
    if (out.code === 'session-expired') await signOut();
    return { started: false, message: ACCOUNT_COPY.download[out.code] };
  }
  return { started: false, message: ACCOUNT_COPY.download['server-error'] };
}

/** Estado de sessão da aba (some ao fechar) e a ação de baixar, para os botões. */
export function useSignedIn(): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    const refresh = () => {
      currentAccessToken().then((t) => alive && setSignedIn(!!t));
    };
    refresh();
    window.addEventListener('vision-auth', refresh);
    return () => {
      alive = false;
      window.removeEventListener('vision-auth', refresh);
    };
  }, []);
  return signedIn;
}

export function useDownloadAction() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const start = useCallback(async (target: DownloadTarget) => {
    setBusy(true);
    setMessage(null);
    const out = await startDownload(target);
    setBusy(false);
    if (out.started === false) setMessage(out.message);
  }, []);
  return { start, busy, message };
}
