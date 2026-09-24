// Painel do laboratorio: JavaScript puro, sem bibliotecas.

// Texto exibido para cada situacao do arquivo dados.json.
const NOMES = {
    concluida: "Concluída",
    andamento: "Em andamento",
    pendente: "Pendente"
};

// 1. Pergunta ao servidor quem esta logado.
//    /api/me responde 200 com o perfil ou 401 quando nao ha sessao.
fetch("/api/me", { credentials: "same-origin" })
    .then((resposta) => (resposta.ok ? resposta.json() : null))
    .then((usuario) => {
        const saudacao = document.getElementById("saudacao");
        if (usuario) {
            saudacao.textContent = `Olá, ${usuario.displayName}! Você entrou pelo ${usuario.issuer}.`;
            document.getElementById("form-sair").hidden = false;
        } else {
            saudacao.textContent = "Você não está logado. O painel continua visível porque é um arquivo público.";
        }
    });

// 2. Le as etapas do arquivo dados.json e monta a tela.
fetch("/dashboard/dados.json")
    .then((resposta) => resposta.json())
    .then((etapas) => {
        // Conta quantas etapas existem em cada situacao.
        const total = etapas.length;
        const concluidas = etapas.filter((e) => e.status === "concluida").length;
        const andamento = etapas.filter((e) => e.status === "andamento").length;
        const pendentes = etapas.filter((e) => e.status === "pendente").length;

        // Preenche os cartoes.
        document.getElementById("total").textContent = total;
        document.getElementById("concluidas").textContent = concluidas;
        document.getElementById("andamento").textContent = andamento;
        document.getElementById("pendentes").textContent = pendentes;

        // Calcula o percentual e ajusta a largura da barra.
        const percentual = Math.round((concluidas / total) * 100);
        document.getElementById("preenchimento").style.width = `${percentual}%`;
        document.getElementById("percentual").textContent = `${percentual}% concluído`;

        // Cria uma linha da tabela para cada etapa.
        const linhas = document.getElementById("linhas");
        for (const etapa of etapas) {
            const linha = document.createElement("tr");

            const numero = document.createElement("td");
            numero.textContent = etapa.etapa;

            const titulo = document.createElement("td");
            titulo.textContent = etapa.titulo;

            const situacao = document.createElement("td");
            const selo = document.createElement("span");
            selo.className = `selo ${etapa.status}`;
            selo.textContent = NOMES[etapa.status];
            situacao.appendChild(selo);

            linha.append(numero, titulo, situacao);
            linhas.appendChild(linha);
        }
    })
    .catch(() => {
        document.getElementById("percentual").textContent = "Não foi possível carregar dados.json.";
    });
