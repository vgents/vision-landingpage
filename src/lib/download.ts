import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../data/cloud';

export type PlatformKey = 'mac' | 'macIntel' | 'win' | 'linux';
export type ArtifactType = 'dmg' | 'installer' | 'appImage';

export const PLATFORM_KEYS: readonly PlatformKey[] = ['mac', 'macIntel', 'win', 'linux'];

/** Artefato que a landing oferece em cada plataforma (mac e Windows instalam por DMG/instalador; Linux só AppImage, que é o que atualiza). */
export const ARTIFACT_FOR_PLATFORM: Record<PlatformKey, ArtifactType> = {
  mac: 'dmg',
  macIntel: 'dmg',
  win: 'installer',
  linux: 'appImage',
};

export const isPlatformKey = (v: string | null | undefined): v is PlatformKey =>
  !!v && (PLATFORM_KEYS as readonly string[]).includes(v);

export type DownloadErrorCode = 'session-expired' | 'account-blocked' | 'not-found' | 'server-error' | 'network';
export type DownloadOutcome = { ok: true; url: string } | { ok: false; code: DownloadErrorCode };

/** Pede à função `release-download` um link assinado (curto) do instalador. */
export async function requestDownload(
  platformKey: PlatformKey,
  artifactType: ArtifactType,
  token: string,
  version?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DownloadOutcome> {
  let res: Response;
  try {
    res = await fetchImpl(`${FUNCTIONS_URL}/release-download`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'stable',
        platformKey,
        want: 'artifact',
        artifactType,
        ...(version ? { version } : {}),
      }),
    });
  } catch {
    return { ok: false, code: 'network' };
  }
  if (res.status === 401) return { ok: false, code: 'session-expired' };
  if (res.status === 403) return { ok: false, code: 'account-blocked' };
  if (res.status === 404) return { ok: false, code: 'not-found' };
  const data = (await res.json().catch(() => null)) as { ok?: boolean; url?: unknown } | null;
  if (!res.ok || typeof data?.url !== 'string' || !data.url) return { ok: false, code: 'server-error' };
  return { ok: true, url: data.url };
}
