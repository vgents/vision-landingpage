import { describe, expect, test } from 'vitest';
import { isAuthFragment, parseRoute } from '../src/lib/router';

describe('parseRoute', () => {
  test('known paths, trailing slash ignored', () => {
    expect(parseRoute('/planos/', '', '')).toEqual({ name: 'planos' });
    expect(parseRoute('/compra', '?plano=startup', '')).toEqual({ name: 'compra', planId: 'startup' });
    expect(parseRoute('/compra', '', '')).toEqual({ name: 'compra', planId: null });
    expect(parseRoute('/compra/pendente', '', '')).toEqual({ name: 'compra-pendente' });
    expect(parseRoute('/compra/erro/', '', '')).toEqual({ name: 'compra-erro' });
    expect(parseRoute('/criar-senha', '', '')).toEqual({ name: 'criar-senha' });
  });

  test('confirmed purchase reads our order or the MP reference', () => {
    expect(parseRoute('/compra/confirmada', '?external_reference=0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e&collection_status=approved', '')).toEqual({
      name: 'compra-confirmada',
      orderId: '0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e',
      free: false,
      approved: true,
    });
    expect(parseRoute('/compra/confirmada', '?pedido=0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e&tipo=gratis', '')).toEqual({
      name: 'compra-confirmada',
      orderId: '0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e',
      free: true,
      approved: false,
    });
    expect(parseRoute('/compra/confirmada', '', '')).toEqual({
      name: 'compra-confirmada',
      orderId: null,
      free: false,
      approved: false,
    });
  });

  test('order id that is not a UUID is not shown', () => {
    expect(parseRoute('/compra/confirmada', '?pedido=Clique+aqui+http://x.co', '')).toMatchObject({ orderId: null });
  });

  test('approval only counts with approved status from Mercado Pago', () => {
    expect(parseRoute('/compra/confirmada', '?status=approved', '')).toMatchObject({ approved: true });
    expect(parseRoute('/compra/confirmada', '?collection_status=pending', '')).toMatchObject({ approved: false });
  });

  test('unknown path falls back to home', () => {
    expect(parseRoute('/xyz', '', '')).toEqual({ name: 'home' });
    expect(parseRoute('/', '', '')).toEqual({ name: 'home' });
  });

  test('forwards auth fragment from root', () => {
    expect(parseRoute('/', '', '#access_token=a&type=invite')).toEqual({ name: 'criar-senha' });
    expect(parseRoute('/', '', '#error=access_denied&error_code=otp_expired')).toEqual({ name: 'criar-senha' });
    expect(parseRoute('/', '', '#downloads')).toEqual({ name: 'home' });
  });
});

describe('isAuthFragment', () => {
  test('detects session or error fragments only', () => {
    expect(isAuthFragment('#access_token=x')).toBe(true);
    expect(isAuthFragment('#error_code=otp_expired')).toBe(true);
    expect(isAuthFragment('#faq')).toBe(false);
    expect(isAuthFragment('')).toBe(false);
  });
});
