import type { ProcessOutcome } from '../../lib/payment';

export type PaymentError = Extract<ProcessOutcome, { kind: 'error' }>;

/** Erros que encerram a página de pagamento (o link não serve mais). */
export const FATAL_PAYMENT_CODES: ReadonlySet<string> = new Set(['invalid_link', 'expired', 'already_paid']);

export type PaymentCallbacks = {
  onApproved: () => void;
  /** Cartão em análise: a página mostra a mensagem e passa a consultar o status. */
  onPending: (message: string) => void;
  onFatal: (error: PaymentError) => void;
  /** Envio de cartão ou geração de Pix em andamento: a página trava as abas. */
  onBusyChange: (busy: boolean) => void;
  /** Um cartão foi enviado: o servidor cancela o Pix pendente, então o QR do pedido morre. */
  onCardSubmit: () => void;
};
