document.addEventListener("DOMContentLoaded", function () {
  // ELEMENTOS DA INTERFACE
  const userNameSpan = document.getElementById("user-name");
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaOutput = document.getElementById("fianca-output");
  const inputDinheiroSujo = document.getElementById("input-dinheiro-sujo");
  const containerDinheiroSujo = document.getElementById(
    "container-dinheiro-sujo"
  );
  const alertaPenaMaxima = document.getElementById("alerta-pena-maxima");

  // ATENUANTES
  const checkAdvogado = document.getElementById("atenuante-advogado");
  const checkPrimario = document.getElementById("atenuante-primario");
  const checkConfesso = document.getElementById("atenuante-confesso");

  let selectedCrimes = [];

  function mostrarAlerta(msg) {
    alert(msg);
  }

  function atualizarTotais() {
    let penaBruta = 0;
    let temInafiancavel = selectedCrimes.some((c) => c.infiancavel === true);

    // soma multas dos crimes (sem contar por enquanto o dinheiro sujo)
    let multaCrimes = 0;
    selectedCrimes.forEach((c) => {
      penaBruta += c.pena || 0;
      multaCrimes += c.multa || 0;
    });

    // trava de 180 meses
    let penaBase = Math.min(penaBruta, 180);

    if (penaBruta > 180) alertaPenaMaxima?.classList.remove("hidden");
    else alertaPenaMaxima?.classList.add("hidden");

    // atenuantes
    let reducao = 20;
    if (checkPrimario && checkPrimario.checked) reducao += 10;
    if (checkConfesso && checkConfesso.checked) reducao += 10;

    let penaFinal = Math.floor(penaBase * (1 - reducao / 100));

    // multa inicial (somente crimes)
    let multa = multaCrimes;

    // DINHEIRO SUJO: metade do valor é acrescentada à multa
    let valorSujo = 0;
    if (inputDinheiroSujo && inputDinheiroSujo.value) {
      valorSujo = parseInt(inputDinheiroSujo.value.replace(/\D/g, "")) || 0;
      multa += Math.round(valorSujo / 2);
    }

    // FIANÇA: se inafiançável -> 0, senão -> fiança base (3x multas dos crimes) + 1.5x do dinheiro sujo
    const fiancaBase = temInafiancavel ? 0 : multaCrimes * 3;
    const fiancaPorDinheiro = temInafiancavel ? 0 : Math.round(valorSujo * 1.5);
    const fianca = temInafiancavel ? 0 : fiancaBase + fiancaPorDinheiro;

    // Atualizar DOM
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

  // ouvintes atenuantes
  [checkPrimario, checkConfesso].forEach((el) =>
    el?.addEventListener("change", atualizarTotais)
  );

  // formatação do input dinheiro sujo
  if (inputDinheiroSujo) {
    inputDinheiroSujo.addEventListener("input", (e) => {
      const el = e.target;
      const onlyNums = el.value.replace(/\D/g, "");
      if (!onlyNums) {
        el.value = "";
        atualizarTotais();
        return;
      }
      const num = parseInt(onlyNums, 10) || 0;
      el.value = num.toLocaleString("pt-BR");
      atualizarTotais();
    });
  }

  // seleção de crimes
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
        if (artigo === "139") {
          containerDinheiroSujo?.classList.add("hidden");
          if (inputDinheiroSujo) inputDinheiroSujo.value = "";
        }
      } else {
        selectedCrimes.push({ artigo, nome, pena, multa, infiancavel });
        item.classList.add("selected");
        if (artigo === "139") {
          containerDinheiroSujo?.classList.remove("hidden");
          setTimeout(() => inputDinheiroSujo?.focus(), 50);
        }
      }

      atualizarTotais();
    });
  });

  // botão copiar relatório
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

      const markdown =
        "```md\n" +
        `# RELATÓRIO DE PRISÃO - ADVOCACIA\n\n[IDENTIFICAÇÃO]\nCIDADÃO: ${nomePreso}\nRG/ID: ${rgPreso}\nADVOGADO: ${advogado}\n\n[CRIMES]\n${crimesMD}\n\n[SENTENÇA FINAL]\nPENA: ${
          penaTotalEl.textContent
        }\nMULTA: ${multaTotalEl.textContent}\nFIANÇA: ${
          fiancaOutput.value
        }\n\nGerado por: ${userNameSpan?.value || "Sistema"}` +
        "\n```";

      navigator.clipboard.writeText(markdown).then(() => {
        alert("Relatório copiado para o Discord!");
      });
    });
  }

  // botão limpar
  document.getElementById("btn-limpar")?.addEventListener("click", () => {
    selectedCrimes = [];
    document
      .querySelectorAll(".crime-item")
      .forEach((i) => i.classList.remove("selected"));
    document.getElementById("nome").value = "";
    document.getElementById("rg").value = "";
    document.getElementById("advogado").value = "";
    if (inputDinheiroSujo) inputDinheiroSujo.value = "";
    if (containerDinheiroSujo) containerDinheiroSujo.classList.add("hidden");
    if (checkPrimario) checkPrimario.checked = false;
    if (checkConfesso) checkConfesso.checked = false;
    atualizarTotais();
  });

  // inicializa totais
  atualizarTotais();
});
