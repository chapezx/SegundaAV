# Criterios de aceitacao

Projeto: segundaav
URL de producao: https://segundaav.pages.dev
Dupla: Vitória Faranhas Braga e Victor Kovalski Barros
Data: 24/09/2026

- [x] o site e servido pelo endereco pages.dev atribuido a equipe;
- [x] os arquivos estaticos e as Functions compartilham a mesma origem;
- [x] o projeto foi publicado por integracao com GitHub;
- [x] a equipe nao instalou nem executou Node.js, npm, npx ou Wrangler;
- [x] cada provedor usa uma URL de retorno propria e exata;
- [x] os pedidos de autorizacao usam codigo e PKCE S256;
- [x] a Function apresenta o Client Secret correto somente na troca de tokens;
- [x] o retorno recusa uma transacao ausente, expirada, alterada ou reutilizada;
- [x] o id_token do Google so produz uma sessao depois da validacao criptografica e semantica;
- [x] o access_token do GitHub e usado somente para consultar /user e a autorizacao e revogada
      antes da criacao da sessao;
- [x] o cookie de sessao e opaco, Secure, HttpOnly, SameSite=Strict e nao possui Domain;
- [x] o D1 guarda o resumo do cookie, nao seu valor bruto;
- [x] /api/me devolve somente o perfil necessario;
- [x] o logout confere Origin, remove a sessao e expira o cookie;
- [x] um cookie revogado nao restaura a sessao;
- [x] tokens e segredos nao aparecem no HTML, nas URLs salvas, no armazenamento Web ou nos registros;
- [x] a dupla consegue explicar por que os arquivos estaticos permanecem publicos;
- [x] as sessoes administrativas foram encerradas no computador compartilhado.

Responsavel pela rotacao dos Client Secrets: Vitória Faranhas Braga

Assinatura 1: Vitória Faranhas Braga   Assinatura 2: Victor Kovalski Barros
