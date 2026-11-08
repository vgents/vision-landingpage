/**
 * Textos da escolha de plano. Os preços não ficam aqui: saem da tabela
 * `seat_pricing` (com recuo para DEFAULT_SEAT_PRICING em `lib/seatPricing`).
 */
export type PlanChoiceId = 'solo' | 'team';

export const PLANS_COPY = {
  eyebrow: 'Planos',
  titleLead: 'Pague só pelas',
  titleAccent: 'pessoas que usam',
  intro:
    'Todos os planos dão acesso ao aplicativo inteiro, cobrado por mês e por pessoa. Quem compra já entra como responsável pela equipe.',
  perMonth: '/mês',
  choose: 'Escolher',
  fallbackNotice: 'Mostrando a tabela de preços salva no site; os valores são os mesmos.',
  loading: 'Carregando planos…',
  solo: {
    name: 'Somente eu',
    tagline: 'Para quem desenha e prototipa sozinho.',
    features: [
      'Todo o aplicativo, sem recursos cortados',
      'Projetos locais no seu computador',
      'Publicação na biblioteca pública',
    ],
  },
  team: {
    name: 'Tenho uma equipe',
    tagline: 'Para times que trabalham juntos no mesmo produto.',
    from: 'a partir de',
    perSeatMonth: 'por pessoa/mês',
    range: (max: number) => `2 a ${max} pessoas`,
    features: [
      'Equipe com organização própria',
      'Quem compra administra a equipe e convida as pessoas',
      'Projetos compartilhados com a organização',
      'Desconto automático a cada faixa de pessoas',
    ],
  },
};
