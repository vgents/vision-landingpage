import { useEffect, useState, type MouseEvent } from 'react';

/**
 * Roteador mínimo por caminho (History API). A Vercel serve `index.html` para
 * qualquer caminho (`vercel.json`), e este módulo decide qual página mostrar.
 */
export type Route =
  | { name: 'home' }
  | { name: 'planos' }
  | { name: 'compra'; choice: 'solo' | 'team' | null }
  | { name: 'compra-pagar'; orderId: string | null; token: string | null }
  | { name: 'compra-confirmada'; orderId: string | null; approved: boolean }
  | { name: 'compra-pendente' }
  | { name: 'compra-erro' }
  | { name: 'criar-senha' };

/**
 * Fragmento deixado pelo link do e-mail do Supabase Auth: sessão aberta
 * (`access_token=`) ou link recusado (`error_code=`). Âncoras comuns como
 * `#downloads` não contam.
 */
export function isAuthFragment(hash: string): boolean {
  return hash.includes('access_token=') || hash.includes('error_code=');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Só mostra o número do pedido se for um UUID (o texto da URL é de quem abriu o link). */
function orderIdOf(value: string | null): string | null {
  const v = clean(value);
  return v && UUID_RE.test(v) ? v : null;
}

function clean(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** `?escolha=solo|team`; o antigo `?plano=<id>` (individual / startup / empresas) vira a escolha equivalente. */
function choiceOf(params: URLSearchParams): 'solo' | 'team' | null {
  const choice = clean(params.get('escolha'));
  if (choice === 'solo' || choice === 'team') return choice;
  const legacy = clean(params.get('plano'));
  if (legacy === 'individual') return 'solo';
  if (legacy === 'startup' || legacy === 'empresas') return 'team';
  return null;
}

export function parseRoute(pathname: string, search: string, hash: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);

  switch (path) {
    case '/planos':
      return { name: 'planos' };
    case '/compra':
      return { name: 'compra', choice: choiceOf(params) };
    case '/compra/pagar':
      return { name: 'compra-pagar', orderId: orderIdOf(params.get('pedido')), token: clean(params.get('t')) };
    case '/compra/confirmada':
      return {
        name: 'compra-confirmada',
        orderId: orderIdOf(params.get('pedido')) ?? orderIdOf(params.get('external_reference')),
        // Retorno do Mercado Pago: só `approved` sustenta o texto de aprovação.
        approved: (params.get('collection_status') ?? params.get('status')) === 'approved',
      };
    case '/compra/pendente':
      return { name: 'compra-pendente' };
    case '/compra/erro':
      return { name: 'compra-erro' };
    case '/criar-senha':
      return { name: 'criar-senha' };
    default:
      // O Supabase cai na "Site URL" (raiz) quando /criar-senha não está na
      // lista de redirects: o fragmento da sessão ainda leva à página certa.
      if (path === '/' && isAuthFragment(hash)) return { name: 'criar-senha' };
      return { name: 'home' };
  }
}

export function currentRoute(): Route {
  return parseRoute(window.location.pathname, window.location.search, window.location.hash);
}

export function navigate(path: string): void {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  if (!path.includes('#')) window.scrollTo(0, 0);
}

/**
 * Link do e-mail aberto na raiz: troca o caminho para /criar-senha mantendo o
 * fragmento. Sem isso, quando o supabase-js limpa o fragmento (o que dispara
 * `popstate`), a raiz sem fragmento voltaria a ser a landing no meio do fluxo.
 */
function canonicalizeAuthLanding(): void {
  const { pathname, search, hash } = window.location;
  if (parseRoute(pathname, search, hash).name === 'criar-senha' && pathname.replace(/\/+$/, '') !== '/criar-senha') {
    window.history.replaceState(window.history.state, '', `/criar-senha${search}${hash}`);
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => {
    canonicalizeAuthLanding();
    return currentRoute();
  });

  useEffect(() => {
    const update = () => setRoute(currentRoute());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  return route;
}

/**
 * Clique num link interno: troca de página sem recarregar, mas deixa o
 * navegador cuidar de Cmd/Ctrl/Shift/botão do meio (abrir em nova aba).
 */
export function handleLinkClick(event: MouseEvent<HTMLAnchorElement>, path: string): void {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(path);
}
