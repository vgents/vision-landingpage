import { useEffect, useRef } from 'react';
import { pollPaymentStatus, type PaymentStatus } from '../../lib/payment';

export const POLL_INTERVAL_MS = 5000;

/**
 * Consulta `checkout-status` a cada 5 s enquanto `active`. Para quando a aba do
 * navegador fica oculta e volta ao ficar visível (consultando na hora). Chama
 * `onFinal` uma vez com `approved`, `rejected` ou `expired` e para.
 */
export function useStatusPolling(
  active: boolean,
  orderId: string,
  token: string,
  onFinal: (status: Exclude<PaymentStatus, 'pending'>) => void,
): void {
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    if (!active) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let inFlight = false;

    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const schedule = () => {
      clear();
      if (alive && !document.hidden) timer = setTimeout(tick, POLL_INTERVAL_MS);
    };
    async function tick() {
      if (!alive || inFlight || document.hidden) return;
      inFlight = true;
      const status = await pollPaymentStatus(orderId, token);
      inFlight = false;
      if (!alive) return;
      if (status === 'pending') {
        schedule();
        return;
      }
      alive = false;
      onFinalRef.current(status);
    }
    const onVisibility = () => {
      if (document.hidden) clear();
      else if (alive && !inFlight) void tick();
    };

    schedule();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive = false;
      clear();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, orderId, token]);
}
