export interface SeatPricing {
  base_cents: number;
  tier2_from: number;
  tier2_discount_bp: number;
  tier3_from: number;
  tier3_discount_bp: number;
  max_seats: number;
}

export const DEFAULT_SEAT_PRICING: SeatPricing = {
  base_cents: 1499,
  tier2_from: 2,
  tier2_discount_bp: 1000,
  tier3_from: 6,
  tier3_discount_bp: 1200,
  max_seats: 20,
};

export type PlanChoice = 'solo' | 'team';

const MIN_PRORATION_CENTS = 100;
const BILLING_DAYS = 30;

function discountBp(p: SeatPricing, seatIndex: number): number {
  if (seatIndex >= p.tier3_from) return p.tier3_discount_bp;
  if (seatIndex >= p.tier2_from) return p.tier2_discount_bp;
  return 0;
}

export function seatPriceCents(p: SeatPricing, seatIndex: number): number {
  return Math.round((p.base_cents * (10000 - discountBp(p, seatIndex))) / 10000);
}

/** Preço "a partir de" do cartão Equipe: o menor por pessoa (faixa 3). */
export function teamFromPriceCents(p: SeatPricing): number {
  return seatPriceCents(p, p.tier3_from);
}

export function monthlyTotalCents(p: SeatPricing, seats: number): number {
  let total = 0;
  for (let i = 1; i <= seats; i += 1) total += seatPriceCents(p, i);
  return total;
}

export function seatBreakdown(
  p: SeatPricing,
  seats: number,
): { from: number; to: number; unit_cents: number; count: number }[] {
  const out: { from: number; to: number; unit_cents: number; count: number }[] = [];
  for (let i = 1; i <= seats; i += 1) {
    const unit = seatPriceCents(p, i);
    const last = out[out.length - 1];
    if (last && last.unit_cents === unit) {
      last.to = i;
      last.count += 1;
    } else {
      out.push({ from: i, to: i, unit_cents: unit, count: 1 });
    }
  }
  return out;
}

export function prorateSeatsCents(
  p: SeatPricing,
  currentSeats: number,
  newSeats: number,
  daysRemaining: number,
): number {
  if (newSeats <= currentSeats) return 0;
  const days = daysRemaining > 0 ? daysRemaining : BILLING_DAYS;
  const diff = monthlyTotalCents(p, newSeats) - monthlyTotalCents(p, currentSeats);
  return Math.max(MIN_PRORATION_CENTS, Math.round((diff * days) / BILLING_DAYS));
}

export function validateSeatChoice(
  p: SeatPricing,
  choice: unknown,
  seats: unknown,
): { ok: true; choice: PlanChoice; seats: number } | { ok: false; field: 'choice' | 'seats' } {
  if (choice !== 'solo' && choice !== 'team') return { ok: false, field: 'choice' };
  if (typeof seats !== 'number' || !Number.isInteger(seats)) return { ok: false, field: 'seats' };
  if (choice === 'solo') {
    return seats === 1 ? { ok: true, choice, seats } : { ok: false, field: 'seats' };
  }
  return seats >= 2 && seats <= p.max_seats
    ? { ok: true, choice, seats }
    : { ok: false, field: 'seats' };
}
