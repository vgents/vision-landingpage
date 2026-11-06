/** Textos da compra, das páginas de resultado e de Criar senha. */

export const CHECKOUT_COPY = {
  eyebrow: 'Compra',
  title: 'Confirme o seu plano',
  intro:
    'Informe quem será responsável pela equipe. O acesso chega por e-mail: um link para criar a senha, sem senha provisória.',
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
  redirecting: 'Redirecionando…',
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

/**
 * Páginas de resultado (as `back_urls` do Mercado Pago e o retorno do pedido
 * grátis). Nenhuma afirma aprovação além deste texto: o estado real do
 * pagamento vem do webhook, não dos parâmetros da URL.
 */
export const RESULT_COPY = {
  confirmadaGratis: {
    eyebrow: 'Pedido recebido',
    title: 'Confira o seu e-mail',
    body: 'Pedido recebido. Enviamos um link para o seu e-mail; abra-o para criar sua senha e ativar a equipe.',
    // Validade do link = "Email OTP Expiration" do Supabase Auth (padrão: 1 hora). Só
    // escrever um prazo aqui depois de conferir o valor configurado no painel.
    note: 'Não chegou? Confira a caixa de spam. O link tem validade limitada: se vencer, use Primeiro acesso na tela de entrada do Vision para receber um código.',
  },
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
