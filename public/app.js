// Consulta a sessao na mesma origem. O navegador nunca recebe tokens.

fetch("/api/me", { credentials: "same-origin" })
    .then((response) => (response.ok ? response.json() : null))
    .then((user) => {
        const status = document.getElementById("status");
        const entrar = document.getElementById("entrar");
        const sair = document.getElementById("sair");

        if (!user) {
            status.textContent = "Nenhuma sessao neste navegador.";
            entrar.hidden = false;
            sair.hidden = true;
            return;
        }

        status.textContent = `Sessao de ${user.email ?? user.displayName}.`;
        document.getElementById("emissor").textContent = user.issuer;
        document.getElementById("assunto").textContent = user.subject;
        entrar.hidden = true;
        sair.hidden = false;
    })
    .catch(() => {
        document.getElementById("status").textContent = "A sessao nao pode ser consultada.";
    });
