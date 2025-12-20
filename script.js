document.addEventListener("DOMContentLoaded", function () {
  // CONFIGURAÇÕES GERAIS
  const userNameSpan = document.getElementById("user-name");
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaOutput = document.getElementById("fianca-output");
  const inputDinheiroSujo = document.getElementById("input-dinheiro-sujo");
  const alertaPenaMaxima = document.getElementById("alerta-pena-maxima");

  let selectedCrimes = [];

  function mostrarAlerta(msg) {
    alert(msg);
  }

  // ATUALIZA TOTAIS COM LIMITADOR DE 180 MESES
  function atualizarTotais() {
    let pena = 0;
    let multa = 0;
    let temInafiancavel = selectedCrimes.some((c) => c.infiancavel === true);

    selectedCrimes.forEach((c) => {
      pena += c.pena || 0;
      multa += c.multa || 0;
    });

    // DINHEIRO SUJO
    if (inputDinheiroSujo && inputDinheiroSujo.value) {
      let valorSujo = parseInt(inputDinheiroSujo.value.replace(/\D/g, "")) || 0;
      multa += valorSujo;
    }

    // TRAVA DE PENA MÁXIMA (180 MESES)
    if (pena > 180) {
      pena = 180;
      alertaPenaMaxima?.classList.remove("hidden");
    } else {
      alertaPenaMaxima?.classList.add("hidden");
    }

    // FIANÇA: 3x a multa ou 0 se inafiançável
    const fianca = temInafiancavel ? 0 : multa * 3;

    // Atualização do HTML
    if (penaTotalEl) penaTotalEl.textContent = pena + " meses";
    if (multaTotalEl)
      multaTotalEl.textContent = "R$ " + multa.toLocaleString("pt-BR");
    if (fiancaOutput) {
      fiancaOutput.value = temInafiancavel
        ? "INAFIANÇÁVEL"
        : "R$ " + fianca.toLocaleString("pt-BR");
      fiancaOutput.style.color = temInafiancavel ? "#d32f2f" : "#2e7d32";
    }
  }

  // SELEÇÃO DE CRIMES
  document.querySelectorAll(".crime-item").forEach((item) => {
    item.addEventListener("click", () => {
      const artigo = item.dataset.artigo;
      const nome = item.querySelector(".crime-name").textContent;
      const pena = parseInt(item.dataset.pena) || 0;
      const multa = parseInt(item.dataset.multa) || 0;
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

  // BOTÃO COPIAR RELATÓRIO (MD COM BLOCO DE CÓDIGO)
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
        .map((c) => `• Art. ${c.artigo}: ${c.nome}`)
        .join("\n");

      // Formatação Markdown com Bloco de Código (```md) para fundo preto no Discord
      const markdown =
        "```md\n" +
        `# RELATÓRIO DE DETENÇÃO - ADVOCACIA

[DADOS DO CIDADÃO]
NOME: ${nomePreso}
ID/RG: ${rgPreso}
ADVOGADO RESPONSÁVEL: ${advogado}

[CRIMES APLICADOS]
${crimesMD}

[RESUMO DA SENTENÇA]
PENA FINAL: ${penaTotalEl.textContent}
MULTA TOTAL: ${multaTotalEl.textContent}
VALOR DA FIANÇA: ${fiancaOutput.value}

Gerado via Calculadora Penal - Advocacia` +
        "\n```";

      navigator.clipboard.writeText(markdown).then(() => {
        alert("Relatório copiado com sucesso!");
      });
    });
  }

  // BOTÃO LIMPAR
  document.getElementById("btn-limpar")?.addEventListener("click", () => {
    selectedCrimes = [];
    document
      .querySelectorAll(".crime-item")
      .forEach((i) => i.classList.remove("selected"));
    document.getElementById("nome").value = "";
    document.getElementById("rg").value = "";
    if (inputDinheiroSujo) inputDinheiroSujo.value = "";
    atualizarTotais();
  });
});
