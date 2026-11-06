/** Textos da compra, das páginas de resultado e de Criar senha. */

export const CHECKOUT_COPY = {
  eyebrow: 'Compra',
  title: 'Confirme o seu plano',
  intro:
    'Informe quem vai ser a dona da equipe. O acesso chega por e-mail: um link para criar a senha, sem senha provisória.',
  changePlan: 'Trocar de plano',
  nameLabel: 'Seu nome',
  emailLabel: 'E-mail',
  emailHint: 'É com ele que você vai entrar no Vision.',
  companyLabel: 'Nome da empresa ou iniciativa',
  companyHint: 'Vira o nome da equipe no Vision.',
  termsLead: 'Li e aceito os',
  termsLink: 'termos de uso',
  submit: 'Confirmar pedido',
  submitPaid: 'Ir para o pagamento',
  submitting: 'Enviando…',
  choosePlan: 'Escolha um plano para continuar.',
  unknownPlan: 'Esse plano não está disponível. Escolha um dos planos abaixo.',
  alreadyInTeamHint: 'Se a sua empresa já tem um plano, fale com quem administra a equipe para ser incluída.',
};

export const CHECKOUT_FIELD_MESSAGES = {
  buyerName: 'Informe seu nome (até 120 caracteres).',
  buyerEmail: 'Informe um e-mail válido.',
  companyName: 'Informe o nome da empresa (até 120 caracteres).',
  acceptTerms: 'É preciso aceitar os termos para continuar.',
};

/** Mensagens por código de erro de `checkout-create`. O texto do servidor nunca é exibido cru. */
export const CHECKOUT_ERROR_MESSAGES: Record<string, string> = {
  validation_error: 'Confira os campos do formulário.',
  invalid_plan: 'Esse plano não está disponível. Escolha outro na página de planos.',
  already_in_team: 'Esse e-mail já faz parte de uma equipe com plano do Vision. Entre no app com ele ou use outro e-mail.',
  rate_limited: 'Muitos pedidos em pouco tempo para este e-mail. Tente de novo daqui a uma hora.',
  mp_unavailable: 'Não foi possível falar com o Mercado Pago agora. Tente de novo em alguns minutos.',
  email_failed:
    'Seu pedido foi registrado, mas o e-mail de acesso não pôde ser enviado. Tente de novo em alguns minutos.',
  server_misconfigured: 'A compra está fora do ar no momento. Tente mais tarde ou fale com o suporte.',
  network_error: 'Sem conexão com o servidor. Confira a sua internet e tente de novo.',
};

export const CHECKOUT_ERROR_DEFAULT = 'Algo deu errado ao registrar o pedido. Tente de novo em alguns minutos.';
