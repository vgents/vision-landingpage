import type { Route } from './router';

const TITLES: Record<Route['name'], string> = {
  home: 'Vision Design',
  planos: 'Planos · Vision Design',
  compra: 'Compra · Vision Design',
  'compra-confirmada': 'Pedido recebido · Vision Design',
  'compra-pendente': 'Pagamento pendente · Vision Design',
  'compra-erro': 'Pagamento não concluído · Vision Design',
  'criar-senha': 'Acesso ao Vision · Vision Design',
};

/** Rotas com dados de pedido/sessão: fora de buscadores e sem Referer. */
const PRIVATE: ReadonlySet<Route['name']> = new Set([
  'compra',
  'compra-confirmada',
  'compra-pendente',
  'compra-erro',
  'criar-senha',
]);

export const routeTitle = (name: Route['name']): string => TITLES[name];
export const isPrivateRoute = (name: Route['name']): boolean => PRIVATE.has(name);

function setMeta(name: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Título por rota, noindex/no-referrer nas privadas e foco no <h1> da nova página. */
export function applyRouteMeta(route: Route, moveFocus: boolean): void {
  document.title = routeTitle(route.name);
  const priv = isPrivateRoute(route.name);
  setMeta('robots', priv ? 'noindex' : null);
  setMeta('referrer', priv ? 'no-referrer' : null);
  if (!moveFocus || route.name === 'home') return;
  requestAnimationFrame(() => {
    const h1 = document.querySelector<HTMLElement>('main h1');
    if (h1) {
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
    }
  });
}
