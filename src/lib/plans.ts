import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../data/cloud';
import { DEFAULT_SEAT_PRICING, type SeatPricing } from './seatPricing';

export const SEAT_PRICING_ENDPOINT = `${SUPABASE_URL}/rest/v1/seat_pricing?select=*`;

const FIELDS: (keyof SeatPricing)[] = [
  'base_cents',
  'tier2_from',
  'tier2_discount_bp',
  'tier3_from',
  'tier3_discount_bp',
  'max_seats',
];

function isSeatPricing(value: unknown): value is SeatPricing {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return FIELDS.every((key) => typeof row[key] === 'number' && Number.isFinite(row[key]));
}

/**
 * Tabela de preço por pessoa (linha única, leitura pública). Qualquer falha —
 * rede, status ou corpo inesperado — cai na tabela estática do site.
 */
export async function fetchSeatPricing(
  fetchImpl: typeof fetch = fetch,
): Promise<{ pricing: SeatPricing; source: 'remote' | 'fallback' }> {
  const fallback = { pricing: DEFAULT_SEAT_PRICING, source: 'fallback' as const };
  try {
    const res = await fetchImpl(SEAT_PRICING_ENDPOINT, {
      headers: { apikey: SUPABASE_ANON_KEY, Accept: 'application/json' },
    });
    if (res.status !== 200) return fallback;
    const body: unknown = await res.json();
    if (!Array.isArray(body) || !isSeatPricing(body[0])) return fallback;
    const row = body[0];
    return {
      pricing: Object.fromEntries(FIELDS.map((key) => [key, row[key]])) as unknown as SeatPricing,
      source: 'remote',
    };
  } catch {
    return fallback;
  }
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** `1499` → `R$ 14,99`. Espaço comum, não o não separável do Intl. */
export function formatPrice(cents: number): string {
  return BRL.format(cents / 100).replace(/ /g, ' ');
}
