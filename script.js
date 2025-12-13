document.addEventListener("DOMContentLoaded", function () {
  // --- MÚSICA ---
  var bgMusic = document.getElementById("bg-music");
  var btnMusic = document.getElementById("btn-music-toggle");
  if (bgMusic) bgMusic.volume = 0.1;
  if (btnMusic && bgMusic) {
    btnMusic.addEventListener("click", function () {
      if (bgMusic.paused) {
        bgMusic.play();
        btnMusic.classList.remove("paused");
        btnMusic.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      } else {
        bgMusic.pause();
        btnMusic.classList.add("paused");
        btnMusic.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      }
    });
  }

  // --- CONFIGURAÇÕES ---
  var PORCENTAGEM_MULTA_SUJO = 0.5;
  var PENA_MAXIMA_SERVER = 180;

  var ARTIGOS_COM_ITENS = [
    "121",
    "122",
    "123",
    "124",
    "125",
    "126",
    "127",
    "128",
    "129",
    "130",
    "131",
    "132",
    "133",
    "134",
    "135",
    "136",
  ];

  // GRUPOS DE CRIMES MUTUAMENTE EXCLUSIVOS
  var GRUPOS_CONFLITO = [
    ["132", "133", "135"], // Grupo Drogas
    ["128", "129"], // Grupo Munições
  ];

  // --- CARREGAR MEMBROS (Opcional, mantido para login visual) ---
  var searchInputCheck = document.getElementById("search-oficial");
  var LISTA_OFICIAIS = [];

  async function carregarOficiaisDiscord() {
    if (!searchInputCheck) return;
    try {
      const response = await fetch("/api/membros");
      if (response.ok) {
        LISTA_OFICIAIS = await response.json();
        console.log("Lista carregada. Total: " + LISTA_OFICIAIS.length);
      }
    } catch (error) {
      console.error("Erro ao buscar oficiais:", error);
    }
  }
  carregarOficiaisDiscord();

  // --- SELETORES ---
  var crimeItems = document.querySelectorAll(".crime-item");
  var checkboxes = document.querySelectorAll(
    '.atenuantes input[type="checkbox"]'
  );
  var btnLimpar = document.getElementById("btn-limpar");
  var btnEnviar = document.getElementById("btn-enviar"); // Agora servirá para Gerar/Copiar

  var nomeInput = document.getElementById("nome");
  var rgInput = document.getElementById("rg");
  var advogadoInput = document.getElementById("advogado");

  var checkPrimario = document.getElementById("atenuante-primario");
  var checkboxAdvogado = document.getElementById("atenuante-advogado");
  var itensApreendidosInput = document.querySelector(
    ".itens-apreendidos textarea"
  );

  // Uploads (Mantidos apenas para PREVIEW visual local)
  var boxPreso = document.getElementById("box-upload-preso");
  var inputPreso = document.getElementById("upload-preso");
  var imgPreviewPreso = document.getElementById("img-preview-preso");
  var boxMochila = document.getElementById("box-upload-mochila");
  var inputMochila = document.getElementById("upload-mochila");
  var imgPreviewMochila = document.getElementById("img-preview-mochila");
  var boxDeposito = document.getElementById("box-upload-deposito");
  var inputDeposito = document.getElementById("upload-deposito");
  var imgPreviewDeposito = document.getElementById("img-preview-deposito");
  var activeUploadBox = null;

  // Pesquisa
  var searchInput = document.getElementById("search-oficial");
  var dropdownResults = document.getElementById("dropdown-oficiais");
  var selectedOficialIdInput = document.getElementById("selected-oficial-id");
  var btnAddPart = document.getElementById("btn-add-participante");
  var listaParticipantesVisual = document.getElementById(
    "lista-participantes-visual"
  );
  var participantesSelecionados = [];

  // Login
  var loginScreen = document.getElementById("login-screen");
  var btnLoginSimulado = document.getElementById("btn-login-simulado");
  var appContent = document.getElementById("app-content");
  var userNameSpan = document.getElementById("user-name");
  var userAvatarImg = document.getElementById("user-avatar");
  var userIdHidden = document.getElementById("user-id-hidden");

  // Calculo
  var hpSimBtn = document.getElementById("hp-sim");
  var hpNaoBtn = document.getElementById("hp-nao");
  var containerHpMinutos = document.getElementById("container-hp-minutos");
  var inputHpMinutos = document.getElementById("hp-minutos");
  var radiosPorte = document.getElementsByName("porte-arma");
  var radiosFianca = document.getElementsByName("pagou-fianca");
  var radioFiancaSim = document.getElementById("fianca-sim");
  var radioFiancaNao = document.getElementById("fianca-nao");
  var containerFiancaRadio = document.getElementById("container-radio-fianca");

  var containerDinheiroSujo = document.getElementById(
    "container-dinheiro-sujo"
  );
  var inputDinheiroSujo = document.getElementById("input-dinheiro-sujo");
  var crimesListOutput = document.getElementById("crimes-list-output");
  var penaTotalEl = document.getElementById("pena-total");
  var multaTotalEl = document.getElementById("multa-total");
  var fiancaOutputEl = document.getElementById("fianca-output");
  var alertaPenaMaxima = document.getElementById("alerta-pena-maxima");
  var fiancaBreakdown = document.getElementById("fianca-breakdown");
  var valPolicial = document.getElementById("valor-policial");
  var valPainel = document.getElementById("valor-painel");
  var valAdvogado = document.getElementById("valor-advogado");

  var selectedCrimes = [];
  var isCrimeInafiancavelGlobal = false;

  // --- FUNCOES VISUAIS ---
  function mostrarAlerta(mensagem, tipo) {
    if (!tipo) tipo = "error";
    var div = document.createElement("div");
    div.className = "custom-alert " + tipo;
    var icone =
      tipo === "success" ? "fa-circle-check" : "fa-triangle-exclamation";
    div.innerHTML = `<i class="fa-solid ${icone}"></i><div class="alert-content"><span class="alert-title">${
      tipo === "success" ? "SUCESSO" : "ATENÇÃO"
    }</span><span class="alert-msg">${mensagem}</span></div>`;
    document.body.appendChild(div);
    setTimeout(function () {
      if (div.parentNode) div.parentNode.removeChild(div);
    }, 4000);
  }

  // --- LOGIN ---
  function doLogin(username, avatarUrl, userId, job) {
    loginScreen.style.display = "none";
    appContent.classList.remove("hidden");
    userNameSpan.textContent = username;
    userIdHidden.value = userId;

    if (avatarUrl) {
      userAvatarImg.src = avatarUrl;
      userAvatarImg.classList.remove("hidden");
    }

    if (bgMusic) bgMusic.play().catch((e) => console.log("Autoplay block"));
    // Sem lógica de salvar em DB para advogados, mantido simples
  }

  if (btnLoginSimulado)
    btnLoginSimulado.addEventListener("click", function () {
      doLogin(
        "Advogado Dr. Padrão",
        "Imagens/image.png",
        "0000000000",
        "Advogado"
      );
    });

  // (Lógica de token de URL mantida se houver auth externa)
  var fragment = new URLSearchParams(window.location.hash.slice(1));
  var accessToken = fragment.get("access_token");
  if (accessToken) {
    // ... Código de Auth simplificado mantido ...
    fetch("/api/auth", { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 200 && data.authorized) {
          var avatar = data.avatar
            ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
            : "Imagens/image.png";
          doLogin(data.username, avatar, data.id, "Advogado");
        }
      })
      .catch(console.error);
  }

  if (containerFiancaRadio) {
    containerFiancaRadio.addEventListener(
      "click",
      function (e) {
        if (isCrimeInafiancavelGlobal) {
          mostrarAlerta("⚠️ HÁ CRIMES INAFIANÇÁVEIS SELECIONADOS!", "error");
          radioFiancaNao.checked = true;
          radioFiancaSim.checked = false;
          checkFiancaState();
        }
      },
      true
    );
  }

  // --- SEARCH OFICIAL ---
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var termo = this.value.toLowerCase();
      dropdownResults.innerHTML = "";
      if (termo.length < 1) {
        dropdownResults.classList.add("hidden");
        return;
      }
      var filtrados = LISTA_OFICIAIS.filter(
        (o) => o.nome.toLowerCase().includes(termo) || o.id.includes(termo)
      );
      if (filtrados.length === 0) {
        dropdownResults.classList.add("hidden");
        return;
      }
      dropdownResults.classList.remove("hidden");
      filtrados.forEach((oficial) => {
        var div = document.createElement("div");
        div.className = "dropdown-item";
        div.innerHTML = `<strong>${oficial.nome}</strong><small>ID: ${oficial.id}</small>`;
        div.addEventListener("click", function () {
          searchInput.value = oficial.nome;
          selectedOficialIdInput.value = oficial.id;
          dropdownResults.classList.add("hidden");
        });
        dropdownResults.appendChild(div);
      });
    });
    document.addEventListener("click", function (e) {
      if (e.target !== searchInput && e.target !== dropdownResults)
        dropdownResults.classList.add("hidden");
    });
  }

  // --- PARTICIPANTES ---
  if (btnAddPart) {
    btnAddPart.addEventListener("click", function () {
      var id = selectedOficialIdInput.value;
      var nome = searchInput.value;
      if (!id || !nome) {
        mostrarAlerta("Pesquise e selecione um advogado/oficial.", "error");
        return;
      }
      var jaExiste = participantesSelecionados.some((p) => p.id === id);
      if (jaExiste) return;

      participantesSelecionados.push({ id: id, nome: nome });
      var tag = document.createElement("div");
      tag.className = "officer-tag";
      tag.innerHTML = `<span>${nome}</span> <button onclick="removerParticipante('${id}', this)">×</button>`;
      listaParticipantesVisual.appendChild(tag);
      searchInput.value = "";
      selectedOficialIdInput.value = "";
    });
  }
  window.removerParticipante = function (id, btnElement) {
    participantesSelecionados = participantesSelecionados.filter(
      (p) => p.id !== id
    );
    btnElement.parentElement.remove();
  };

  // --- PREVIEW DE IMAGEM (Sem Compressão, apenas FileReader) ---
  function setFile(type, file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      if (type === "preso") {
        imgPreviewPreso.src = e.target.result;
        imgPreviewPreso.classList.remove("hidden");
      } else if (type === "mochila") {
        imgPreviewMochila.src = e.target.result;
        imgPreviewMochila.classList.remove("hidden");
      } else if (type === "deposito") {
        imgPreviewDeposito.src = e.target.result;
        imgPreviewDeposito.classList.remove("hidden");
      }
    };
    reader.readAsDataURL(file);
  }
  // Listeners de Input File
  inputPreso.addEventListener("change", function () {
    if (this.files[0]) setFile("preso", this.files[0]);
  });
  inputMochila.addEventListener("change", function () {
    if (this.files[0]) setFile("mochila", this.files[0]);
  });
  inputDeposito.addEventListener("change", function () {
    if (this.files[0]) setFile("deposito", this.files[0]);
  });

  // Listeners de Click Box e Paste
  boxPreso.addEventListener("click", function () {
    activeUploadBox = "preso";
    boxPreso.classList.add("active-box");
    boxMochila.classList.remove("active-box");
    boxDeposito.classList.remove("active-box");
  });
  boxMochila.addEventListener("click", function () {
    activeUploadBox = "mochila";
    boxMochila.classList.add("active-box");
    boxPreso.classList.remove("active-box");
    boxDeposito.classList.remove("active-box");
  });
  boxDeposito.addEventListener("click", function () {
    activeUploadBox = "deposito";
    boxDeposito.classList.add("active-box");
    boxPreso.classList.remove("active-box");
    boxMochila.classList.remove("active-box");
  });

  document.addEventListener("paste", function (e) {
    if (!activeUploadBox) return;
    if (
      activeUploadBox === "deposito" &&
      boxDeposito.classList.contains("hidden")
    )
      return;
    if (e.clipboardData && e.clipboardData.items) {
      for (var i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.indexOf("image") !== -1) {
          setFile(activeUploadBox, e.clipboardData.items[i].getAsFile());
          mostrarAlerta("Imagem colada!", "success");
          e.preventDefault();
          break;
        }
      }
    }
  });

  function checkFiancaState() {
    if (radioFiancaSim.checked) {
      boxDeposito.classList.remove("hidden");
    } else {
      boxDeposito.classList.add("hidden");
      imgPreviewDeposito.src = "";
      imgPreviewDeposito.classList.add("hidden");
    }
  }
  if (radioFiancaSim && radioFiancaNao) {
    radioFiancaSim.addEventListener("change", checkFiancaState);
    radioFiancaNao.addEventListener("change", checkFiancaState);
  }

  // --- LÓGICA DE CRIMES (Mantida intacta) ---
  for (var i = 0; i < crimeItems.length; i++) {
    crimeItems[i].addEventListener("click", function () {
      var el = this;
      var artigo = el.dataset.artigo;
      var nome = el.querySelector(".crime-name").innerText.trim();
      var pena = parseInt(el.dataset.pena);
      var multa = parseInt(el.dataset.multa);
      var infiancavel = el.dataset.infiancavel === "true";

      var existeIndex = -1;
      for (var k = 0; k < selectedCrimes.length; k++) {
        if (selectedCrimes[k].artigo === artigo) {
          existeIndex = k;
          break;
        }
      }

      // Verificações de conflito (Homicídio, Porte, Reincidência)
      var idDoloso = "105";
      var idCulposo = "107";
      var idQualificado = "104";
      var idCulposoTransito = "108";
      var grupoHomicidios = [
        idDoloso,
        idCulposo,
        idQualificado,
        idCulposoTransito,
      ];

      if (grupoHomicidios.includes(artigo)) {
        var conflitoHomicidio = selectedCrimes.find((c) =>
          grupoHomicidios.includes(c.artigo)
        );
        if (conflitoHomicidio) {
          mostrarAlerta(
            `Incoerência: Já marcou "${conflitoHomicidio.nome}".`,
            "error"
          );
          return;
        }
      }
      if (existeIndex === -1) {
        if (artigo === "161" && checkPrimario.checked) {
          mostrarAlerta(
            "Incoerência: Desmarque 'Réu Primário' antes de adicionar 'Réu Reincidente'!",
            "error"
          );
          return;
        }
        if (artigo === "123") {
          var temPorte = selectedCrimes.some(
            (c) => c.artigo === "125" || c.artigo === "126"
          );
          if (temPorte) {
            mostrarAlerta(
              "Incoerência: Tráfico de Armas engloba o Porte.",
              "error"
            );
            return;
          }
        }
        if (artigo === "125" || artigo === "126") {
          var temTraficoArmas = selectedCrimes.some((c) => c.artigo === "123");
          if (temTraficoArmas) {
            mostrarAlerta("Incoerência: Já marcou Tráfico de Armas.", "error");
            return;
          }
        }
        var grupoDoCrime = GRUPOS_CONFLITO.find((grupo) =>
          grupo.includes(artigo)
        );
        if (grupoDoCrime) {
          var conflito = selectedCrimes.find((c) =>
            grupoDoCrime.includes(c.artigo)
          );
          if (conflito) {
            mostrarAlerta(
              `Incoerência: Você já selecionou "${conflito.nome}".`,
              "error"
            );
            return;
          }
        }

        selectedCrimes.push({
          artigo: artigo,
          nome: nome,
          pena: pena,
          multa: multa,
          infiancavel: infiancavel,
        });
        el.classList.add("selected");
        if (artigo === "137" && containerDinheiroSujo) {
          containerDinheiroSujo.classList.remove("hidden");
          if (inputDinheiroSujo) inputDinheiroSujo.focus();
        }
      } else {
        selectedCrimes.splice(existeIndex, 1);
        el.classList.remove("selected");
        if (artigo === "137" && containerDinheiroSujo) {
          containerDinheiroSujo.classList.add("hidden");
          if (inputDinheiroSujo) inputDinheiroSujo.value = "";
        }
      }
      calculateSentence();
    });
  }

  // --- ATENUANTES ---
  for (var c = 0; c < checkboxes.length; c++) {
    checkboxes[c].addEventListener("change", function () {
      if (this.id === "atenuante-primario" && this.checked) {
        var temReincidente = selectedCrimes.some((c) => c.artigo === "161");
        if (temReincidente) {
          mostrarAlerta(
            "Incoerência: Remova 'Réu Reincidente' antes de marcar 'Réu Primário'!",
            "error"
          );
          this.checked = false;
          return;
        }
      }
      calculateSentence();
    });
  }

  // --- CÁLCULO DA PENA ---
  function toggleHpInput() {
    if (hpSimBtn.checked) {
      containerHpMinutos.classList.remove("hidden");
      inputHpMinutos.focus();
    } else {
      containerHpMinutos.classList.add("hidden");
      inputHpMinutos.value = "";
    }
    calculateSentence();
  }
  if (hpSimBtn && hpNaoBtn) {
    hpSimBtn.addEventListener("change", toggleHpInput);
    hpNaoBtn.addEventListener("change", toggleHpInput);
  }
  if (inputHpMinutos) {
    inputHpMinutos.addEventListener("input", calculateSentence);
    inputHpMinutos.addEventListener("keyup", calculateSentence);
  }
  if (inputDinheiroSujo)
    inputDinheiroSujo.addEventListener("input", function (e) {
      var val = e.target.value
        .replace(/\D/g, "")
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
      e.target.value = val;
      calculateSentence();
    });

  function calculateSentence() {
    var totalPenaRaw = 0;
    var totalMulta = 0;
    isCrimeInafiancavelGlobal = false;

    for (var i = 0; i < selectedCrimes.length; i++) {
      totalPenaRaw += selectedCrimes[i].pena;
      totalMulta += selectedCrimes[i].multa;
      if (selectedCrimes[i].infiancavel) isCrimeInafiancavelGlobal = true;
    }

    var valorSujo = 0;
    if (
      inputDinheiroSujo &&
      !containerDinheiroSujo.classList.contains("hidden")
    ) {
      var valorSujoString = inputDinheiroSujo.value.replace(/\./g, "");
      valorSujo = parseFloat(valorSujoString) || 0;
      totalMulta += valorSujo * PORCENTAGEM_MULTA_SUJO;
    }

    var penaBaseCalculo = totalPenaRaw;
    if (penaBaseCalculo > PENA_MAXIMA_SERVER) {
      penaBaseCalculo = PENA_MAXIMA_SERVER;
      if (alertaPenaMaxima) alertaPenaMaxima.classList.remove("hidden");
    } else {
      if (alertaPenaMaxima) alertaPenaMaxima.classList.add("hidden");
    }

    var totalDiscountPercent = 0;
    for (var k = 0; k < checkboxes.length; k++) {
      if (checkboxes[k].checked)
        totalDiscountPercent += parseFloat(checkboxes[k].dataset.percent);
    }
    var descontoDecimal = Math.abs(totalDiscountPercent) / 100;
    var totalPenaFinal = Math.max(0, penaBaseCalculo * (1 - descontoDecimal));

    var hpReduction = 0;
    if (
      hpSimBtn &&
      hpSimBtn.checked &&
      inputHpMinutos &&
      !isNaN(parseInt(inputHpMinutos.value))
    ) {
      hpReduction = parseInt(inputHpMinutos.value);
    }
    totalPenaFinal = Math.max(0, totalPenaFinal - hpReduction);

    if (isCrimeInafiancavelGlobal) {
      if (fiancaOutputEl) fiancaOutputEl.value = "INAFIANÇÁVEL";
      radioFiancaSim.disabled = true;
      radioFiancaSim.checked = false;
      radioFiancaNao.checked = true;
      checkFiancaState();
    } else {
      if (fiancaOutputEl)
        fiancaOutputEl.value = "R$ " + totalMulta.toLocaleString("pt-BR");
      radioFiancaSim.disabled = false;
    }

    // Breakdown dos valores para Advogado
    if (
      !isCrimeInafiancavelGlobal &&
      checkboxAdvogado &&
      checkboxAdvogado.checked &&
      totalMulta > 0
    ) {
      if (fiancaBreakdown) fiancaBreakdown.classList.remove("hidden");
      var partePolicial = totalMulta * 0.35;
      var partePainel = totalMulta * 0.35;
      var parteAdvogado = totalMulta * 0.3;
      if (valPolicial)
        valPolicial.textContent =
          "R$ " +
          partePolicial.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
      if (valPainel)
        valPainel.textContent =
          "R$ " +
          partePainel.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
      if (valAdvogado)
        valAdvogado.textContent =
          "R$ " +
          parteAdvogado.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
    } else {
      if (fiancaBreakdown) fiancaBreakdown.classList.add("hidden");
    }

    if (penaTotalEl)
      penaTotalEl.textContent = Math.round(totalPenaFinal) + " meses";
    if (multaTotalEl)
      multaTotalEl.textContent = "R$" + totalMulta.toLocaleString("pt-BR");
    updateCrimesOutput();
  }

  function updateCrimesOutput() {
    if (!crimesListOutput) return;
    crimesListOutput.innerHTML = "";
    if (selectedCrimes.length === 0) {
      crimesListOutput.innerHTML =
        '<div class="empty-message">Nenhum crime selecionado</div>';
      return;
    }
    selectedCrimes.forEach(function (crime, index) {
      var crimeDiv = document.createElement("div");
      crimeDiv.className = "crime-output-item";
      var isInfiancavelText = crime.infiancavel ? " (INF)" : "";
      var nomeExibicao = crime.nome.replace(/\*\*/g, "").trim();
      crimeDiv.innerHTML =
        "<span>" +
        nomeExibicao +
        isInfiancavelText +
        '</span><button data-index="' +
        index +
        '"><i class="fa-solid fa-xmark"></i></button>';
      crimesListOutput.appendChild(crimeDiv);
    });
    var removeBtns = crimesListOutput.querySelectorAll("button");
    for (var i = 0; i < removeBtns.length; i++) {
      removeBtns[i].addEventListener("click", function (e) {
        var idx = parseInt(e.currentTarget.dataset.index);
        var crimeToRemove = selectedCrimes[idx];
        if (crimeToRemove.artigo === "137" && containerDinheiroSujo) {
          containerDinheiroSujo.classList.add("hidden");
          if (inputDinheiroSujo) inputDinheiroSujo.value = "";
        }
        selectedCrimes.splice(idx, 1);
        var originalItem = document.querySelector(
          '.crime-item[data-artigo="' + crimeToRemove.artigo + '"]'
        );
        if (originalItem) originalItem.classList.remove("selected");
        calculateSentence();
      });
    }
  }

  if (btnLimpar)
    btnLimpar.addEventListener("click", function () {
      if (confirm("Deseja limpar todos os campos?")) {
        location.reload();
      }
    });

  // --- ENVIO / CÁLCULO (ADAPTADO) ---
  if (btnEnviar) {
    // Mudança visual do botão
    btnEnviar.innerHTML =
      '<i class="fa-solid fa-calculator"></i> COPIAR RESUMO';

    btnEnviar.addEventListener("click", function (e) {
      e.preventDefault();

      // Validação Mínima para Cálculo
      var isPrimario = checkPrimario.checked;
      var isReincidente = selectedCrimes.some((c) => c.artigo === "161");

      if (isPrimario && isReincidente) {
        mostrarAlerta(
          "ERRO: O réu não pode ser Primário e Reincidente ao mesmo tempo!",
          "error"
        );
        return;
      }
      if (!isPrimario && !isReincidente) {
        mostrarAlerta(
          "OBRIGATÓRIO: Selecione Réu Primário ou adicione Reincidente (Art. 161).",
          "error"
        );
        return;
      }
      if (selectedCrimes.length === 0) {
        mostrarAlerta("Selecione ao menos um crime para calcular.", "error");
        return;
      }

      // Montar Resumo de Texto
      var nome = nomeInput.value || "Indivíduo";
      var rg = rgInput.value || "N/A";
      var penaStr = penaTotalEl.textContent;
      var multaStr = multaTotalEl.textContent;

      var crimesText = selectedCrimes
        .map(function (c) {
          return (
            "- " +
            c.nome.replace(/\*\*/g, "").trim() +
            (c.infiancavel ? " (INAFIANÇÁVEL)" : "")
          );
        })
        .join("\n");

      var atenuantesText = "";
      for (var cb = 0; cb < checkboxes.length; cb++) {
        if (checkboxes[cb].checked) {
          var lbl = document
            .querySelector('label[for="' + checkboxes[cb].id + '"]')
            .textContent.trim();
          atenuantesText += "- " + lbl + "\n";
        }
      }
      if (hpSimBtn && hpSimBtn.checked && inputHpMinutos.value)
        atenuantesText +=
          "- Reanimado no HP (-" + inputHpMinutos.value + "m)\n";

      var resumo =
        `⚖️ **CÁLCULO PENAL** ⚖️\n\n` +
        `👤 **Nome:** ${nome} (RG: ${rg})\n` +
        `📜 **Crimes:**\n${crimesText}\n\n` +
        `📉 **Atenuantes/Reduções:**\n${atenuantesText || "Nenhum"}\n` +
        `----------------------------\n` +
        `⏳ **Pena Final:** ${penaStr}\n` +
        `💰 **Multa Total:** ${multaStr}`;

      // Tentar copiar para o Clipboard
      navigator.clipboard.writeText(resumo).then(
        function () {
          mostrarAlerta(
            "Resumo copiado para a área de transferência!",
            "success"
          );
        },
        function (err) {
          console.error("Erro ao copiar: ", err);
          mostrarAlerta(
            "Cálculo realizado! Veja o valor no painel.",
            "success"
          );
        }
      );

      console.log(resumo); // Log para debug
    });
  }
});
