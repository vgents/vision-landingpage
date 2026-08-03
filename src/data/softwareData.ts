import {
  FeatureItem,
  FaqItem,
  LibraryHighlight,
  SecondaryFeature
} from '../types';

/** Versão publicada como atual. */
export const APP_VERSION = '0.8.30';

/** Versão anterior, mantida no ar como recuo caso a atual apresente problema. */
export const FALLBACK_VERSION = '0.8.29';

/**
 * Origem de onde os instaladores são servidos.
 *
 * O padrão é o endpoint público atual, para que o download funcione em
 * qualquer deploy sem configuração. `VITE_DOWNLOAD_ORIGIN` sobrescreve quando
 * definida — é por ali que se aponta para um domínio próprio, sem alterar
 * código.
 *
 * Este endereço é público por natureza: ele acaba no bundle de qualquer forma,
 * porque o navegador precisa dele para baixar o arquivo. Não é lugar de nada
 * que precise ficar em segredo.
 */
const DEFAULT_RELEASE_FEED = 'https://pub-923c8384ed884da3b04baf53118725a1.r2.dev';

export const RELEASE_FEED = (
  import.meta.env.VITE_DOWNLOAD_ORIGIN || DEFAULT_RELEASE_FEED
).replace(/\/+$/, '');

/** Contagens de catálogo exibidas no site. */
export const CATALOG = {
  designSystems: 151,
  skills: 134,
  designTemplates: 110,
  agentClis: 18,
  locales: 19
};

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: 'lean-inception',
    title: 'Lean Inception que lê os seus documentos',
    subtitle: 'Do briefing solto ao escopo estruturado',
    description:
      'Arraste atas de reunião, briefings ou requisitos em .md e .txt para dentro do canvas. O agente extrai e distribui o conteúdo nas colunas da inception — visão, objetivos, problema, personas, funcionalidades, regras de negócio e critérios de aceite — e você revisa card a card antes de aprovar.',
    highlights: [
      'Cada card tem status próprio: pendente, aprovado ou aprovado com ressalva',
      'Card pendente bloqueia o avanço do projeto, então nada passa sem revisão',
      'Ao enviar uma versão nova do documento, o sistema aponta quais cards conflitam com os anteriores'
    ],
    category: 'Descoberta'
  },
  {
    id: 'user-flow',
    title: 'Fluxo de usuário gerado a partir do escopo',
    subtitle: 'O diagrama que vira navegação de verdade',
    description:
      'Com a inception aprovada, o fluxo é desenhado automaticamente com nós tipados — tela, erro, estado vazio, sem permissão, sucesso e chamada externa. Filtre por persona para enxergar só o caminho que interessa e edite as conexões à mão quando precisar.',
    highlights: [
      'Ciclo explícito de rascunho, aguardando revisão e aprovado',
      'Filtro por persona para isolar a jornada de cada perfil',
      '"Aplicar navegação" conecta as rotas do protótipo às telas do diagrama'
    ],
    category: 'Fluxos'
  },
  {
    id: 'documentacao',
    title: 'Documento de Visão e de Requisitos',
    subtitle: 'O escopo escrito, validado por você',
    description:
      'A partir dos briefings, da inception e dos fluxos, o sistema redige dois documentos: o Documento de Visão e o Documento de Requisitos. Você revisa e valida antes de qualquer coisa ser construída — e é desses documentos aprovados que o protótipo nasce.',
    highlights: [
      'Editor próprio com paginação A4, pronto para impressão e exportação em PDF',
      'Mudou o escopo? O documento ganha uma versão nova, sem sobrescrever a anterior',
      'Nada avança para o protótipo enquanto os documentos não forem validados'
    ],
    category: 'Documentação'
  },
  {
    id: 'prototype',
    title: 'Protótipo React que você edita clicando',
    subtitle: 'Código real, manipulado como design',
    description:
      'Com os documentos aprovados, as telas nascem como um projeto React + Vite de verdade, aberto em um canvas com frames navegáveis. Selecione um elemento e ajuste no painel de propriedades, reorganize pela árvore de camadas, aplique auto-layout — e o que muda é o código-fonte, não uma maquete.',
    highlights: [
      'Edições com escopo por breakpoint, sem quebrar o desktop ao ajustar o mobile',
      'Árvore de camadas, copiar e colar de componentes e camadas de fundo',
      'Modo apresentação abre o resultado como um site navegável, fora do canvas'
    ],
    category: 'Protótipo'
  },
  {
    id: 'design-system',
    title: 'Design systems e ponte com o Figma',
    subtitle: 'A identidade aplicada e devolvida ao time',
    description:
      `São ${CATALOG.designSystems} design systems prontos para usar, além dos seus próprios — importados de um repositório GitHub, do Figma ou extraídos de um projeto existente. Tokens semânticos de cor, escopos de variável, bibliotecas de ícones e fontes ficam disponíveis para qualquer protótipo.`,
    highlights: [
      'Um projeto de design system funciona como repositório: editou nele, reflete nos protótipos',
      'Exportação para o Figma pelo plugin próprio, recriando as camadas no arquivo',
      'Salve o design de um projeto como um sistema reutilizável nos próximos'
    ],
    category: 'Design System'
  }
];

