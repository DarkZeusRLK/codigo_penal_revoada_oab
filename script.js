document.addEventListener("DOMContentLoaded", function () {
  const userNameSpan = document.getElementById("user-name");
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaTotalEl = document.getElementById("fianca-output"); // ID do input no HTML
  const inputDinheiroSujo = document.getElementById("input-dinheiro-sujo");

  let selectedCrimes = [];

  function mostrarAlerta(msg, tipo = "info") {
    alert(msg);
  }

  function atualizarTotais() {
    let pena = 0;
    let multa = 0;
    // Verifica se algum crime selecionado é inafiançável
    let temInafiancavel = selectedCrimes.some((c) => c.infiancavel === true);

    selectedCrimes.forEach((c) => {
      pena += c.pena || 0;
      multa += c.multa || 0;
    });

    if (inputDinheiroSujo && inputDinheiroSujo.value) {
      let valorSujo = parseInt(inputDinheiroSujo.value.replace(/\D/g, "")) || 0;
      multa += valorSujo;
    }

    // Se for inafiançável, a fiança é 0. Caso contrário, 3x a multa.
    const fianca = temInafiancavel ? 0 : multa * 3;

    if (penaTotalEl) penaTotalEl.textContent = pena + " meses";
    if (multaTotalEl)
      multaTotalEl.textContent = "R$ " + multa.toLocaleString("pt-BR");
    if (fiancaTotalEl) {
      fiancaTotalEl.value = temInafiancavel
        ? "INAFIANÇÁVEL"
        : "R$ " + fianca.toLocaleString("pt-BR");
      // Adiciona um estilo visual se for inafiançável
      fiancaTotalEl.style.color = temInafiancavel ? "#d32f2f" : "#2e7d32";
    }
  }

  document.querySelectorAll(".crime-item").forEach((item) => {
    item.addEventListener("click", () => {
      const artigo = item.dataset.artigo;
      const nome = item.querySelector(".crime-name").innerText;
      const pena = parseInt(item.dataset.pena) || 0;
      const multa = parseInt(item.dataset.multa) || 0;
      // Captura se o crime é inafiançável pelo atributo do HTML
      const infiancavel = item.dataset.infiancavel === "true";

      const index = selectedCrimes.findIndex((c) => c.artigo === artigo);

      if (index >= 0) {
        selectedCrimes.splice(index, 1);
        item.classList.remove("selected");
      } else {
        selectedCrimes.push({ artigo, nome, pena, multa, infiancavel });
        item.classList.add("selected");
      }
      atualizarTotais();
    });
  });

  const btnEnviar = document.getElementById("btn-enviar");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      const nomePreso =
        document.getElementById("nome")?.value.trim() || "NÃO INFORMADO";
      const rgPreso = document.getElementById("rg")?.value.trim() || "N/I";
      const advogado =
        document.getElementById("advogado")?.value.trim() || "N/I";

      if (selectedCrimes.length === 0)
        return mostrarAlerta("Selecione os crimes!");

      const crimesMD = selectedCrimes
        .map((c) => `- Art. ${c.artigo}: ${c.nome}`)
        .join("\n");

      // Relatório envolvido em blocos de código para a "tabela preta" no Discord
      const markdown =
        "```md\n" +
        `# RELATÓRIO DE DETENÇÃO - ADVOCACIA

[DADOS DO CLIENTE]
NOME: ${nomePreso}
ID/RG: ${rgPreso}
ADVOGADO: ${advogado}

[CRIMES SELECIONADOS]
${crimesMD}

[PENALIDADES FINAIS]
PENA TOTAL: ${penaTotalEl.textContent}
MULTA TOTAL: ${multaTotalEl.textContent}
FIANÇA: ${fiancaTotalEl.value}

Gerado por: ${userNameSpan?.value || "Sistema Revoada"}` +
        "\n```";

      navigator.clipboard.writeText(markdown).then(() => {
        mostrarAlerta("Relatório copiado (Markdown Code Block)!");
      });
    });
  }
});
