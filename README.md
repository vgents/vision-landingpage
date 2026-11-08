# Site oficial do Vision Design

Landing page do Vision Design — ferramenta desktop local-first que leva produto da descoberta ao
protótipo navegável: lean inception, fluxo de usuário, telas React editáveis, documentação de visão
e requisitos, e publicação em biblioteca.

## Rodando localmente

**Pré-requisito:** Node.js 20 ou superior.

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros comandos:

```bash
npm run build    # gera dist/
npm run preview  # serve o build
npm run lint     # tsc --noEmit
npm test         # vitest (lógica de src/lib)
```

## Stack

React 19 · Vite 6 · Tailwind CSS 4 · lucide-react

## Estrutura

```
public/                 favicon, logo e imagem de compartilhamento
src/
  data/softwareData.ts  conteúdo textual da landing
  data/plans.ts         textos dos cartões de plano (preços vêm de lib/seatPricing)
  data/checkout.ts      textos da compra, dos resultados e de Criar senha
  data/cloud.ts         URL do Supabase e chave pública (anon)
  lib/                  lógica pura (rotas, planos, compra, Criar senha), testada com Vitest
  pages/                páginas fora da landing
  components/           uma seção por arquivo
  index.css             tokens de marca (@theme do Tailwind 4)
tests/                  testes Vitest de src/lib
vercel.json             fallback SPA: todo caminho serve index.html
```

**Todo o texto do site vive em `src/data/`.** Versão, contagens do catálogo, requisitos,
funcionalidades, FAQ, planos e textos da compra saem dali — os componentes só renderizam.

## Páginas

| Caminho | O quê |
| --- | --- |
| `/` | landing (com a seção de planos) |
| `/planos` | Somente eu e Tenho uma equipe; preços por pessoa/mês da tabela `seat_pricing`, com recuo estático (`DEFAULT_SEAT_PRICING`) |
| `/compra?escolha=solo\|team` | formulário (quantidade 2–20 em equipe); chama `checkout-create` e mostra "confira seu e-mail". `?plano=` antigo ainda mapeia |
| `/compra/pagar?pedido=&t=` | destino do link do e-mail; chama `checkout-pay` e vai ao Mercado Pago |
| `/compra/confirmada`, `/compra/pendente`, `/compra/erro` | retornos (as `back_urls` do Mercado Pago) |
| `/criar-senha` | destino do link do e-mail de acesso; define a senha e chama `account-confirm` |

O roteamento é por caminho, sem biblioteca (`src/lib/router.ts`). O site só conhece a URL pública
do Supabase e a chave **anon** (`src/data/cloud.ts`); o token do Mercado Pago e a chave service
role ficam só nos segredos das Edge Functions.

## Fidelidade ao produto

O conteúdo descreve o que existe de fato no aplicativo. Ao atualizar qualquer número — versão,
requisito mínimo, contagem de catálogo —, confira antes contra o próprio produto, nunca contra uma
versão anterior deste site.

Duas coisas que o site deliberadamente **não** afirma, por falta de dado verificável: mínimos de
RAM, CPU e GPU; e notarização pela Apple — a build usa assinatura própria, e o texto do site diz
isso em vez de prometer o contrário.

## Configuração

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `VITE_DOWNLOAD_ORIGIN` | Não | Sobrescreve a origem de onde os instaladores são servidos, sem barra no fim |

O site funciona sem configuração nenhuma: a origem padrão está em `DEFAULT_RELEASE_FEED`, em
`src/data/softwareData.ts`. Defina a variável apenas para apontar para outro endpoint — um domínio
próprio, por exemplo — sem precisar mexer no código.

Esse endereço é público por natureza: ele acaba no bundle de qualquer forma, porque o navegador
precisa dele para baixar o arquivo. Não é lugar para nada que precise ficar em segredo, e a
variável de ambiente não o torna secreto.

## Publicando uma versão nova

O site mantém sempre duas versões disponíveis:

| Rótulo | Constante | Papel |
| --- | --- | --- |
| Atual | `APP_VERSION` | Alvo da atualização automática. É o download padrão. |
| Estável | `FALLBACK_VERSION` | Versão anterior, para quem precisar voltar atrás. |

Desloque as duas em `src/data/softwareData.ts`: a `APP_VERSION` antiga vira a nova
`FALLBACK_VERSION`. As URLs são derivadas dessas constantes, então não há link para editar à mão —
o que também significa que uma versão sem artefato publicado vira um download quebrado. Confirme
que ambas respondem antes de fazer o deploy.
