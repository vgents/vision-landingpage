/** Textos da compra, das páginas de resultado e de Criar senha. */

export const CHECKOUT_COPY = {
  eyebrow: 'Compra',
  title: 'Confirme o seu plano',
  intro:
    'Informe quem será responsável pela compra. Enviaremos por e-mail o link para pagar a mensalidade; depois do pagamento chega o link para criar a senha.',
  changePlan: 'Trocar de plano',
  choiceLegend: 'Plano',
  seatsLabel: 'Quantas pessoas?',
  seatsMinus: 'Menos uma pessoa',
  seatsPlus: 'Mais uma pessoa',
  seatsUnit: (n: number) => (n === 1 ? '1 pessoa' : `${n} pessoas`),
  totalLabel: 'Total por mês',
  breakdownTitle: 'Detalhamento por faixa',
  breakdownRow: (from: number, to: number, unit: string) =>
    from === to ? `Pessoa ${from}: ${unit}` : `Pessoas ${from} a ${to}: ${unit} cada`,
  nameLabel: 'Seu nome',
  emailLabel: 'E-mail',
  emailHint: 'É com ele que você vai entrar no Vision.',
  companyLabel: 'Nome da empresa ou iniciativa',
  companyHint: 'Vira o nome da equipe no Vision.',
  termsLead: 'Li e aceito os',
  termsLink: 'termos de uso',
  submit: 'Continuar',
  submitting: 'Enviando…',
  checkEmailTitle: 'Confira o seu e-mail',
  checkEmailNote: 'Não chegou? Confira a caixa de spam.',
  resend: 'Reenviar',
  resending: 'Reenviando…',
  resent: 'E-mail reenviado.',
  wrongEmail: 'E-mail errado? Corrigir',
  alreadyInTeamHint: 'Se a sua empresa já tem um plano, fale com quem administra a equipe para ser incluída.',
};

/** Página /compra/pagar (destino do link do e-mail). */
export const PAY_COPY = {
  eyebrow: 'Pagamento',
  loading: 'Abrindo o pagamento…',
  redirecting: 'Redirecionando para o Mercado Pago…',
  opening: 'Abrindo o pagamento',
  errorTitle: 'Não foi possível abrir o pagamento',
  newOrder: 'Fazer o pedido de novo',
  paidTitle: 'Pagamento confirmado',
  expiredBillingMessage: 'Este link venceu. Gere um novo em Minha equipe → Pagar mensalidade no app.',
  retry: 'Tentar de novo',
};

/** Pagamento na própria página (checkout transparente): abas Cartão e Pix. */
export const PAYMENT_COPY = {
  tabsLabel: 'Forma de pagamento',
  tabCard: 'Cartão',
  tabPix: 'Pix',
  amountLabel: 'Valor',
  cardLoading: 'Carregando o formulário do cartão…',
  cardUnavailable: 'Pagamento com cartão indisponível no momento. Use o Pix.',
  cardSdkFailed: 'Não foi possível carregar o formulário do cartão. Recarregue a página ou use o Pix.',
  cardInstallments: 'Cobrança à vista, em 1x.',
  cardRetry: 'Tente de novo.',
  pixIntro: 'Gere o QR Code e pague pelo app do seu banco. A confirmação aparece aqui sozinha.',
  pixGenerate: 'Gerar Pix',
  pixGenerating: 'Gerando o Pix…',
  pixRegenerate: 'Gerar novo Pix',
  pixQrAlt: 'QR Code do Pix',
  pixCodeLabel: 'Pix copia e cola',
  pixCopy: 'Copiar',
  pixCopied: 'Copiado',
  pixExpiresIn: (time: string) => `Expira em ${time}`,
  pixExpired: 'Este Pix expirou. Gere um novo para pagar.',
  pixWaiting: 'Aguardando o pagamento…',
  pending: 'Pagamento em análise',
  pendingDefault: 'Estamos confirmando o pagamento. Esta página atualiza sozinha.',
  rejectedTitle: 'Pagamento recusado',
  rejectedDefault: 'O pagamento foi recusado. Confira os dados ou tente outra forma de pagamento.',
  rejectedRetry: 'Tente de novo com outro cartão ou pague com Pix.',
  approvedTitle: 'Pagamento confirmado',
  approvedTeam: 'Pagamento confirmado. Pode voltar ao Vision — a equipe já está atualizada.',
  approvedNew: 'Pagamento confirmado. Enviamos o acesso para o seu e-mail.',
  approvedNewNote: 'Não chegou em alguns minutos? Confira a caixa de spam.',
  /** Erros de `checkout-process` que não existem em `CHECKOUT_ERROR_MESSAGES`. */
  errors: {
    attempt_reused: 'Gere o Pix de novo.',
    validation_error: 'Confira os dados do pagamento e tente de novo.',
    server_error: 'Não foi possível concluir o pagamento agora. Tente de novo em alguns minutos.',
  } as Record<string, string>,
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
  already_has_solo: 'Este e-mail já tem o plano Somente eu ativo. Entre no app.',
  expired: 'Este link venceu. Faça o pedido de novo.',
  already_paid: 'Pagamento já confirmado. Confira seu e-mail para entrar.',
  invalid_link: 'Link inválido ou substituído por um mais recente. Use o último e-mail ou o botão Pagar mensalidade no app.',
  already_in_team: 'Esse e-mail já faz parte de uma equipe com plano do Vision. Entre no app com ele ou use outro e-mail.',
  rate_limited: 'Muitas tentativas em pouco tempo. Tente de novo em alguns minutos.',
  mp_unavailable: 'Não foi possível falar com o Mercado Pago agora. Tente de novo em alguns minutos.',
  email_failed:
    'Seu pedido foi registrado, mas o e-mail de acesso não pôde ser enviado. Tente de novo em alguns minutos.',
  server_misconfigured: 'A compra está fora do ar no momento. Tente mais tarde ou fale com o suporte.',
  network_error: 'Sem conexão com o servidor. Confira a sua internet e tente de novo.',
};

