import { describe, expect, test } from 'vitest';
import {
  DEFAULT_SEAT_PRICING as P,
  monthlyTotalCents,
  seatBreakdown,
  seatPriceCents,
  teamFromPriceCents,
  validateSeatChoice,
} from '../src/lib/seatPricing';

describe('seatPricing (mesma tabela do servidor)', () => {
  test('totais mensais', () => {
    expect(monthlyTotalCents(P, 1)).toBe(1499);
    expect(monthlyTotalCents(P, 2)).toBe(2848);
    expect(monthlyTotalCents(P, 5)).toBe(6895);
    expect(monthlyTotalCents(P, 6)).toBe(8214);
    expect(monthlyTotalCents(P, 20)).toBe(26680);
  });
  test('preço por pessoa por faixa', () => {
    expect(seatPriceCents(P, 1)).toBe(1499);
    expect(seatPriceCents(P, 2)).toBe(1349);
    expect(seatPriceCents(P, 6)).toBe(1319);
  });
  test('detalhamento por faixa', () => {
    expect(seatBreakdown(P, 6)).toEqual([
      { from: 1, to: 1, unit_cents: 1499, count: 1 },
      { from: 2, to: 5, unit_cents: 1349, count: 4 },
      { from: 6, to: 6, unit_cents: 1319, count: 1 },
    ]);
  });
  test('validação', () => {
    expect(validateSeatChoice(P, 'solo', 1)).toMatchObject({ ok: true });
    expect(validateSeatChoice(P, 'solo', 2)).toEqual({ ok: false, field: 'seats' });
    expect(validateSeatChoice(P, 'team', 1)).toEqual({ ok: false, field: 'seats' });
    expect(validateSeatChoice(P, 'team', 21)).toEqual({ ok: false, field: 'seats' });
    expect(validateSeatChoice(P, 'team', 20)).toMatchObject({ ok: true });
  });
});

describe('cartão Equipe', () => {
  test('"a partir de" usa o menor preço por pessoa (faixa 3)', () => {
    expect(teamFromPriceCents(P)).toBe(1319);
    expect(teamFromPriceCents({ ...P, tier3_discount_bp: 2000 })).toBe(1199);
  });
});