export const SECONDARY_FEATURES: SecondaryFeature[] = [
  {
    id: 'colaboracao',
    title: 'Versionamento e revisão de PR',
    description:
      'GitHub e GitLab, inclusive self-managed, com chaves SSH gerenciadas pelo app. Colaborador envia proposta, o dono revisa e aprova o merge sem sair da ferramenta.',
    icon: 'GitPullRequest'
  },
  {
    id: 'plugins',
    title: 'Skills, plugins e MCP',
    description:
      `${CATALOG.skills} skills e ${CATALOG.designTemplates} templates instaláveis, mais um marketplace de plugins e cliente MCP para conectar as suas próprias ferramentas.`,
    icon: 'Blocks'
  },
  {
    id: 'idiomas',
    title: `${CATALOG.locales} idiomas`,
    description:
      'Interface completa em português do Brasil, inglês, espanhol e mais dezesseis idiomas — incluindo os documentos gerados, que respeitam a língua do projeto.',
    icon: 'Languages'
  },
  {
    id: 'local-first',
    title: 'Local-first de verdade',
    description:
      'Projetos, telas, documentos e histórico ficam em disco, na sua máquina. A nuvem é opcional e serve para publicar e colaborar — não para guardar o seu trabalho.',
    icon: 'HardDrive'
  }
];

