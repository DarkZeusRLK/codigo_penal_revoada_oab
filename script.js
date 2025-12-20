document.addEventListener("DOMContentLoaded", function () {
  // ELEMENTOS DA INTERFACE
  const userNameSpan = document.getElementById("user-name");
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaOutput = document.getElementById("fianca-output");
  const inputDinheiroSujo = document.getElementById("input-dinheiro-sujo");
  const alertaPenaMaxima = document.getElementById("alerta-pena-maxima");

  // ATENUANTES
  const checkAdvogado = document.getElementById("atenuante-advogado");
  const checkPrimario = document.getElementById("atenuante-primario");
  const checkConfesso = document.getElementById("atenuante-confesso");

  let selectedCrimes = [];

  function mostrarAlerta(msg) {
    alert(msg);
  }

  // ATUALIZA TOTAIS COM LÓGICA DE ATENUANTES E LIMITADOR
  function atualizarTotais() {
    let penaBruta = 0;
    let multa = 0;
    let temInafiancavel = selectedCrimes.some((c) => c.infiancavel === true);

    selectedCrimes.forEach((c) => {
      penaBruta += c.pena || 0;
      multa += c.multa || 0;
    });

    // 1. APLICAR TRAVA DE 180 MESES NA PENA BRUTA
    let penaBase = Math.min(penaBruta, 180);

    if (penaBruta > 180) {
      alertaPenaMaxima?.classList.remove("hidden");
    } else {
      alertaPenaMaxima?.classList.add("hidden");
    }

    // 2. CALCULAR PORCENTAGEM DE REDUÇÃO (CUMULATIVA)
    // Advogado constituído é fixo (-20%)
    let reducao = 20;
    if (checkPrimario && checkPrimario.checked) reducao += 10;
    if (checkConfesso && checkConfesso.checked) reducao += 10;

    // 3. CALCULAR PENA FINAL
    let penaFinal = Math.floor(penaBase * (1 - reducao / 100));

    // DINHEIRO SUJO (SOMA NA MULTA)
    if (inputDinheiroSujo && inputDinheiroSujo.value) {
      let valorSujo = parseInt(inputDinheiroSujo.value.replace(/\D/g, "")) || 0;
      multa += valorSujo;
    }

    // FIANÇA: 3x a multa ou 0 se inafiançável
    const fianca = temInafiancavel ? 0 : multa * 3;

    // ATUALIZAR HTML
    if (penaTotalEl) penaTotalEl.textContent = penaFinal + " meses";
    if (multaTotalEl)
      multaTotalEl.textContent = "R$ " + multa.toLocaleString("pt-BR");
    if (fiancaOutput) {
      fiancaOutput.value = temInafiancavel
        ? "INAFIANÇÁVEL"
        : "R$ " + fianca.toLocaleString("pt-BR");
      fiancaOutput.style.color = temInafiancavel ? "#d32f2f" : "#2e7d32";
    }
  }

  // OUVINTES PARA OS CHECKBOXES DE ATENUANTES
  [checkPrimario, checkConfesso].forEach((el) => {
    el?.addEventListener("change", atualizarTotais);
  });

  if (inputDinheiroSujo) {
    inputDinheiroSujo.addEventListener("input", atualizarTotais);
  }

  // SELEÇÃO DE CRIMES
  document.querySelectorAll(".crime-item").forEach((item) => {
    item.addEventListener("click", () => {
      const artigo = item.dataset.artigo;
      const nome = item
        .querySelector(".crime-name")
        .textContent.replace(/\*\*/g, "")
        .trim();
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

  // BOTÃO COPIAR RELATÓRIO (FORMATO MD DISCORD)
  const btnEnviar = document.getElementById("btn-enviar");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      const nomePreso =
        document.getElementById("nome")?.value.trim() || "NÃO INFORMADO";
      const rgPreso = document.getElementById("rg")?.value.trim() || "N/I";
      const advogado =
        document.getElementById("advogado")?.value.trim() || "N/I";

      if (selectedCrimes.length === 0)
        return mostrarAlerta("Selecione os crimes antes de copiar!");

      const crimesMD = selectedCrimes
        .map((c) => `• Art. ${c.artigo} - ${c.nome}`)
        .join("\n");

      // BLOCO DE CÓDIGO MD PARA FUNDO PRETO NO DISCORD
      const markdown =
        "```md\n" +
        `# RELATÓRIO DE PRISÃO - ADVOCACIA

[IDENTIFICAÇÃO]
CIDADÃO: ${nomePreso}
RG/ID: ${rgPreso}
ADVOGADO: ${advogado}

[CRIMES]
${crimesMD}

[SENTENÇA FINAL]
PENA: ${penaTotalEl.textContent}
MULTA: ${multaTotalEl.textContent}
FIANÇA: ${fiancaOutput.value}

Gerado por: ${userNameSpan?.value || "Sistema"}` +
        "\n```";

      navigator.clipboard.writeText(markdown).then(() => {
        alert("Relatório copiado para o Discord!");
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
    document.getElementById("advogado").value = "";
    if (inputDinheiroSujo) inputDinheiroSujo.value = "";
    if (checkPrimario) checkPrimario.checked = false;
    if (checkConfesso) checkConfesso.checked = false;
    atualizarTotais();
  });
});
