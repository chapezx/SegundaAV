// Painel: JavaScript puro, sem bibliotecas.
// Ele faz duas perguntas ao servidor e mostra as respostas na tela.

// Função pequena para escrever um texto em um elemento e escolher a cor.
function mostrar(id, texto, situacao) {
    const elemento = document.getElementById(id);
    elemento.textContent = texto;
    elemento.className = situacao; // "ok" (verde) ou "falha" (vermelho)
}

// Pergunta 1: o servidor está no ar?
// /api/health é uma Pages Function que sempre responde {"status":"ok"}.
fetch("/api/health")
    .then((resposta) => {
        if (resposta.ok) {
            mostrar("servidor", "No ar", "ok");
        } else {
            mostrar("servidor", "Com erro", "falha");
        }
    })
    .catch(() => mostrar("servidor", "Sem resposta", "falha"));

// Pergunta 2: quem está logado neste navegador?
// /api/me confere o cookie de sessão no D1.
// Responde 200 com o perfil ou 401 quando não há sessão.
fetch("/api/me", { credentials: "same-origin" })
    .then((resposta) => (resposta.ok ? resposta.json() : null))
    .then((usuario) => {
        if (!usuario) {
            document.getElementById("saudacao").textContent =
                "Você não está logado. Entre pela página inicial para ver seus dados.";
            mostrar("sessao", "Nenhuma", "falha");
            mostrar("provedor", "-", "");
            return;
        }

        // O issuer diz quem confirmou a identidade: Google ou GitHub.
        const provedor = usuario.issuer.includes("google") ? "Google" : "GitHub";

        document.getElementById("saudacao").textContent = `Olá, ${usuario.displayName}!`;
        mostrar("sessao", "Ativa", "ok");
        mostrar("provedor", provedor, "ok");

        // Preenche e mostra a seção "Seus dados" e o botão Sair.
        document.getElementById("nome").textContent = usuario.displayName;
        document.getElementById("email").textContent = usuario.email ?? "não informado";
        document.getElementById("identificador").textContent = usuario.subject;
        document.getElementById("dados").hidden = false;
        document.getElementById("form-sair").hidden = false;
    })
    .catch(() => {
        document.getElementById("saudacao").textContent = "Não foi possível consultar a sessão.";
    });
