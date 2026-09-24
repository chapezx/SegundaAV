# oauth-pages-lab

Login com Google e GitHub em um unico projeto do Cloudflare Pages, com sessao opaca em D1.
Sem Node.js, npm, npx, Wrangler ou bibliotecas externas: somente JavaScript e APIs Web.

## Estrutura

```
public/            arquivos estaticos e publicos (Build output directory)
  index.html       pagina de login (novo index)
  app.js           consulta /api/me na mesma origem
  styles.css
  entrega1/        evidencias avaliadas automaticamente
functions/         executado na Cloudflare (irmao de public, nunca dentro dele)
  _shared/         crypto, cookies, provedores e validacao OIDC
  api/health.js    GET  /api/health
  api/me.js        GET  /api/me
  oauth/login/[provider].js     GET  /oauth/login/{google|github}
  oauth/callback/[provider].js  GET  /oauth/callback/{google|github}
  oauth/logout.js               POST /oauth/logout
schema.sql         esquema para colar no console do D1
```

## Configuracao no painel

1. **Pages**: Framework preset `None`, Build command vazio, Build output directory `public`,
   Root directory vazio, ramificacao de producao `main`.
2. **D1**: banco `oauth-sessions-EQUIPE` com o conteudo de `schema.sql`; ligacao chamada
   exatamente `DB` em Settings > Bindings; nova implantacao depois de salvar.
3. **Variaveis** (texto simples): `PUBLIC_BASE_URL` (sem barra final), `GOOGLE_CLIENT_ID`,
   `GITHUB_CLIENT_ID`.
4. **Segredos** (marcar Encrypt): `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET`.
5. **Google**: cliente Web, escopos `openid email profile`, retorno
   `PUBLIC_BASE_URL/oauth/callback/google`.
6. **GitHub**: OAuth App, Homepage `PUBLIC_BASE_URL`, retorno
   `PUBLIC_BASE_URL/oauth/callback/github`, Device Flow desativado, sem escopos.

Nenhum segredo entra neste repositorio.

## Decisoes que o roteiro cobra

- 32 bytes de `crypto.getRandomValues()` em Base64URL (43 caracteres) para transacao, `state`,
  `nonce`, `code_verifier` e sessao.
- O D1 guarda apenas resumos SHA-256 dos cookies e do `state`; um vazamento do banco nao
  devolve um cookie reutilizavel.
- `code_challenge` = Base64URL(SHA-256(`code_verifier`)), com `code_challenge_method=S256`.
- `nonce` e `scope` so vao ao Google; o GitHub recebe o pedido sem os dois.
- A transacao e apagada antes da troca do codigo, entao o retorno nao pode ser repetido.
- O `id_token` do Google e verificado com o JWKS do documento de descoberta
  (RS256, RSASSA-PKCS1-v1_5) e com `iss`, `aud`, `exp`, `iat` e `nonce` antes de virar sessao.
- No GitHub, o `access_token` so consulta `/user`; a autorizacao e revogada com
  `DELETE /applications/{client_id}/grant` (204 obrigatorio) antes da criacao da sessao.
- `__Host-oauth-tx`: Path=/, HttpOnly, Secure, SameSite=Lax, Max-Age=600.
- `__Host-session`: Path=/, HttpOnly, Secure, SameSite=Strict, Max-Age=28800, sem Domain.
- `/oauth/logout` aceita somente POST e exige `Origin` igual a `PUBLIC_BASE_URL`.
- Todas as respostas dinamicas usam `Cache-Control: no-store`.
