import { describe, expect, test } from 'vitest';
import { requestDownload } from '../src/lib/download';

function fakeFetch(status: number, body: unknown, seen: { url?: string; init?: RequestInit } = {}) {
  return (async (url: unknown, init?: RequestInit) => {
    seen.url = String(url);
    seen.init = init;
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}

describe('requestDownload', () => {
  test('requestDownload maps 401 to session-expired', async () => {
    expect(await requestDownload('mac', 'dmg', 't', undefined, fakeFetch(401, {}))).toEqual({ ok: false, code: 'session-expired' });
  });
  test('requestDownload maps 403 to account-blocked', async () => {
    expect(await requestDownload('mac', 'dmg', 't', undefined, fakeFetch(403, { ok: false, code: 'account-blocked' }))).toEqual({ ok: false, code: 'account-blocked' });
  });
  test('requestDownload posts want artifact with bearer token', async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    const out = await requestDownload('win', 'installer', 'tok', undefined, fakeFetch(200, { ok: true, url: 'https://x/y' }, seen));
    expect(out).toEqual({ ok: true, url: 'https://x/y' });
    expect(seen.url).toMatch(/\/functions\/v1\/release-download$/);
    const h = seen.init?.headers as Record<string, string>;
    expect(h.Authorization).toBe('Bearer tok');
    expect(h.apikey).toBeTruthy();
    expect(JSON.parse(String(seen.init?.body))).toEqual({ channel: 'stable', platformKey: 'win', want: 'artifact', artifactType: 'installer' });
  });
  test('passes version when given; maps 404, 5xx and network', async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    await requestDownload('mac', 'dmg', 't', '0.8.44', fakeFetch(200, { ok: true, url: 'u' }, seen));
    expect(JSON.parse(String(seen.init?.body)).version).toBe('0.8.44');
    expect(await requestDownload('mac', 'dmg', 't', undefined, fakeFetch(404, {}))).toEqual({ ok: false, code: 'not-found' });
    expect(await requestDownload('mac', 'dmg', 't', undefined, fakeFetch(500, {}))).toEqual({ ok: false, code: 'server-error' });
    expect(await requestDownload('mac', 'dmg', 't', undefined, (async () => { throw new Error('x'); }) as typeof fetch)).toEqual({ ok: false, code: 'network' });
  });
});
