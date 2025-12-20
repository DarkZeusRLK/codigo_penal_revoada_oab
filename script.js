document.addEventListener("DOMContentLoaded", function () {
  // CONFIGURAÇÕES GERAIS - IDs corrigidos para bater com o index.html
  const userNameSpan = document.getElementById("user-name");
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaTotalEl = document.getElementById("fianca-output"); // ID correto do HTML
  const inputDinheiroSujo = document.getElementById("input-dinheiro-sujo"); // ID correto do HTML

  let selectedCrimes = [];

  function mostrarAlerta(msg, tipo = "info") {
    alert(msg);
  }

  // ATUALIZA TOTAIS (PENA / MULTA / FIANÇA)
  function atualizarTotais() {
    let pena = 0;
    let multa = 0;

    selectedCrimes.forEach((c) => {
      pena += c.pena || 0;
      multa += c.multa || 0;
    });

    // Dinheiro sujo soma na multa
    if (inputDinheiroSujo && inputDinheiroSujo.value) {
      let valorSujo = parseInt(inputDinheiroSujo.value.replace(/\D/g, "")) || 0;
      multa += valorSujo;
    }

    // CÁLCULO DE FIANÇA: 3x o valor da multa
    const fianca = multa * 3;

    if (penaTotalEl) penaTotalEl.textContent = pena + " meses";
    if (multaTotalEl)
      multaTotalEl.textContent = "R$ " + multa.toLocaleString("pt-BR");
    if (fiancaTotalEl)
      fiancaTotalEl.value = "R$ " + fianca.toLocaleString("pt-BR");
  }

  // SELEÇÃO DE CRIMES
  document.querySelectorAll(".crime-item").forEach((item) => {
    item.addEventListener("click", () => {
      const artigo = item.dataset.artigo;
      // Busca o nome dentro do span porque o dataset-nome não existe no HTML
      const nome =
        item.querySelector(".crime-name").innerText.split(" - ")[1] || "Crime";
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

  // BOTÃO COPIAR RELATÓRIO (MD DISCORD)
  const btnEnviar = document.getElementById("btn-enviar");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      const nomePreso = document.getElementById("nome")?.value.trim();
      const rgPreso = document.getElementById("rg")?.value.trim() || "N/I";

      if (!nomePreso) {
        return mostrarAlerta("Preencha o nome do preso.", "error");
      }

      if (selectedCrimes.length === 0) {
        return mostrarAlerta("Selecione ao menos um crime.", "error");
      }

      const crimesMD = selectedCrimes
        .map((c) => `- Art. ${c.artigo}: ${c.nome}`)
        .join("\n");

      const markdown = `
**📋 RELATÓRIO DE PRISÃO**

**👤 Preso:** ${nomePreso}
**🆔 ID/RG:** ${rgPreso}

**⚖️ CRIMES:**
${crimesMD}

**📊 PENALIDADES:**
- **Pena:** ${penaTotalEl.textContent}
- **Multa:** ${multaTotalEl.textContent}
- **Fiança (3x):** ${fiancaTotalEl.value}

_Gerado por: ${userNameSpan?.value || "Sistema de Advocacia"}_
`.trim();

      copiarTexto(markdown);
    });
  }

  function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
      mostrarAlerta("Relatório copiado para o Discord!", "success");
    });
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
      if (inputDinheiroSujo) inputDinheiroSujo.value = "";
      atualizarTotais();
    });
  }
});
