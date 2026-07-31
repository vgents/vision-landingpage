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
```

## Stack

React 19 · Vite 6 · Tailwind CSS 4 · lucide-react

## Estrutura

```
public/                 favicon, logo e imagem de compartilhamento
src/
  data/softwareData.ts  todo o conteúdo textual do site
  components/           uma seção por arquivo
  index.css             tokens de marca (@theme do Tailwind 4)
```

**Todo o texto do site vive em `src/data/softwareData.ts`.** Versão, contagens do catálogo,
requisitos, funcionalidades e FAQ saem dali — os componentes só renderizam.

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
