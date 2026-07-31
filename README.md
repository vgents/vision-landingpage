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

O conteúdo descreve o que existe de fato no app. Ao atualizar, confira contra a fonte da verdade no
repositório do produto:

| Informação | Onde conferir |
| --- | --- |
| Versão empacotada | `apps/packaged/package.json` |
| Mínimo de macOS | `Info.plist` do app, chave `LSMinimumSystemVersion` |
| Contagens do catálogo | diretórios `design-systems/`, `skills/`, `design-templates/` |
| CLIs de agente reconhecidos | `apps/web/public/agent-icons/` |

Duas coisas que o site deliberadamente **não** afirma, por falta de dado verificável: mínimos de
RAM, CPU e GPU; e notarização pela Apple — a build usa assinatura própria, e o texto do site diz
isso em vez de prometer o contrário.

## Distribuição do instalador

O DMG é servido pelo feed de releases em Cloudflare R2 — o mesmo bucket
(`visiondesign-releases`) que o app instalado consulta para se atualizar. O site aponta para os
artefatos canônicos publicados por `tools-pack publish`, nunca para cópias próprias.

**O site mantém sempre duas versões no ar:**

| Rótulo | Constante | Papel |
| --- | --- | --- |
| Atual | `APP_VERSION` | Alvo da atualização automática. É o download padrão. |
| Estável | `FALLBACK_VERSION` | Versão anterior, para quem precisar voltar atrás. |

Ao publicar uma versão nova, desloque as duas em `src/data/softwareData.ts`: a `APP_VERSION` antiga
vira a nova `FALLBACK_VERSION`. As URLs são derivadas das versões, seguindo o caminho do bucket
`stable/versions/<versão>/vision-design-<versão>-mac-arm64.dmg` — não há link para editar à mão.

Antes de deslocar, confirme que os dois artefatos respondem no feed público, incluindo os `.sha256`
que o site expõe para conferência.

> O Supabase Storage do projeto não serve para isso: o plano Free limita cada arquivo a 50 MB e o
> instalador tem 279 MB. R2 também não cobra egress, o que importa num binário desse tamanho.
