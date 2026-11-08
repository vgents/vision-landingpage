import { describe, expect, test } from 'vitest';
import { isAuthFragment, parseRoute } from '../src/lib/router';

describe('parseRoute', () => {
  test('known paths, trailing slash ignored', () => {
    expect(parseRoute('/planos/', '', '')).toEqual({ name: 'planos' });
    expect(parseRoute('/compra', '?plano=startup', '')).toEqual({ name: 'compra', choice: 'team' });
    expect(parseRoute('/compra', '', '')).toEqual({ name: 'compra', choice: null });
    expect(parseRoute('/compra', '?escolha=team', '')).toEqual({ name: 'compra', choice: 'team' });
    expect(parseRoute('/compra', '?escolha=solo', '')).toEqual({ name: 'compra', choice: 'solo' });
    expect(parseRoute('/compra', '?escolha=x', '')).toEqual({ name: 'compra', choice: null });
    expect(parseRoute('/compra', '?plano=individual', '')).toEqual({ name: 'compra', choice: 'solo' });
    expect(parseRoute('/compra', '?plano=empresas', '')).toEqual({ name: 'compra', choice: 'team' });
    expect(parseRoute('/compra/pendente', '', '')).toEqual({ name: 'compra-pendente' });
    expect(parseRoute('/compra/erro/', '', '')).toEqual({ name: 'compra-erro' });
    expect(parseRoute('/criar-senha', '', '')).toEqual({ name: 'criar-senha' });
  });

  test('confirmed purchase reads our order or the MP reference', () => {
    expect(parseRoute('/compra/confirmada', '?external_reference=0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e&collection_status=approved', '')).toEqual({
      name: 'compra-confirmada',
      orderId: '0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e',
      approved: true,
    });
    expect(parseRoute('/compra/confirmada', '?pedido=0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e', '')).toEqual({
      name: 'compra-confirmada',
      orderId: '0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e',
      approved: false,
    });
    expect(parseRoute('/compra/confirmada', '', '')).toEqual({
      name: 'compra-confirmada',
      orderId: null,
      approved: false,
    });
  });

  test('pay link reads order and token', () => {
    const id = '0b5d3c1e-7a9f-4c2e-8d41-6f1a2b3c4d5e';
    expect(parseRoute('/compra/pagar', `?pedido=${id}&t=abc`, '')).toEqual({ name: 'compra-pagar', orderId: id, token: 'abc' });
    expect(parseRoute('/compra/pagar/', '?pedido=zz', '')).toEqual({ name: 'compra-pagar', orderId: null, token: null });
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
