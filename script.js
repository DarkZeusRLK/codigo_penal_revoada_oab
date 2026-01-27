document.addEventListener("DOMContentLoaded", function () {
  const penaTotalEl = document.getElementById("pena-total");
  const multaTotalEl = document.getElementById("multa-total");
  const fiancaOutput = document.getElementById("fianca-output");
  const inputDinheiroSujo = document.getElementById("input-dinheiro-sujo");
  const containerDinheiroSujo = document.getElementById("container-dinheiro-sujo");
  const alertaPenaMaxima = document.getElementById("alerta-pena-maxima");
  const alertaInafiancavel = document.getElementById("alerta-inafiancavel");
  const crimesListOutput = document.getElementById("crimes-list-output");
  const detalhesOutput = document.getElementById("detalhes-output");
  const fiancaBreakdown = document.getElementById("fianca-breakdown");
  const valorPainel = document.getElementById("valor-painel");
  const valorPolicial = document.getElementById("valor-policial");
  const valorAdvogado = document.getElementById("valor-advogado");
  const boxUploadDeposito = document.getElementById("box-upload-deposito");
  const hpSim = document.getElementById("hp-sim");
  const hpNao = document.getElementById("hp-nao");
  const hpMinutos = document.getElementById("hp-minutos");
  const containerHpMinutos = document.getElementById("container-hp-minutos");

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

    const mostrarFiancaBreakdown =
      !temInafiancavel && fianca > 0 && (fiancaSim?.checked || checkAdvogado?.checked);
    const mostrarDeposito =
      !temInafiancavel && fianca > 0 && fiancaSim?.checked;
    fiancaBreakdown?.classList.toggle("hidden", !mostrarFiancaBreakdown);
    boxUploadDeposito?.classList.toggle("hidden", !mostrarDeposito);

    if (mostrarFiancaBreakdown) {
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

    const fiancaBruta = temInafiancavel ? 0 : multaTotal * 3;
    const fianca = Math.min(fiancaBruta, 2500000);

    if (penaTotalEl) penaTotalEl.textContent = penaFinal + " meses";
    if (multaTotalEl) multaTotalEl.textContent = formatCurrency(multaTotal);

    updateFiancaUI(fianca, temInafiancavel);
    alertaInafiancavel?.classList.toggle("hidden", !temInafiancavel);
    atualizarDetalhes(temInafiancavel, fianca);
  }

  function atualizarDetalhes(temInafiancavel, fianca) {
    if (!detalhesOutput) return;

    const reuReincidente = selectedCrimes.some((c) => c.artigo === "163");
    const reuPrimario = !!checkPrimario?.checked;
    const advogadoConstituido = !!checkAdvogado?.checked;
    const pagamentoFianca = !!fiancaSim?.checked;
    const reanimadoHp = !!hpSim?.checked;
    const minutosHp = reanimadoHp
      ? parseInt(hpMinutos?.value || "0", 10) || 0
      : 0;

    const detalhes = [
      { label: "Réu primário", value: reuPrimario ? "Sim" : "Não" },
      { label: "Réu reincidente", value: reuReincidente ? "Sim" : "Não" },
      { label: "Advogado constituído", value: advogadoConstituido ? "Sim" : "Não" },
      {
        label: "Pagamento de fiança",
        value: temInafiancavel ? "Inafiançável" : pagamentoFianca ? "Sim" : "Não",
      },
      {
        label: "Reanimado no HP",
        value: reanimadoHp ? `Sim (${minutosHp} min)` : "Não",
      },
    ];

    if (!temInafiancavel && fianca > 0) {
      const painel = Math.round(fianca * 0.4);
      const policial = Math.round(fianca * 0.3);
      const advogado = fianca - painel - policial;
      detalhes.push(
        { label: "Fiança painel (40%)", value: formatCurrency(painel) },
        { label: "Fiança policial (30%)", value: formatCurrency(policial) },
        { label: "Fiança advogado (30%)", value: formatCurrency(advogado) }
      );
    }

    detalhesOutput.innerHTML = "";
    detalhes.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `${item.label}: <span>${item.value}</span>`;
      detalhesOutput.appendChild(li);
    });
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

  [hpSim, hpNao].forEach((el) =>
    el?.addEventListener("change", () => {
      const mostrar = hpSim?.checked;
      containerHpMinutos?.classList.toggle("hidden", !mostrar);
      if (!mostrar && hpMinutos) hpMinutos.value = "";
      atualizarTotais();
    })
  );

  hpMinutos?.addEventListener("input", atualizarTotais);

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
      const nomePreso =
        document.getElementById("nome")?.value.trim() || "NÃO INFORMADO";
      const rgPreso = document.getElementById("rg")?.value.trim() || "N/I";
      const advogado =
        document.getElementById("advogado")?.value.trim() || "N/I";

      if (selectedCrimes.length === 0) {
        return showAlert("Selecione os crimes antes de copiar!");
      }

      const crimesMD = selectedCrimes
        .map((c) => `• Art. ${c.artigo} - ${c.nome}`)
        .join("\n");

      const reuReincidente = selectedCrimes.some((c) => c.artigo === "163");
      const reuPrimario = !!checkPrimario?.checked;
      const advogadoConstituido = !!checkAdvogado?.checked;
      const pagamentoFianca = !!fiancaSim?.checked;
      const temInafiancavel = selectedCrimes.some((c) => c.infiancavel === true);
      const reanimadoHp = !!hpSim?.checked;
      const minutosHp = reanimadoHp
        ? parseInt(hpMinutos?.value || "0", 10) || 0
        : 0;

      const detalhesMD =
        `RÉU PRIMÁRIO: ${reuPrimario ? "SIM" : "NÃO"}\n` +
        `RÉU REINCIDENTE: ${reuReincidente ? "SIM" : "NÃO"}\n` +
        `ADVOGADO CONSTITUÍDO: ${advogadoConstituido ? "SIM" : "NÃO"}\n` +
        `PAGAMENTO DE FIANÇA: ${
          temInafiancavel ? "INAFIANÇÁVEL" : pagamentoFianca ? "SIM" : "NÃO"
        }\n` +
        `REANIMADO NO HP: ${reanimadoHp ? `SIM (${minutosHp} min)` : "NÃO"}`;

      const markdown =
        "```md\n" +
        `# RELATÓRIO DE PRISÃO - ADVOCACIA\n\n[IDENTIFICAÇÃO]\nCIDADÃO: ${nomePreso}\nRG/ID: ${rgPreso}\nADVOGADO: ${advogado}\n\n[CRIMES]\n${crimesMD}\n\n[SENTENÇA FINAL]\nPENA: ${
          penaTotalEl.textContent
        }\nMULTA: ${multaTotalEl.textContent}\nFIANÇA: ${
          fiancaOutput.value
        }\n\n[DETALHES]\n${detalhesMD}\n` +
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
