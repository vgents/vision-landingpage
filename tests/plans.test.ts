import { describe, expect, test } from 'vitest';
import { SUPABASE_ANON_KEY } from '../src/data/cloud';
import { FALLBACK_PLANS } from '../src/data/plans';
import { fetchPlans, formatPrice, seatsLabel } from '../src/lib/plans';

const startupRow = {
  id: 'startup',
  name: 'Start-up',
  max_users: 4,
  price_cents: 0,
  currency: 'BRL',
  requires_company: true,
  sort: 2,
};

function fakeFetch(status: number, body: unknown, seen?: { headers?: Record<string, string> }): typeof fetch {
  return (async (_url: RequestInfo | URL, init?: RequestInit) => {
    if (seen) seen.headers = init?.headers as Record<string, string>;
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
}

describe('fetchPlans', () => {
  test('remote plans keep fallback copy', async () => {
    const res = await fetchPlans(fakeFetch(200, [startupRow]));
    expect(res.source).toBe('remote');
    expect(res.plans[0].name).toBe('Start-up');
    expect(res.plans[0].maxUsers).toBe(4);
    expect(res.plans[0].requiresCompany).toBe(true);
    expect(res.plans[0].tagline).toBe(FALLBACK_PLANS.find((p) => p.id === 'startup')!.tagline);
  });

  test('network failure uses fallback', async () => {
    const res = await fetchPlans((async () => {
      throw new TypeError('offline');
    }) as typeof fetch);
    expect(res.source).toBe('fallback');
    expect(res.plans.map((p) => p.id)).toEqual(['individual', 'startup', 'empresas']);
  });

  test('empty list uses fallback', async () => {
    expect((await fetchPlans(fakeFetch(200, []))).source).toBe('fallback');
  });

  test('non-200 uses fallback', async () => {
    expect((await fetchPlans(fakeFetch(500, { message: 'x' }))).source).toBe('fallback');
  });

  test('anon headers are sent', async () => {
    const seen: { headers?: Record<string, string> } = {};
    await fetchPlans(fakeFetch(200, [startupRow], seen));
    expect(seen.headers?.apikey).toBe(SUPABASE_ANON_KEY);
  });
});

describe('formatting', () => {
  test('price', () => {
    expect(formatPrice(0)).toBe('R$ 0');
    expect(formatPrice(12990)).toBe('R$ 129,90');
  });
  test('seats', () => {
    expect(seatsLabel(1)).toBe('1 usuário');
    expect(seatsLabel(4)).toBe('até 4 usuários');
  });
});