export const LIBRARY_HIGHLIGHTS: LibraryHighlight[] = [
  {
    id: 'aba-inicial',
    title: 'A primeira coisa que você vê',
    description:
      'A Biblioteca é a aba padrão ao abrir o Vision Design quando há projetos publicados. Se estiver vazia, o app cai de volta nos projetos iniciais.'
  },
  {
    id: 'publicacao-seletiva',
    title: 'Você escolhe o que expor',
    description:
      'Ao publicar, marque item a item o que vai junto: a lean inception, os fluxos, as telas e os documentos. O que não for marcado não sai da sua máquina.'
  },
  {
    id: 'clone-aberto',
    title: 'Cópia sem credencial',
    description:
      'Qualquer pessoa copia um projeto público para o ambiente local dela — mesmo sem pertencer à sua organização e sem conta no provedor de Git.'
  },
  {
    id: 'organizacoes',
    title: 'Ou só para o seu time',
    description:
      'Publicação restrita a uma organização, com controle de acesso por membro e por projeto, para o que ainda não deve ser público.'
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-ia',
    category: 'Pré-requisitos',
    question: 'O Vision Design vem com IA embutida?',
    answer:
      'Não, e isso é uma decisão de projeto. O app detecta os CLIs de agente que você já tem instalados no PATH e usa um deles como motor — Claude Code, Codex, Gemini CLI, Cursor Agent, Copilot CLI e OpenCode estão entre os 18 reconhecidos. Se preferir, configure a sua própria chave de API da Anthropic, OpenAI, Azure ou Google. Em nenhum dos casos há assinatura de IA cobrada pelo Vision Design.'
  },
  {
    id: 'faq-offline',
    category: 'Funcionamento',
    question: 'Funciona sem internet?',
    answer:
      'A ferramenta é local-first: o canvas, o editor de telas, os documentos e todo o histórico rodam na sua máquina. Você precisa de conexão para o que é inerentemente remoto — chamar o modelo de IA, publicar na nuvem, sincronizar com o Git e baixar atualizações.'
  },
  {
    id: 'faq-arquivos',
    category: 'Dados',
    question: 'Onde ficam os meus arquivos?',
    answer:
      'Em disco, na sua conta local: no macOS sob ~/Library/Application Support/Vision Design, no Windows sob %APPDATA%\\Vision Design. Cada projeto é uma pasta comum, com as telas em HTML, os assets, a inception e os documentos. Publicar na nuvem é opcional e seletivo — você marca o que vai junto e o resto não sai da máquina.'
  },
  {
    id: 'faq-plataformas',
    category: 'Plataformas',
    question: 'Quais sistemas estão suportados?',
    answer: `macOS e Windows nativos, os dois com instalador publicado e suportados por igual: no mac uma imagem .dmg para Apple Silicon e Intel, no Windows um instalador NSIS x64 que instala por usuário, sem pedir administrador. O Linux tem o empacotamento em AppImage pronto no código e ele roda, mas ainda não há binário publicado no mesmo ritmo dos outros dois — entra assim que a publicação for pareada. Quem está no Linux hoje também tem o caminho do WSL2.`
  },
  {
    id: 'faq-gatekeeper',
    category: 'Instalação',
    os: 'mac',
    question: 'O macOS avisa que não consegue verificar o app. É esperado?',
    answer:
      'Sim. A build é assinada com uma identidade própria, não notarizada pela Apple, então o Gatekeeper mostra o aviso na primeira abertura. Para continuar, clique com o botão direito no app dentro de Aplicações e escolha "Abrir" — ou libere em Ajustes do Sistema, Privacidade e Segurança. Depois disso ele abre normalmente.'
  },
  {
    id: 'faq-smartscreen',
    category: 'Instalação',
    os: 'windows',
    question: 'O Windows diz que o autor não é reconhecido. É esperado?',
    answer:
      'Sim. A build é assinada com identidade própria, sem certificado comercial de autoria, então o SmartScreen mostra o aviso de autor não reconhecido ao rodar o instalador. Para continuar, clique em "Mais informações" e depois em "Executar assim mesmo". A instalação é por usuário e não pede senha de administrador.'
  },
  {
    id: 'faq-atualizacao',
    category: 'Atualizações',
    question: 'Como o app se atualiza?',
    answer:
      'O aplicativo instalado consulta o feed de releases e baixa a versão nova sozinho — sempre a mais recente. Existem quatro canais: stable para a entrega formal, preview para acesso antecipado, beta para o desenvolvimento diário e nightly para validação interna. Cada canal instala com identidade separada, então dá para manter mais de um na mesma máquina.'
  },
  {
    id: 'faq-versao-anterior',
    category: 'Atualizações',
    question: 'Encontrei um problema na versão nova. Como volto para a anterior?',
    answer:
      `No macOS o site mantém duas versões no ar: a atual (${APP_VERSION}), que é o alvo da atualização automática, e a anterior (${FALLBACK_VERSION}), disponível como recuo. Baixe a anterior na central de downloads e instale por cima. O Windows estreia agora com a ${APP_VERSION} e passa a ter as duas a partir da próxima publicação. Seus projetos ficam em disco, fora do aplicativo, então não se perdem na troca. Vale saber de uma coisa: como a atualização automática sempre aponta para a mais recente, ela vai trazer você de volta à atual na sequência. Se o problema persistir, nos avise para que a correção entre na próxima versão.`
  },
  {
    id: 'faq-figma',
    category: 'Integrações',
    question: 'Consigo levar o resultado para o Figma?',
    answer:
      'Sim. A exportação usa um formato próprio e um plugin do Figma que busca o design no seu app e recria as camadas no arquivo — não é uma imagem colada, são camadas editáveis. O caminho inverso também existe: dá para importar do Figma ao criar um projeto novo.'
  }
];
