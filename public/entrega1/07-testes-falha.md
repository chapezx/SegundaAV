# Testes de falha

Cada caso registra preparacao, pedido enviado, resultado esperado e resultado observado.
Nenhum valor de cookie, codigo, token, state, nonce ou code_challenge aparece neste arquivo.

<!-- ANTES DE ENTREGAR: execute cada caso na URL de producao e troque cada [PREENCHER]
     pelo que voce viu de verdade (estado HTTP e corpo, na aba Network). Depois apague
     este comentario e as linhas "Deve aparecer". -->

## Caso 1: retorno sem cookie temporario

- **Preparacao:** login iniciado em uma janela comum e interrompido na pagina do provedor; a URL
  de autorizacao foi copiada para uma janela privativa sem o cookie `__Host-oauth-tx`, e o login
  foi concluido nessa segunda janela.
- **Pedido enviado:** `GET /oauth/callback/{provedor}?code=[REMOVIDO]&state=[REMOVIDO]` sem o
  cookie `__Host-oauth-tx`.
- **Resultado esperado:** recusa do retorno e nenhuma sessao criada.
- **Resultado observado:** [PREENCHER]
  - Deve aparecer: HTTP 400, corpo `{"error":"transacao ausente"}`, sem `Set-Cookie` de sessao.

## Caso 2: state alterado

- **Preparacao:** novo login interrompido na pagina do provedor, antes das credenciais; um unico
  caractere do parametro `state` foi alterado na barra de endereco.
- **Pedido enviado:** retorno com o `state` alterado. A URL modificada nao foi registrada porque
  contem valores transitorios.
- **Resultado esperado:** recusa antes da troca do codigo.
- **Resultado observado:** [PREENCHER]
  - Deve aparecer: HTTP 400, corpo `{"error":"state invalido"}`.

## Caso 3: reutilizacao da transacao

- **Preparacao:** fluxo concluido com sucesso; a requisicao de retorno foi copiada com Copy URL no
  painel Network.
- **Pedido enviado:** a mesma URL de retorno aberta uma segunda vez.
- **Resultado esperado:** falha, pois a transacao ja foi apagada do D1 e o cookie temporario foi
  limpo no primeiro retorno.
- **Resultado observado:** [PREENCHER]
  - Deve aparecer: HTTP 400, corpo `{"error":"transacao ausente"}` (o cookie `__Host-oauth-tx`
    foi expirado no retorno bem-sucedido).

## Caso 4: sessao expirada

- **Preparacao:** sessao de teste criada; no console do D1 foi executado
  `UPDATE sessions SET expires_at = 0;`.
- **Pedido enviado:** `GET /api/me` apos recarregar a pagina.
- **Resultado esperado:** HTTP 401.
- **Resultado observado:** [PREENCHER]
  - Deve aparecer: HTTP 401, corpo `{"error":"sessao invalida"}`, `Cache-Control: no-store`;
    a pagina mostra "Nenhuma sessao neste navegador.".

## Caso 5: origem invalida na saida

- **Preparacao:** sessao valida aberta em URL_BASE e uma segunda aba em https://example.com.
- **Pedido enviado:** `fetch("URL_BASE/oauth/logout", { method: "POST", credentials: "include" })`
  executado no console de https://example.com.
- **Resultado esperado:** recusa da operacao e permanencia da sessao original.
- **Resultado observado:** [PREENCHER]
  - Deve aparecer: na aba Network, HTTP 403 com `{"error":"origem invalida"}`; no console, um
    erro de CORS (a resposta nao e liberada para example.com). De volta a URL_BASE, `/api/me`
    continua respondendo 200.

## Caso 6: reutilizacao do cookie revogado

- **Preparacao:** sessao exclusiva do laboratorio; o valor do cookie `__Host-session` foi copiado
  temporariamente e apagado logo apos o teste. O valor nao aparece nesta evidencia.
- **Pedido enviado:** logout, restauracao do mesmo valor de cookie e `GET /api/me`.
- **Resultado esperado:** HTTP 401, pois a linha foi removida do D1.
- **Resultado observado:** [PREENCHER]
  - Deve aparecer: HTTP 401, corpo `{"error":"sessao invalida"}`.
