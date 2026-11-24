import { describe, expect, test, vi } from 'vitest';
import { createAuthClient, expiringStorage, type StorageLike } from '../src/lib/authClient';
import { visibleReleases, PLATFORMS } from '../src/data/platforms';
import { SHOW_PREVIOUS_VERSIONS } from '../src/data/softwareData';

function memory(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
}

const session = (expiresInSec: number) =>
  JSON.stringify({
    access_token: 'tok',
    refresh_token: 'r',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSec,
    user: { id: 'u', aud: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '' },
  });

async function clientWith(stored: string) {
  const base = memory();
  base.setItem('vision-landing-auth', stored);
  const fetchSpy = vi.fn(async () => new Response('{}', { status: 400 }));
  const client = await createAuthClient(expiringStorage(base), fetchSpy as unknown as typeof fetch);
  return { client, fetchSpy, base };
}

describe('landing auth client never refreshes', () => {
  test('expired stored session reads as signed-out and makes no network call', async () => {
    const { client, fetchSpy, base } = await clientWith(session(-100));
    const { data } = await client.auth.getSession();
    expect(data.session).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(base.map.size).toBe(0);
  });
  test('session inside the safety margin also counts as expired, no call', async () => {
    const { client, fetchSpy } = await clientWith(session(30));
    expect((await client.auth.getSession()).data.session).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  test('valid stored session returns the token with no network call', async () => {
    const { client, fetchSpy } = await clientWith(session(3000));
    expect((await client.auth.getSession()).data.session?.access_token).toBe('tok');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  test('garbage in storage is dropped', () => {
    const base = memory();
    base.setItem('k', 'not json');
    expect(expiringStorage(base).getItem('k')).toBeNull();
  });
});

describe('previous versions are hidden', () => {
  test('flag is off and the options list excludes them', () => {
    expect(SHOW_PREVIOUS_VERSIONS).toBe(false);
    for (const p of PLATFORMS) {
      const shown = visibleReleases(p);
      expect(shown.length).toBeGreaterThan(0);
      expect(shown.every((r) => !r.download.version)).toBe(true);
    }
    const mac = PLATFORMS.find((p) => p.os === 'mac')!;
    expect(mac.releases.length).toBe(2);
    expect(visibleReleases(mac, true).length).toBe(2);
  });
});