export const CHECKOUT_ERROR_DEFAULT = 'Algo deu errado ao registrar o pedido. Tente de novo em alguns minutos.';

/**
 * Páginas de resultado (as `back_urls` do Mercado Pago e o retorno do pedido
 * grátis). Nenhuma afirma aprovação além deste texto: o estado real do
 * pagamento vem do webhook, não dos parâmetros da URL.
 */
export const RESULT_COPY = {
  confirmada: {
    eyebrow: 'Pagamento aprovado',
    title: 'Tudo certo com o pagamento',
    body: 'Enviamos o acesso para o seu e-mail.',
    note: 'Não chegou em alguns minutos? Confira a caixa de spam.',
  },
  /** Retorno do Mercado Pago sem `approved` nos parâmetros: não afirma aprovação. */
  confirmadaIncerta: {
    eyebrow: 'Pedido recebido',
    title: 'Confira o seu e-mail',
    body: 'Se o pagamento foi aprovado, o acesso chega por e-mail.',
    note: 'Não chegou em alguns minutos? Confira a caixa de spam ou o status no Mercado Pago.',
  },
  pendente: {
    eyebrow: 'Pagamento pendente',
    title: 'Pagamento em processamento',
    body: 'Pagamento em processamento (Pix/boleto podem levar alguns minutos). Assim que for aprovado, o acesso chega por e-mail.',
    note: 'Você pode fechar esta página; nada mais precisa ser feito aqui.',
  },
  erro: {
    eyebrow: 'Não deu certo',
    title: 'O pagamento não foi concluído',
    body: 'O pagamento não foi concluído. Se tiver dúvida sobre alguma cobrança, confira no Mercado Pago ou fale com o suporte.',
    note: '',
  },
  orderLabel: 'Pedido',
  retry: 'Tentar de novo',
  download: 'Baixar o Vision',
};

/** Página Criar senha (destino do link do e-mail de acesso). */
export const CREATE_PASSWORD_COPY = {
  eyebrow: 'Acesso ao Vision',
  loading: 'Abrindo o seu link…',
  inviteTitle: 'Crie a sua senha',
  inviteIntro: 'Esta é a senha que você vai usar para entrar no Vision com o seu e-mail.',
  recoveryTitle: 'Confirme o seu acesso',
  recoveryIntro: 'Sua senha atual continua valendo. Se quiser, defina uma nova abaixo; senão, só confirme.',
  recoveryOptional: 'Definir nova senha (opcional)',
  passwordLabel: 'Senha',
  confirmLabel: 'Repita a senha',
  passwordHint: 'Pelo menos 8 caracteres.',
  submitInvite: 'Criar senha e ativar',
  submitRecovery: 'Confirmar',
  saving: 'Salvando…',
  passwordRequired: 'Crie uma senha para continuar.',
  passwordTooShort: 'A senha precisa ter pelo menos 8 caracteres.',
  passwordMismatch: 'As duas senhas não são iguais.',
  passwordWeak: 'Essa senha foi recusada. Escolha outra, mais longa ou menos comum.',
  linkError: 'O link não pôde ser aberto. Peça um novo acesso pelo Vision.',
  confirmEmailNotVerified:
    'O seu e-mail ainda não foi confirmado. Abra o link mais recente que enviamos, ou peça um novo pelo Primeiro acesso na tela de entrada do Vision.',
  confirmUnauthorized: 'O link expirou durante a confirmação. Abra o e-mail mais recente e tente de novo.',
  confirmNetwork: 'Sem conexão com o servidor. Confira a sua internet e tente de novo.',
  confirmServer: 'Não foi possível concluir agora. Tente de novo em alguns minutos.',
  expiredTitle: 'Este link expirou ou já foi usado',
  expiredBody:
    'Abra o e-mail mais recente, ou no Vision use Primeiro acesso na tela de entrada para receber um código.',
  errorTitle: 'Não foi possível abrir o link',
  errorBody: 'Este link não pôde ser aberto. Abra o e-mail mais recente, ou no Vision use Primeiro acesso na tela de entrada para receber um código.',
  doneTitle: 'Tudo pronto',
  doneTeam: (org: string, plan?: string) => (plan ? `Equipe ${org} · plano ${plan}.` : `Equipe ${org}.`),
  donePlanOnly: (plan: string) => `Plano ${plan}.`,
  doneSteps: ['Baixe o Vision.', 'Abra e entre com seu e-mail e senha.'],
  download: 'Baixar o Vision',
};
