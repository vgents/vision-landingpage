import { describe, expect, test } from 'vitest';
import { SUPABASE_ANON_KEY } from '../src/data/cloud';
import { fetchSeatPricing, formatPrice } from '../src/lib/plans';
import { DEFAULT_SEAT_PRICING } from '../src/lib/seatPricing';

const row = { base_cents: 1599, tier2_from: 3, tier2_discount_bp: 500, tier3_from: 8, tier3_discount_bp: 900, max_seats: 30 };

function fakeFetch(status: number, body: unknown, seen?: { headers?: Record<string, string>; url?: string }): typeof fetch {
  return (async (url: RequestInfo | URL, init?: RequestInit) => {
    if (seen) {
      seen.headers = init?.headers as Record<string, string>;
      seen.url = String(url);
    }
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}

describe('fetchSeatPricing', () => {
  test('remote row wins', async () => {
    const seen: { headers?: Record<string, string>; url?: string } = {};
    const res = await fetchSeatPricing(fakeFetch(200, [{ ...row, extra: 1 }], seen));
    expect(res).toEqual({ pricing: row, source: 'remote' });
    expect(seen.url).toMatch(/\/rest\/v1\/seat_pricing\?select=\*$/);
    expect(seen.headers?.apikey).toBe(SUPABASE_ANON_KEY);
  });
  test('failures use the default table', async () => {
    const bad = [
      fakeFetch(200, []),
      fakeFetch(200, [{ base_cents: 'x' }]),
      fakeFetch(500, {}),
      (async () => {
        throw new TypeError('offline');
      }) as typeof fetch,
    ];
    for (const f of bad) {
      expect(await fetchSeatPricing(f)).toEqual({ pricing: DEFAULT_SEAT_PRICING, source: 'fallback' });
    }
  });
});

describe('formatPrice', () => {
  test('brl', () => {
    expect(formatPrice(1499)).toBe('R$ 14,99');
    expect(formatPrice(26680)).toBe('R$ 266,80');
  });
});
