# Criterios de aceitacao

Projeto: NOME-DO-PROJETO
URL de producao: https://NOME-DO-PROJETO.pages.dev
Dupla: NOME 1 e NOME 2
Data: ____/____/______

- [ ] o site e servido pelo endereco pages.dev atribuido a equipe;
- [ ] os arquivos estaticos e as Functions compartilham a mesma origem;
- [ ] o projeto foi publicado por integracao com GitHub;
- [ ] a equipe nao instalou nem executou Node.js, npm, npx ou Wrangler;
- [ ] cada provedor usa uma URL de retorno propria e exata;
- [ ] os pedidos de autorizacao usam codigo e PKCE S256;
- [ ] a Function apresenta o Client Secret correto somente na troca de tokens;
- [ ] o retorno recusa uma transacao ausente, expirada, alterada ou reutilizada;
- [ ] o id_token do Google so produz uma sessao depois da validacao criptografica e semantica;
- [ ] o access_token do GitHub e usado somente para consultar /user e a autorizacao e revogada
      antes da criacao da sessao;
- [ ] o cookie de sessao e opaco, Secure, HttpOnly, SameSite=Strict e nao possui Domain;
- [ ] o D1 guarda o resumo do cookie, nao seu valor bruto;
- [ ] /api/me devolve somente o perfil necessario;
- [ ] o logout confere Origin, remove a sessao e expira o cookie;
- [ ] um cookie revogado nao restaura a sessao;
- [ ] tokens e segredos nao aparecem no HTML, nas URLs salvas, no armazenamento Web ou nos registros;
- [ ] a dupla consegue explicar por que os arquivos estaticos permanecem publicos;
- [ ] as sessoes administrativas foram encerradas no computador compartilhado.

Responsavel pela rotacao dos Client Secrets: ____________________

Assinatura 1: ____________________   Assinatura 2: ____________________
