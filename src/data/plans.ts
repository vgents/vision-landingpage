/**
 * Planos do Vision. A fonte é a tabela `plans` do Supabase (só os ativos e
 * listados chegam ao site); esta lista é o recuo quando a busca falha e é
 * também de onde saem os textos dos cartões, que a tabela não guarda.
 */
export type PlanCard = {
  id: string;
  name: string;
  maxUsers: number;
  priceCents: number;
  currency: 'BRL';
  requiresCompany: boolean;
  tagline: string;
  features: string[];
};

export const FALLBACK_PLANS: PlanCard[] = [
  {
    id: 'individual',
    name: 'Individual',
    maxUsers: 1,
    priceCents: 0,
    currency: 'BRL',
    requiresCompany: false,
    tagline: 'Para quem desenha e prototipa sozinho.',
    features: [
      'Todo o aplicativo, sem recursos cortados',
      'Projetos locais no seu computador',
      'Publicação na biblioteca pública',
    ],
  },
  {
    id: 'startup',
    name: 'Start-up — pequenas empresas e iniciativas',
    maxUsers: 4,
    priceCents: 0,
    currency: 'BRL',
    requiresCompany: true,
    tagline: 'Para times pequenos que trabalham juntos no mesmo produto.',
    features: [
      'Equipe com organização própria',
      'Quem compra administra a equipe e convida as pessoas',
      'Projetos compartilhados com a organização',
    ],
  },
  {
    id: 'empresas',
    name: 'Empresas',
    maxUsers: 20,
    priceCents: 0,
    currency: 'BRL',
    requiresCompany: true,
    tagline: 'Para empresas com vários times e projetos ao mesmo tempo.',
    features: [
      'Equipe com organização própria',
      'Gestores que adicionam e removem pessoas',
      'Projetos compartilhados com a organização',
    ],
  },
];

export const PLANS_COPY = {
  eyebrow: 'Planos',
  titleLead: 'Escolha o plano da',
  titleAccent: 'sua equipe',
  intro:
    'Todos os planos dão acesso ao aplicativo inteiro; o que muda é quantas pessoas usam a mesma equipe. Quem compra já entra como responsável pela equipe.',
  ownerIncluded: 'responsável incluso',
  choose: 'Escolher',
  perPeriod: 'por enquanto, sem custo',
  fallbackNotice: 'Mostrando a lista de planos salva no site; os valores são os mesmos.',
  loading: 'Carregando planos…',
};
