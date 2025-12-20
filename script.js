document.addEventListener("DOMContentLoaded", function () {
  // =========================================================
  // CONFIGURAÇÕES GERAIS
  // =========================================================
  const userNameSpan = document.getElementById("user-name");
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaTotalEl = document.getElementById("fianca-total");
  const inputDinheiroSujo = document.getElementById("dinheiro-sujo");

  let selectedCrimes = [];

  // =========================================================
  // ALERTAS (SIMPLIFICADO)
  // =========================================================
  function mostrarAlerta(msg, tipo = "info") {
    alert(msg);
  }

  // =========================================================
  // ATUALIZA TOTAIS (PENA / MULTA / FIANÇA)
  // =========================================================
  function atualizarTotais() {
    let pena = 0;
    let multa = 0;

    selectedCrimes.forEach((c) => {
      pena += c.pena || 0;
      multa += c.multa || 0;
    });

    // Dinheiro sujo soma na multa
    if (inputDinheiroSujo && inputDinheiroSujo.value) {
      multa += parseInt(inputDinheiroSujo.value) || 0;
    }

    const fianca = multa * 3;

    if (penaTotalEl) penaTotalEl.textContent = pena + " meses";
    if (multaTotalEl)
      multaTotalEl.textContent = "R$ " + multa.toLocaleString("pt-BR");
    if (fiancaTotalEl)
      fiancaTotalEl.textContent = "R$ " + fianca.toLocaleString("pt-BR");
  }

  // =========================================================
  // SELEÇÃO DE CRIMES + TRAVAS
  // =========================================================
  document.querySelectorAll(".crime-item").forEach((item) => {
    item.addEventListener("click", () => {
      const artigo = item.dataset.artigo;
      const nome = item.dataset.nome;
      const pena = parseInt(item.dataset.pena) || 0;
      const multa = parseInt(item.dataset.multa) || 0;

      // ================= TRAVAS =================
      if (artigo === "124" && selectedCrimes.some((c) => c.artigo === "125")) {
        return mostrarAlerta(
          "Conflito: Porte não pode junto com Tráfico.",
          "error"
        );
      }

      if (artigo === "125" && selectedCrimes.some((c) => c.artigo === "124")) {
        return mostrarAlerta(
          "Conflito: Tráfico não pode junto com Porte.",
          "error"
        );
      }

      if (artigo === "161" && selectedCrimes.some((c) => c.artigo === "162")) {
        return mostrarAlerta("Conflito: Réu Primário x Reincidente.", "error");
      }

      // ================= SELEÇÃO =================
      const index = selectedCrimes.findIndex((c) => c.artigo === artigo);

      if (index >= 0) {
        selectedCrimes.splice(index, 1);
        item.classList.remove("selected");
      } else {
        selectedCrimes.push({ artigo, nome, pena, multa });
        item.classList.add("selected");
      }

      atualizarTotais();
    });
  });

  // =========================================================
  // BOTÃO COPIAR RELATÓRIO (MD DISCORD)
  // =========================================================
  const btnEnviar = document.getElementById("btn-enviar");

  if (btnEnviar) {
    btnEnviar.innerHTML = `<i class="fa-solid fa-copy"></i> COPIAR RELATÓRIO`;

    btnEnviar.addEventListener("click", () => {
      const nomePreso = document.getElementById("nome")?.value.trim();
      const rgPreso = document.getElementById("rg")?.value.trim() || "N/I";

      if (!nomePreso) {
        return mostrarAlerta("Preencha o nome do preso.", "error");
      }

      if (selectedCrimes.length === 0) {
        return mostrarAlerta("Selecione ao menos um crime.", "error");
      }

      // Trava Dinheiro Sujo
      const temDinheiroSujo = selectedCrimes.some((c) => c.artigo === "138");
      if (
        temDinheiroSujo &&
        (!inputDinheiroSujo.value || inputDinheiroSujo.value.trim() === "")
      ) {
        return mostrarAlerta("Informe o valor do Dinheiro Sujo.", "error");
      }

      // Recalcula para garantir valores corretos
      atualizarTotais();

      const multaTexto = multaTotalEl?.textContent || "N/D";
      const fiancaTexto = fiancaTotalEl?.textContent || "N/D";

      const crimesMD = selectedCrimes
        .map((c) => {
          const nomeCrime = (c.nome || "Crime sem descrição").replace(
            /\*\*/g,
            ""
          );
          return `- Art. ${c.artigo} — ${nomeCrime}`;
        })
        .join("\n");

      const markdown = `
**📄 RELATÓRIO DE PRISÃO**

**👤 Preso:** ${nomePreso}  
**🆔 ID:** ${rgPreso}

**⚖️ Crimes:**
${crimesMD}

**⏳ Pena Total:** ${penaTotalEl?.textContent || "N/D"}  
**💰 Multa Total:** ${multaTexto}  
**🏦 Fiança (3x multa):** ${fiancaTexto}

_Gerado por ${userNameSpan?.textContent || "Sistema"}_
`.trim();

      copiarTexto(markdown);
    });
  }

  // =========================================================
  // FUNÇÃO DE CÓPIA
  // =========================================================
  function copiarTexto(texto) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(texto)
        .then(() => {
          mostrarAlerta("Relatório copiado em Markdown!", "success");
        })
        .catch(() => fallbackCopy(texto));
    } else {
      fallbackCopy(texto);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    mostrarAlerta("Relatório copiado!", "success");
  }

  // =========================================================
  // LIMPAR TUDO
  // =========================================================
  const btnLimpar = document.getElementById("btn-limpar");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      selectedCrimes = [];
      document
        .querySelectorAll(".crime-item")
        .forEach((i) => i.classList.remove("selected"));
      if (inputDinheiroSujo) inputDinheiroSujo.value = "";
      atualizarTotais();
    });
  }
});
