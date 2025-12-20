document.addEventListener("DOMContentLoaded", function () {
  // =========================================================
  // 1. CONFIGURAÇÕES E DADOS (CRIMES E VALORES)
  // =========================================================
  const CRIMES = {
    "CRIMES CONTRA A PESSOA": [
      { nome: "Homicídio Doloso", pena: 50, multa: 20000, fianca: 0 },
      { nome: "Homicídio Culposo", pena: 25, multa: 10000, fianca: 15000 },
      { nome: "Tentativa de Homicídio", pena: 30, multa: 15000, fianca: 0 },
      { nome: "Agressão", pena: 15, multa: 5000, fianca: 7500 },
      { nome: "Sequestro", pena: 40, multa: 15000, fianca: 0 },
    ],
    "CRIMES CONTRA O PATRIMÔNIO": [
      { nome: "Roubo", pena: 20, multa: 10000, fianca: 15000 },
      { nome: "Furto", pena: 10, multa: 5000, fianca: 7500 },
      { nome: "Roubo de Veículo", pena: 15, multa: 8000, fianca: 12000 },
      { nome: "Extorsão", pena: 25, multa: 12000, fianca: 18000 },
    ],
    "TRÁFICO E ILÍCITOS": [
      { nome: "Tráfico de Drogas", pena: 30, multa: 20000, fianca: 0 },
      { nome: "Porte de Arma (Ilegal)", pena: 20, multa: 10000, fianca: 15000 },
      { nome: "Posse de Itens Ilegais", pena: 15, multa: 7000, fianca: 10000 },
    ],
    // Você pode continuar adicionando suas categorias aqui...
  };

  let crimesSelecionados = [];
  let totalMeses = 0;
  let totalMulta = 0;
  let totalFianca = 0;

  // Seletores da Interface
  const inputNome = document.getElementById("input-nome");
  const inputId = document.getElementById("input-id");
  const listaCrimesUl = document.getElementById("lista-crimes-selecionados");
  const penaTxt = document.getElementById("total-pena");
  const multaTxt = document.getElementById("total-multa");
  const fiancaTxt = document.getElementById("total-fianca");
  const textareaItens = document.querySelector(".itens-apreendidos textarea");
  const btnPrincipal = document.getElementById("btn-enviar");
  const searchInput = document.getElementById("search-crimes");
  const containerCrimes = document.getElementById("container-crimes");

  // Ajuste do Botão Principal
  if (btnPrincipal) {
    btnPrincipal.innerHTML =
      '<i class="fa-solid fa-copy"></i> COPIAR RELATÓRIO';
    btnPrincipal.style.background = "var(--gold-accent)";
    btnPrincipal.style.color = "#000";
  }

  // =========================================================
  // 2. LÓGICA DE INTERFACE (PESQUISA E SELEÇÃO)
  // =========================================================

  function renderizarListaCrimes(filtro = "") {
    if (!containerCrimes) return;
    containerCrimes.innerHTML = "";

    for (const categoria in CRIMES) {
      const crimesFiltrados = CRIMES[categoria].filter((c) =>
        c.nome.toLowerCase().includes(filtro.toLowerCase())
      );

      if (crimesFiltrados.length > 0) {
        const divCat = document.createElement("div");
        divCat.className = "categoria-box";
        divCat.innerHTML = `<h4>${categoria}</h4>`;

        crimesFiltrados.forEach((crime) => {
          const btn = document.createElement("button");
          btn.className = "btn-crime";
          btn.innerText = crime.nome;
          btn.onclick = () => adicionarCrime(crime);
          divCat.appendChild(btn);
        });
        containerCrimes.appendChild(divCat);
      }
    }
  }

  function adicionarCrime(crime) {
    crimesSelecionados.push(crime);
    atualizarResumo();
  }

  window.removerCrime = function (index) {
    crimesSelecionados.splice(index, 1);
    atualizarResumo();
  };

  function atualizarResumo() {
    totalMeses = 0;
    totalMulta = 0;
    totalFianca = 0;
    let inafiancavel = false;

    listaCrimesUl.innerHTML = "";

    crimesSelecionados.forEach((c, index) => {
      totalMeses += c.pena;
      totalMulta += c.multa;
      if (c.fianca === 0) inafiancavel = true;
      totalFianca += c.fianca;

      const li = document.createElement("li");
      li.innerHTML = `${c.nome} <i class="fa-solid fa-trash" onclick="removerCrime(${index})"></i>`;
      listaCrimesUl.appendChild(li);
    });

    // Atualização dos textos na tela
    penaTxt.innerText = `${totalMeses} Meses`;
    multaTxt.innerText = `R$ ${totalMulta.toLocaleString("pt-BR")}`;

    if (inafiancavel) {
      totalFianca = 0;
      fiancaTxt.innerText = "SEM DIREITO A FIANÇA";
      fiancaTxt.style.color = "var(--red-accent)";
      document.getElementById("fianca-breakdown")?.classList.add("hidden");
    } else {
      fiancaTxt.innerText = `R$ ${totalFianca.toLocaleString("pt-BR")}`;
      fiancaTxt.style.color = "var(--green-accent)";

      // Breakdown da Fiança (35% / 35% / 30%)
      if (totalFianca > 0) {
        document.getElementById("fianca-breakdown")?.classList.remove("hidden");
        document.getElementById("valor-policial").innerText = `R$ ${(
          totalFianca * 0.35
        ).toLocaleString("pt-BR")}`;
        document.getElementById("valor-painel").innerText = `R$ ${(
          totalFianca * 0.35
        ).toLocaleString("pt-BR")}`;
        document.getElementById("valor-advogado").innerText = `R$ ${(
          totalFianca * 0.3
        ).toLocaleString("pt-BR")}`;
      }
    }
  }

  // Escutador de Pesquisa
  if (searchInput) {
    searchInput.addEventListener("input", (e) =>
      renderizarListaCrimes(e.target.value)
    );
  }

  // =========================================================
  // 3. FUNÇÃO DE CÓPIA (MARKDOWN DISCORD)
  // =========================================================

  async function copiarRelatorio() {
    const nome = inputNome.value.trim();
    const id = inputId.value.trim();
    const itens = textareaItens.value.trim();

    if (!nome || !id) {
      alert("❌ Preencha o Nome e o ID do Cliente.");
      return;
    }

    if (crimesSelecionados.length === 0) {
      alert("❌ Adicione pelo menos um crime.");
      return;
    }

    // Formatação da lista de crimes
    const listaFormatada = crimesSelecionados
      .map((c) => `> • ${c.nome}`)
      .join("\n");

    // Construção do Texto (Markdown)
    const relatorioMD = `
### ⚖️ **RELATÓRIO DE ADVOCACIA**

**👤 CLIENTE:** ${nome}
**🆔 ID:** ${id}

**📂 CRIMES:**
${listaFormatada}

**📦 ITENS APREENDIDOS:**
\`\`\`
${itens || "Nenhum item registrado."}
\`\`\`

**--------------------------------------------**
**⚖️ PENA TOTAL:** ${totalMeses} meses
**💰 MULTA TOTAL:** R$ ${totalMulta.toLocaleString("pt-BR")}
**💸 FIANÇA:** ${
      totalFianca > 0
        ? "R$ " + totalFianca.toLocaleString("pt-BR")
        : "❌ INAFIANÇÁVEL"
    }
**--------------------------------------------**
`;

    try {
      await navigator.clipboard.writeText(relatorioMD.trim());

      // Feedback no botão
      const textoOriginal = btnPrincipal.innerHTML;
      btnPrincipal.innerHTML =
        '<i class="fa-solid fa-check"></i> COPIADO COM SUCESSO!';
      btnPrincipal.style.background = "var(--green-accent)";

      setTimeout(() => {
        btnPrincipal.innerHTML = textoOriginal;
        btnPrincipal.style.background = "var(--gold-accent)";
      }, 3000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      alert("Erro ao copiar para a área de transferência.");
    }
  }

  // Evento do botão
  if (btnPrincipal) {
    btnPrincipal.addEventListener("click", copiarRelatorio);
  }

  // Inicializa a lista
  renderizarListaCrimes();
});
