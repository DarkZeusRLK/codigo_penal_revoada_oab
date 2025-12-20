document.addEventListener("DOMContentLoaded", function () {
  // 1. Dados dos Crimes
  const CRIMES = {
    "CRIMES CONTRA A PESSOA": [
      { nome: "Homicídio Doloso", pena: 50, multa: 20000, fianca: 0 },
      { nome: "Homicídio Culposo", pena: 25, multa: 10000, fianca: 15000 },
      { nome: "Tentativa de Homicídio", pena: 30, multa: 15000, fianca: 0 },
      { nome: "Agressão", pena: 15, multa: 5000, fianca: 7500 },
    ],
    "CRIMES CONTRA O PATRIMÔNIO": [
      { nome: "Roubo", pena: 20, multa: 10000, fianca: 15000 },
      { nome: "Furto", pena: 10, multa: 5000, fianca: 7500 },
    ],
    // Adicione mais crimes seguindo o mesmo padrão...
  };

  let selecionados = [];

  // Seletores
  const inputNome = document.getElementById("input-nome");
  const inputId = document.getElementById("input-id");
  const inputItens = document.getElementById("input-itens");
  const containerCrimes = document.getElementById("container-crimes");
  const listaUl = document.getElementById("lista-crimes-selecionados");
  const btnCopiar = document.getElementById("btn-copiar-relatorio");

  // Renderizar botões de crimes
  function renderizarMenuCrimes(filtro = "") {
    containerCrimes.innerHTML = "";
    for (let cat in CRIMES) {
      let crimesFiltrados = CRIMES[cat].filter((c) =>
        c.nome.toLowerCase().includes(filtro.toLowerCase())
      );

      if (crimesFiltrados.length > 0) {
        let div = document.createElement("div");
        div.className = "categoria-box";
        div.innerHTML = `<h4>${cat}</h4>`;

        crimesFiltrados.forEach((crime) => {
          let btn = document.createElement("button");
          btn.className = "btn-crime";
          btn.innerText = crime.nome;
          btn.onclick = () => {
            selecionados.push({ ...crime }); // Copia o objeto para evitar bugs
            atualizarInterface();
          };
          div.appendChild(btn);
        });
        containerCrimes.appendChild(div);
      }
    }
  }

  // Atualizar Totais e Lista na Tela
  function atualizarInterface() {
    listaUl.innerHTML = "";
    let p = 0,
      m = 0,
      f = 0,
      inafiancavel = false;

    selecionados.forEach((c, i) => {
      p += c.pena;
      m += c.multa;
      if (c.fianca === 0) inafiancavel = true;
      f += c.fianca;

      let li = document.createElement("li");
      li.innerHTML = `${c.nome} <i class="fa-solid fa-trash" onclick="removerCrime(${i})"></i>`;
      listaUl.appendChild(li);
    });

    document.getElementById("total-pena").innerText = `${p} Meses`;
    document.getElementById("total-multa").innerText = `R$ ${m.toLocaleString(
      "pt-BR"
    )}`;

    const fiancaTxt = document.getElementById("total-fianca");
    const breakdown = document.getElementById("fianca-breakdown");

    if (inafiancavel || f === 0) {
      fiancaTxt.innerText = "INAFIANÇÁVEL";
      fiancaTxt.style.color = "var(--red-accent)";
      breakdown.classList.add("hidden");
    } else {
      fiancaTxt.innerText = `R$ ${f.toLocaleString("pt-BR")}`;
      fiancaTxt.style.color = "var(--green-accent)";
      breakdown.classList.remove("hidden");

      // Cálculos da Fiança
      document.getElementById("valor-policial").innerText = `R$ ${(
        f * 0.35
      ).toLocaleString("pt-BR")}`;
      document.getElementById("valor-painel").innerText = `R$ ${(
        f * 0.35
      ).toLocaleString("pt-BR")}`;
      document.getElementById("valor-advogado").innerText = `R$ ${(
        f * 0.3
      ).toLocaleString("pt-BR")}`;
    }
  }

  // Função Global para remover (chamada pelo HTML)
  window.removerCrime = (index) => {
    selecionados.splice(index, 1);
    atualizarInterface();
  };

  // Gerar e Copiar Relatório MD
  btnCopiar.onclick = async function () {
    const nome = inputNome.value.trim();
    const id = inputId.value.trim();
    const itens = inputItens.value.trim();

    if (!nome || !id || selecionados.length === 0) {
      return alert("❌ Preencha Nome, ID e selecione os crimes!");
    }

    // Montagem da lista de crimes sem erros de descrição
    const crimesTexto = selecionados
      .map((c) => `> • **${c.nome}** (${c.pena} meses)`)
      .join("\n");

    const relatorio = `
### ⚖️ **RELATÓRIO DE ADVOCACIA**

**👤 CLIENTE:** ${nome}
**🆔 PASSAPORTE:** ${id}

**📂 CRIMES SELECIONADOS:**
${crimesTexto}

**📦 ITENS APREENDIDOS:**
\`\`\`
${itens || "Nenhum item registrado."}
\`\`\`

**--------------------------------------------**
**⚖️ PENA TOTAL:** ${document.getElementById("total-pena").innerText}
**💰 MULTA TOTAL:** ${document.getElementById("total-multa").innerText}
**💸 FIANÇA:** ${document.getElementById("total-fianca").innerText}
**--------------------------------------------**
`.trim();

    try {
      await navigator.clipboard.writeText(relatorio);
      const originalText = btnCopiar.innerHTML;
      btnCopiar.innerHTML = "✅ COPIADO COM SUCESSO!";
      btnCopiar.style.background = "#04d361";
      setTimeout(() => {
        btnCopiar.innerHTML = originalText;
        btnCopiar.style.background = "";
      }, 2000);
    } catch (err) {
      alert("Erro ao copiar: " + err);
    }
  };

  // Busca
  document.getElementById("search-crimes").oninput = (e) =>
    renderizarMenuCrimes(e.target.value);

  // Inicializar
  renderizarMenuCrimes();
});
