# Contexto de Debug — Erro "invariant expected layout router to be mounted"

## Projeto
- Nome: `str-software`
- Caminho: `C:\Users\cotaw\Desktop\str\str-software1-main`
- Framework: Next.js 15.0.3 (App Router)
- React: 18.3.1 / React DOM: 18.3.1
- Dependências relevantes: `resend@4.8.0` (com `@react-email/render`)

## Erro original
```
Error: invariant expected layout router to be mounted
    at OuterLayoutRouter (.../next/dist/client/components/layout-router.js:351:15)
    ...
```
Stack trace inteiro composto por frames internos do Next.js/React — nenhuma referência direta ao código do usuário apareceu no stack.

## O que esse erro geralmente significa
Ocorre quando algo tenta acessar o contexto de roteamento do App Router (`next/link`, `useRouter`, `usePathname`, etc.) fora da árvore de componentes que o `LayoutRouter` do Next fornece.

## Hipóteses investigadas (e descartadas até agora)

| Hipótese | Verificação feita | Resultado |
|---|---|---|
| Versões incompatíveis Next/React | `npm ls next react react-dom` | ✅ OK — Next 15.0.3 + React 18.3.1 é combinação válida. Descartado. |
| Mistura de Pages Router (`next/router`) com App Router (`next/navigation`) | `findstr /S /M "next/router" *.tsx *.ts` | ✅ Só resultados em `node_modules`. Descartado. |
| Uso de `createPortal` no código do projeto | `findstr /S /M "createPortal" *.tsx *.ts` | ✅ Só resultado em `node_modules/@types`. Descartado. |

## Hipóteses ainda **não verificadas** (próximos passos)

1. **Momento exato do erro** — ainda não informado:
   - Em qual página/rota acontece?
   - Ao clicar em link/botão específico, ou ao carregar a página?
   - Só em `npm run dev` ou também em `npm run build && npm start`?

2. **Bibliotecas de UI com portal interno** (modais, dialogs, toasts, dropdowns) — ainda não confirmado se o projeto usa:
   - shadcn/ui, Radix UI, Headless UI, Material UI, Chakra, react-hot-toast, sonner, etc.
   - Mesmo sem `createPortal` explícito no código do usuário, essas libs usam portal internamente — se houver `<Link>` ou hook de rota dentro do conteúdo do modal/toast, pode ser a causa.

3. **Rotas paralelas ou interceptadas** — ainda não verificado:
   - Existem pastas como `@algumnome`, `(.)algo`, `(..)algo` dentro de `app/`?

4. **Component Stack do navegador** — ainda não coletado:
   - No console do navegador, abaixo do erro, geralmente aparece uma seção tipo "The above error occurred in the `<XComponent>` component", que aponta diretamente para o arquivo/componente do usuário causando o problema. Essa é a pista mais valiosa que falta.

## Próxima ação sugerida
Pedir ao usuário:
- Contexto de quando o erro aparece (rota, ação do usuário, dev vs prod)
- Confirmação de libs de UI usadas
- Verificar pastas especiais em `app/`
- Colar o "Component Stack" do console do navegador
