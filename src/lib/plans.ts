import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../data/cloud';
import { FALLBACK_PLANS, type PlanCard } from '../data/plans';

type PlanRow = {
  id: string;
  name: string;
  max_users: number;
  price_cents: number;
  currency: string;
  requires_company: boolean;
  sort: number;
};

export const PLANS_ENDPOINT = `${SUPABASE_URL}/rest/v1/plans?select=id,name,max_users,price_cents,currency,requires_company,sort&order=sort`;

function isPlanRow(value: unknown): value is PlanRow {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.max_users === 'number' &&
    typeof row.price_cents === 'number' &&
    typeof row.requires_company === 'boolean'
  );
}

function toCard(row: PlanRow): PlanCard {
  const copy = FALLBACK_PLANS.find((plan) => plan.id === row.id);
  return {
    id: row.id,
    name: row.name,
    maxUsers: row.max_users,
    priceCents: row.price_cents,
    currency: 'BRL',
    requiresCompany: row.requires_company,
    tagline: copy?.tagline ?? '',
    features: copy?.features ?? [],
  };
}

/**
 * Planos ativos e listados (a RLS filtra). Qualquer falha — rede, status, corpo
 * inesperado ou lista vazia — cai na lista estática do site.
 */
export async function fetchPlans(
  fetchImpl: typeof fetch = fetch,
): Promise<{ plans: PlanCard[]; source: 'remote' | 'fallback' }> {
  const fallback = { plans: FALLBACK_PLANS, source: 'fallback' as const };
  try {
    const res = await fetchImpl(PLANS_ENDPOINT, {
      headers: { apikey: SUPABASE_ANON_KEY, Accept: 'application/json' },
    });
    if (res.status !== 200) return fallback;
    const body: unknown = await res.json();
    if (!Array.isArray(body)) return fallback;
    const rows = body.filter(isPlanRow);
    if (rows.length === 0) return fallback;
    return { plans: rows.map(toCard), source: 'remote' };
  } catch {
    return fallback;
  }
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** `0` → `R$ 0`; `12990` → `R$ 129,90`. Espaço comum, não o não separável do Intl. */
export function formatPrice(cents: number): string {
  if (cents === 0) return 'R$ 0';
  return BRL.format(cents / 100).replace(/ /g, ' ');
}

export function seatsLabel(n: number): string {
  return n === 1 ? '1 usuário' : `até ${n} usuários`;
}
