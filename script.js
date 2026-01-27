document.addEventListener("DOMContentLoaded", function () {
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaOutput = document.getElementById("fianca-output");
  const inputDinheiroSujo = document.getElementById("input-dinheiro-sujo");
  const containerDinheiroSujo = document.getElementById("container-dinheiro-sujo");
  const alertaPenaMaxima = document.getElementById("alerta-pena-maxima");
  const alertaInafiancavel = document.getElementById("alerta-inafiancavel");
  const crimesListOutput = document.getElementById("crimes-list-output");
  const fiancaBreakdown = document.getElementById("fianca-breakdown");
  const valorPainel = document.getElementById("valor-painel");
  const valorPolicial = document.getElementById("valor-policial");
  const valorAdvogado = document.getElementById("valor-advogado");
  const boxUploadDeposito = document.getElementById("box-upload-deposito");

  const checkAdvogado = document.getElementById("atenuante-advogado");
  const checkPrimario = document.getElementById("atenuante-primario");
  const checkConfesso = document.getElementById("atenuante-confesso");

  const fiancaSim = document.getElementById("fianca-sim");
  const fiancaNao = document.getElementById("fianca-nao");

  const crimeItems = Array.from(document.querySelectorAll(".crime-item"));
  let selectedCrimes = [];

  function formatCurrency(value) {
    return "R$ " + value.toLocaleString("pt-BR");
  }

  function showAlert(message) {
    alert(message);
  }

  function getReducaoPercent() {
    let reducao = 0;
    [checkAdvogado, checkPrimario, checkConfesso].forEach((el) => {
      if (el && el.checked) {
        const val = parseInt(el.dataset.percent, 10) || 0;
        reducao += Math.abs(val);
      }
    });
    return reducao;
  }

  function renderSelectedCrimes() {
    if (!crimesListOutput) return;

    crimesListOutput.innerHTML = "";

    if (selectedCrimes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-message";
      empty.textContent = "Nenhum crime selecionado";
      crimesListOutput.appendChild(empty);
      return;
    }

    selectedCrimes.forEach((crime) => {
      const row = document.createElement("div");
      row.className = "crime-output-item";

      const label = document.createElement("span");
      label.textContent = "Art. " + crime.artigo + " - " + crime.nome;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.title = "Remover";
      removeBtn.innerHTML = "&times;";
      removeBtn.addEventListener("click", () => {
        toggleCrime(crime.artigo, true);
      });

      row.appendChild(label);
      row.appendChild(removeBtn);
      crimesListOutput.appendChild(row);
    });
  }

  function updateFiancaUI(fianca, temInafiancavel) {
    if (!fiancaOutput) return;

    if (temInafiancavel) {
      fiancaOutput.value = "INAFIANÇÁVEL";
      fiancaOutput.style.color = "#d32f2f";
    } else {
      fiancaOutput.value = formatCurrency(fianca);
      fiancaOutput.style.color = "#2e7d32";
    }

    const mostrarFianca = !temInafiancavel && fianca > 0 && fiancaSim?.checked;
    fiancaBreakdown?.classList.toggle("hidden", !mostrarFianca);
    boxUploadDeposito?.classList.toggle("hidden", !mostrarFianca);

    if (mostrarFianca) {
      const painel = Math.round(fianca * 0.4);
      const policial = Math.round(fianca * 0.3);
      const advogado = fianca - painel - policial;
      if (valorPainel) valorPainel.textContent = formatCurrency(painel);
      if (valorPolicial) valorPolicial.textContent = formatCurrency(policial);
      if (valorAdvogado) valorAdvogado.textContent = formatCurrency(advogado);
    }
  }

  function atualizarTotais() {
    let penaBruta = 0;
    let multaCrimes = 0;
    const temInafiancavel = selectedCrimes.some((c) => c.infiancavel === true);

    selectedCrimes.forEach((c) => {
      penaBruta += c.pena || 0;
      multaCrimes += c.multa || 0;
    });

    const penaBase = Math.min(penaBruta, 180);

    if (penaBruta > 180) alertaPenaMaxima?.classList.remove("hidden");
    else alertaPenaMaxima?.classList.add("hidden");

    const reducao = getReducaoPercent();
    const penaFinal = Math.floor(penaBase * (1 - reducao / 100));

    let multaTotal = multaCrimes;
    let valorSujo = 0;

    if (inputDinheiroSujo && inputDinheiroSujo.value) {
      valorSujo = parseInt(inputDinheiroSujo.value.replace(/\D/g, "")) || 0;
      multaTotal += Math.round(valorSujo / 2);
    }

    const fianca = temInafiancavel ? 0 : multaTotal * 3;

    if (penaTotalEl) penaTotalEl.textContent = penaFinal + " meses";
    if (multaTotalEl) multaTotalEl.textContent = formatCurrency(multaTotal);

    updateFiancaUI(fianca, temInafiancavel);
    alertaInafiancavel?.classList.toggle("hidden", !temInafiancavel);
  }

  function toggleCrime(artigo, fromRemoveButton) {
    const crimeIndex = selectedCrimes.findIndex((c) => c.artigo === artigo);
    const crimeItem = crimeItems.find((item) => item.dataset.artigo === artigo);

    if (crimeIndex >= 0) {
      selectedCrimes.splice(crimeIndex, 1);
      crimeItem?.classList.remove("selected");
      if (artigo === "139") {
        containerDinheiroSujo?.classList.add("hidden");
        if (inputDinheiroSujo) inputDinheiroSujo.value = "";
      }
    } else {
      if (!crimeItem) return;
      const nome = crimeItem
        .querySelector(".crime-name")
        .textContent.replace(/\*\*/g, "")
        .trim();
      const pena = parseInt(crimeItem.dataset.pena, 10) || 0;
      const multa = parseInt(crimeItem.dataset.multa, 10) || 0;
      const infiancavel = crimeItem.dataset.infiancavel === "true";

      selectedCrimes.push({ artigo, nome, pena, multa, infiancavel });
      crimeItem.classList.add("selected");
      if (artigo === "139") {
        containerDinheiroSujo?.classList.remove("hidden");
        setTimeout(() => inputDinheiroSujo?.focus(), 50);
      }
    }

    if (!fromRemoveButton) renderSelectedCrimes();
    else renderSelectedCrimes();
    atualizarTotais();
  }

  crimeItems.forEach((item) => {
    item.addEventListener("click", () => {
      toggleCrime(item.dataset.artigo);
    });
  });

  [checkAdvogado, checkPrimario, checkConfesso, fiancaSim, fiancaNao].forEach(
    (el) => el?.addEventListener("change", atualizarTotais)
  );

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

  const btnEnviar = document.getElementById("btn-enviar");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      const nomePreso = document.getElementById("nome")?.value.trim() || "N/I";
      const rgPreso = document.getElementById("rg")?.value.trim() || "N/I";
      const advogado = document.getElementById("advogado")?.value.trim() || "N/I";

      if (selectedCrimes.length === 0) {
        return showAlert("Selecione os crimes antes de enviar!");
      }

      const crimesMD = selectedCrimes
        .map((c) => `• Art. ${c.artigo} - ${c.nome}`)
        .join("\n");

      const markdown =
        "```md\n" +
        `# RELATÓRIO DE PRISÃO\n\n[IDENTIFICAÇÃO]\nCIDADÃO: ${nomePreso}\nRG/ID: ${rgPreso}\nADVOGADO: ${advogado}\n\n[CRIMES]\n${crimesMD}\n\n[SENTENÇA FINAL]\nPENA: ${
          penaTotalEl.textContent
        }\nMULTA: ${multaTotalEl.textContent}\nFIANÇA: ${
          fiancaOutput.value
        }\n\nGerado por: ${document.getElementById("user-name")?.textContent || "Sistema"}` +
        "\n```";

      navigator.clipboard.writeText(markdown).then(() => {
        alert("Relatório copiado para o Discord!");
      });
    });
  }

  document.getElementById("btn-limpar")?.addEventListener("click", () => {
    selectedCrimes = [];
    crimeItems.forEach((i) => i.classList.remove("selected"));
    document.getElementById("nome").value = "";
    document.getElementById("rg").value = "";
    document.getElementById("advogado").value = "";
    if (inputDinheiroSujo) inputDinheiroSujo.value = "";
    if (containerDinheiroSujo) containerDinheiroSujo.classList.add("hidden");
    if (checkAdvogado) checkAdvogado.checked = false;
    if (checkPrimario) checkPrimario.checked = false;
    if (checkConfesso) checkConfesso.checked = false;
    if (fiancaNao) fiancaNao.checked = true;
    renderSelectedCrimes();
    atualizarTotais();
  });

  renderSelectedCrimes();
  atualizarTotais();
});
