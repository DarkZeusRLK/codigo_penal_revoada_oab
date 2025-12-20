document.addEventListener("DOMContentLoaded", function () {
  const userNameSpan = document.getElementById("user-name");
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaTotalEl = document.getElementById("fianca-total");
  const inputDinheiroSujo = document.getElementById("dinheiro-sujo");

  let selectedCrimes = [];

  function mostrarAlerta(msg, tipo = "info") {
    alert(msg);
  }

  function atualizarTotais() {
    let pena = 0;
    let multa = 0;

    selectedCrimes.forEach((c) => {
      pena += c.pena || 0;
      multa += c.multa || 0;
    });

    if (inputDinheiroSujo && inputDinheiroSujo.value) {
      multa += parseInt(inputDinheiroSujo.value.replace(/\./g, "")) || 0;
    }

    const fianca = multa * 3;

    if (penaTotalEl) penaTotalEl.textContent = pena + " meses";
    if (multaTotalEl)
      multaTotalEl.textContent = "R$ " + multa.toLocaleString("pt-BR");
    if (fiancaTotalEl)
      fiancaTotalEl.textContent = "R$ " + fianca.toLocaleString("pt-BR");
  }

  // SELEÇÃO DE CRIMES
  document.querySelectorAll(".crime-item").forEach((item) => {
    item.addEventListener("click", () => {
      const artigo = item.dataset.artigo;
      // Busca o nome dentro do span se o dataset estiver vazio
      const nome =
        item.querySelector(".crime-name")?.textContent || "Crime s/ nome";
      const pena = parseInt(item.dataset.pena) || 0;
      const multa = parseInt(item.dataset.multa) || 0;

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

  // BOTÃO COPIAR RELATÓRIO (MARKDOWN DISCORD)
  const btnEnviar = document.getElementById("btn-enviar");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      const nomePreso =
        document.getElementById("nome")?.value.trim() || "NÃO INFORMADO";
      const rgPreso =
        document.getElementById("rg")?.value.trim() || "NÃO INFORMADO";
      const advogado =
        document.getElementById("advogado")?.value.trim() || "NÃO INFORMADO";

      if (selectedCrimes.length === 0) {
        return mostrarAlerta("Selecione pelo menos um crime.", "error");
      }

      let crimesTexto = selectedCrimes
        .map((c) => `- ${c.nome} (Art. ${c.artigo})`)
        .join("\n");

      const penaFinal = penaTotalEl.textContent;
      const multaFinal = multaTotalEl.textContent;
      const fiancaFinal = fiancaTotalEl.textContent;

      const markdown = `
**📑 RELATÓRIO DE DETENÇÃO**

**👤 NOME DO PRESO:** ${nomePreso}
**🆔 ID/RG:** ${rgPreso}
**⚖️ ADVOGADO/OAB:** ${advogado}

**🚨 CRIMES COMETIDOS:**
${crimesTexto}

**📊 PENALIDADE:**
- **Pena Total:** ${penaFinal}
- **Multa:** ${multaFinal}
- **Fiança Sugerida:** ${fiancaFinal}

_Gerado por: ${userNameSpan?.value || "Sistema de Advocacia"}_
`.trim();

      copiarTexto(markdown);
    });
  }

  function copiarTexto(texto) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        mostrarAlerta("Relatório copiado para o Discord!", "success");
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      mostrarAlerta("Relatório copiado!", "success");
    }
  }

  // LIMPAR TUDO
  const btnLimpar = document.getElementById("btn-limpar");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      selectedCrimes = [];
      document
        .querySelectorAll(".crime-item")
        .forEach((i) => i.classList.remove("selected"));
      document.getElementById("nome").value = "";
      document.getElementById("rg").value = "";
      document.getElementById("advogado").value = "";
      atualizarTotais();
    });
  }
});
