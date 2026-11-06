import { useEffect, useState } from 'react';

/**
 * Roteador mínimo por caminho (History API). A Vercel serve `index.html` para
 * qualquer caminho (`vercel.json`), e este módulo decide qual página mostrar.
 */
export type Route =
  | { name: 'home' }
  | { name: 'planos' }
  | { name: 'compra'; planId: string | null }
  | { name: 'compra-confirmada'; orderId: string | null; free: boolean }
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

function clean(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parseRoute(pathname: string, search: string, hash: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);

  switch (path) {
    case '/planos':
      return { name: 'planos' };
    case '/compra':
      return { name: 'compra', planId: clean(params.get('plano')) };
    case '/compra/confirmada':
      return {
        name: 'compra-confirmada',
        orderId: clean(params.get('pedido')) ?? clean(params.get('external_reference')),
        free: params.get('tipo') === 'gratis',
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

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const update = () => setRoute(currentRoute());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  return route;
}
