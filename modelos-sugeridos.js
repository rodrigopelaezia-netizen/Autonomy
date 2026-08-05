(() => {
  "use strict";

  const data = window.AUTONOMY_CATALOG;
  const catalog = document.getElementById("catalog");
  const energyNav = document.getElementById("energy-nav");
  const segmentNav = document.getElementById("segment-nav");
  const modelNav = document.getElementById("model-nav");
  const counter = document.querySelector(".filter-counter");
  const clear = document.querySelector(".clear-filters");
  const back = document.getElementById("back-to-top");

  const energySummary = document.getElementById("energy-filter-summary");
  const segmentSummary = document.getElementById("segment-filter-summary");
  const modelSummary = document.getElementById("model-filter-summary");
  const modelFilterPanel = document.getElementById("model-filter-panel");

  const photoLightbox = document.getElementById("catalog-lightbox");
  const photoLightboxImage = photoLightbox?.querySelector("img") || null;
  const photoLightboxCaption = photoLightbox?.querySelector("p") || null;

  let activeEnergy = "all";
  let activeSegment = "all";
  let activeModel = null;

  const ENERGY = [
    ["all", "Todos"],
    ["BEV", "BEV · 100% eléctrico"],
    ["PHEV", "PHEV · Híbrido enchufable"],
    ["REEV", "REEV · Rango extendido"],
    ["HEV", "HEV · Sin enchufe"]
  ];

  const LABELS = {
    evRange: "Autonomía eléctrica CLTC",
    combined: "Autonomía combinada CLTC",
    battery: "Batería",
    power: "Potencia",
    torque: "Torque",
    drivetrain: "Tracción",
    dc: "Carga rápida DC",
    ac: "Carga domiciliaria AC",
    camera: "Cámara",
    adas: "Asistencias de conducción",
    dimensions: "Dimensiones",
    wheelbase: "Distancia entre ejes",
    seats: "Plazas",
    trunk: "Maletero / espacio",
    suspension: "Suspensión",
    screen: "Pantalla central",
    instrument: "Instrumental / HUD",
    v2l: "Descarga V2L"
  };

  const TECH_ROWS = {
    BEV: ["evRange", "battery", "power", "torque", "drivetrain", "dc", "ac", "camera", "adas", "v2l"],
    PHEV: ["evRange", "combined", "battery", "power", "torque", "drivetrain", "dc", "ac", "camera", "adas"],
    REEV: ["evRange", "combined", "battery", "power", "torque", "drivetrain", "dc", "ac", "camera", "adas"],
    HEV: ["power", "torque", "drivetrain", "camera", "adas"]
  };

  const SEGMENT_ROWS = {
    compactos: ["dimensions", "seats", "trunk", "screen", "instrument"],
    sedanes: ["dimensions", "wheelbase", "seats", "trunk", "screen", "instrument"],
    "suv-urbanos": ["dimensions", "wheelbase", "seats", "trunk", "suspension", "screen", "instrument"],
    "suv-compactos": ["dimensions", "wheelbase", "seats", "trunk", "suspension", "screen", "instrument", "v2l"],
    "suv-medianos": ["dimensions", "wheelbase", "seats", "trunk", "suspension", "screen", "instrument", "v2l"],
    aventureros: ["dimensions", "wheelbase", "seats", "trunk", "suspension", "drivetrain", "power", "torque"],
    exigentes: ["dimensions", "wheelbase", "seats", "trunk", "suspension", "drivetrain", "power", "torque"]
  };

  const energyType = model => {
    const text = model.tech.toLowerCase();
    if (text.includes("rango extendido")) return "REEV";
    if (text.includes("enchufable")) return "PHEV";
    if (text.includes("no enchufable")) return "HEV";
    return "BEV";
  };

  const isConfirmed = value => {
    if (value === undefined || value === null) return false;
    const text = String(value).trim();
    if (!text) return false;
    const normalized = text.toLowerCase();
    return !(
      normalized === "no aplica" ||
      normalized.includes("dato por confirmar") ||
      normalized.includes("por confirmar") ||
      normalized === "n/d"
    );
  };

  const money = value =>
    `USD ${new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 })
      .format(value)
      .replaceAll(",", ".")}`;

  const priceRange = model => {
    const values = model.versions
      .map(version => version.price)
      .filter(value => Number.isFinite(value));
    if (!values.length) return "Consultar";
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max
      ? money(min)
      : `${money(min)} – ${money(max).replace("USD ", "")}`;
  };

  const whatsappBase = `https://wa.me/${data.whatsapp}`;
  const generalMessage = encodeURIComponent(
    "*Consulta AutoNomy — Modelos sugeridos*\n\nHola, quiero asesoramiento para elegir un vehículo."
  );

  ["header-whatsapp", "floating-whatsapp", "final-whatsapp"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.href = `${whatsappBase}?text=${generalMessage}`;
  });

  const filteredModels = () =>
    data.models.filter(model =>
      !model.hidden &&
      (activeEnergy === "all" || energyType(model) === activeEnergy) &&
      (activeSegment === "all" || model.segment === activeSegment)
    );

  const commonValue = (model, key) => model.common?.[key];

  const versionValue = (model, version, key) => {
    if (key === "role") return version.role;
    if (key === "summary") return version.summary;
    if (Object.prototype.hasOwnProperty.call(version, key)) return version[key];
    return commonValue(model, key);
  };

  const confirmedRow = (model, key) =>
    model.versions.every(version => isConfirmed(versionValue(model, version, key)));

  const uniqueKeys = keys => [...new Set(keys)];

  const technicalKeysFor = model => {
    const energy = energyType(model);
    const candidates = uniqueKeys([
      ...(TECH_ROWS[energy] || []),
      ...(SEGMENT_ROWS[model.segment] || [])
    ]);

    return candidates.filter(key => {
      if (energy === "BEV" && key === "combined") return false;
      if (energy === "HEV" && ["evRange", "combined", "battery", "dc", "ac", "v2l"].includes(key)) return false;
      return confirmedRow(model, key);
    });
  };

  const summaryRowsFor = model => {
    const energy = energyType(model);
    const rows = [
      { label: "Enfoque de la versión", key: "role" }
    ];

    if (["BEV", "PHEV", "REEV"].includes(energy) && confirmedRow(model, "evRange")) {
      rows.push({ label: LABELS.evRange, key: "evRange" });
    }

    if (["PHEV", "REEV"].includes(energy) && confirmedRow(model, "combined")) {
      rows.push({ label: LABELS.combined, key: "combined" });
    }

    technicalKeysFor(model)
      .filter(key => !["evRange", "combined"].includes(key))
      .slice(0, 3)
      .forEach(key => rows.push({ label: LABELS[key], key }));

    rows.push({ label: "Qué ofrece cada versión", key: "summary" });
    return rows.slice(0, 7);
  };

  const fullRowsFor = model => {
    const rows = summaryRowsFor(model);
    const existing = new Set(rows.map(row => row.key));

    technicalKeysFor(model).forEach(key => {
      if (!existing.has(key)) rows.push({ label: LABELS[key], key });
    });

    return rows;
  };

  const tableHtml = (model, rows, className) => `
    <div class="comparison-table-wrap">
      <table class="${className}">
        <thead>
          <tr>
            <th>Qué comparar</th>
            ${model.versions.map(version => `<th>${version.name}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td>${row.label}</td>
              ${model.versions.map(version =>
                `<td>${versionValue(model, version, row.key)}</td>`
              ).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;

  const comparison = model => {
    const summaryRows = summaryRowsFor(model);
    const fullRows = fullRowsFor(model);

    return `
      <details class="comparison comparison--summary">
        <summary>
          <span>
            <strong>Comparar versiones</strong>
            <small>Ver las diferencias más importantes</small>
          </span>
          <span class="comparison-chevron">⌄</span>
        </summary>

        <div class="comparison-content">
          ${tableHtml(model, summaryRows, "comparison-table comparison-table--summary")}

          <details class="comparison-full">
            <summary>
              <span>
                <strong>Ver ficha comparativa completa</strong>
                <small>Solo incluye datos confirmados y relevantes para este modelo</small>
              </span>
              <span class="comparison-chevron">⌄</span>
            </summary>
            <div class="comparison-full-content">
              ${tableHtml(model, fullRows, "comparison-table comparison-table--full")}
            </div>
          </details>
        </div>
      </details>`;
  };

  const versionMeta = (model, version) => {
    const energy = energyType(model);
    const values = [];

    if (["BEV", "PHEV", "REEV"].includes(energy) && isConfirmed(version.evRange)) {
      values.push(["Autonomía eléctrica", version.evRange]);
    }
    if (["PHEV", "REEV"].includes(energy) && isConfirmed(version.combined)) {
      values.push(["Autonomía combinada", version.combined]);
    }
    if (isConfirmed(version.drivetrain)) values.push(["Tracción", version.drivetrain]);
    if (isConfirmed(version.power)) values.push(["Potencia", version.power]);

    return values.slice(0, 2);
  };

  const versionCard = (model, version) => {
const meta = versionMeta(model, version);

    return `
      <article class="version-card ${version.recommended ? "recommended" : ""}">
        <span class="version-role">${version.role}</span>
        <h5>${version.name}</h5>
        <p>${version.summary}</p>

        ${meta.length ? `
          <div class="version-meta">
            ${meta.map(([label, value]) =>
              `<span>${label}<b>${value}</b></span>`
            ).join("")}
          </div>` : ""}
      </article>`;
  };

  const upgradeText = (current, next) => {
    if (
      isConfirmed(current.evRange) &&
      isConfirmed(next.evRange) &&
      current.evRange !== next.evRange
    ) {
      return `La autonomía eléctrica pasa de ${current.evRange} a ${next.evRange}; además sube el nivel de equipamiento de la versión.`;
    }

    return "Mantiene la propuesta principal del modelo y sube en nivel de equipamiento, confort o asistencias.";
  };

  const upgrades = model =>
    model.versions.slice(0, -1).map((version, index) => {
      const next = model.versions[index + 1];
      return `
        <div class="upgrade-step">
          <b>${version.name} → ${next.name}</b>
          <p>${upgradeText(version, next)}</p>
        </div>`;
    }).join("");

  const imageStage = model => {
    const labels = model.imageLabels || [
      "Vista principal",
      "Vista adicional",
      "Detalle del modelo"
    ];

    return `
      <div class="model-real-gallery">
        <figure class="real-main catalog-photo"
                data-src="${model.images[0]}"
                data-caption="${model.brand} ${model.name} · ${labels[0]}">
          <img src="${model.images[0]}"
               alt="${model.brand} ${model.name} 2026 · ${labels[0]}"
               loading="lazy">
          <figcaption>${labels[0]}</figcaption>
        </figure>

        <div class="real-secondary">
          <figure class="catalog-photo"
                  data-src="${model.images[1]}"
                  data-caption="${model.brand} ${model.name} · ${labels[1]}">
            <img src="${model.images[1]}"
                 alt="${model.brand} ${model.name} 2026 · ${labels[1]}"
                 loading="lazy">
            <figcaption>${labels[1]}</figcaption>
          </figure>

          <figure class="catalog-photo"
                  data-src="${model.images[2]}"
                  data-caption="${model.brand} ${model.name} · ${labels[2]}">
            <img src="${model.images[2]}"
                 alt="${model.brand} ${model.name} 2026 · ${labels[2]}"
                 loading="lazy">
            <figcaption>${labels[2]}</figcaption>
          </figure>
        </div>
      </div>`;
  };

  const competitorsHtml = model => {
    const values = (model.competitors || []).filter(value =>
      value &&
      !value.toLowerCase().includes("alternativas del mismo segmento") &&
      !value.toLowerCase().includes("versiones cercanas")
    );

    if (!values.length) return "";

    return `
      <aside class="competitors">
        <strong>Compite directamente con</strong>
        ${values.join(" · ")}
      </aside>`;
  };

  const modelCard = (model, segmentModels, index) => {
    const previous = segmentModels[index - 1];
    const next = segmentModels[index + 1];
    const competitors = competitorsHtml(model);

    return `
      <article id="${model.id}"
               class="model-card"
               data-model="${model.id}"
               data-segment="${model.segment}"
               data-energy="${energyType(model)}">

        <div class="model-topline">
          <div>
            <p class="model-brand">${model.brand}</p>
            <h3 class="model-title">${model.name} <span>2026</span></h3>
          </div>
          <span class="tech-badge">${model.tech}</span>
        </div>

        <div class="model-copy ${competitors ? "" : "model-copy--without-competitors"}">
          <div>
            <p class="persona">${model.persona}</p>
            <p class="model-description">${model.description}</p>
          </div>

          ${competitors}

          <aside class="model-range">
            <small>Precio referencial puesto en Bolivia</small>
            <strong>${priceRange(model)}</strong>
            <span>Un solo rango para todas las versiones mostradas.</span>
          </aside>
        </div>

        ${imageStage(model)}

        <div class="versions-heading">
          <h4>Versiones recomendadas</h4>
          <p>Primero explicamos qué aporta cada una; el precio se presenta como un único rango por modelo.</p>
        </div>

        <div class="version-grid" style="--version-count:${model.versions.length}">
          ${model.versions.map(version => versionCard(model, version)).join("")}
        </div>

        <section class="upgrade-box">
          <h4>${model.versions.length > 2
            ? "¿Qué obtienes al subir de versión?"
            : "¿Qué cambia realmente?"}</h4>
          <div class="upgrade-grid">${upgrades(model)}</div>
          <p class="recommendation">
            <strong>Recomendación AutoNomy:</strong> ${model.recommendation}
          </p>
        </section>

        ${comparison(model)}

        <div class="consider-box">
          <strong>Antes de elegir, considera</strong>
          <p>${model.consider}</p>
        </div>

        <p class="price-disclaimer">${data.priceDisclaimer}</p>

        <nav class="model-pager">
          ${previous
            ? `<a href="#${previous.id}">← ${previous.brand} ${previous.name}</a>`
            : `<a href="#filter-navigation">↑ Volver a los filtros</a>`}
          ${next
            ? `<a href="#${next.id}">${next.brand} ${next.name} →</a>`
            : `<a href="#filter-navigation">Volver a los filtros ↑</a>`}
        </nav>
      </article>`;
  };

  function renderCatalog() {
    const visibleIds = new Set(filteredModels().map(model => model.id));

    catalog.innerHTML = data.segments.map((segment, index) => {
      const models = data.models.filter(model =>
        model.segment === segment.id && visibleIds.has(model.id)
      );

      if (!models.length) return "";

      return `
        <section id="segment-${segment.id}"
                 class="segment-section"
                 style="--segment-background:${segment.background}"
                 data-segment-section="${segment.id}">
          <header class="segment-header">
            <span class="segment-index">
              ${String(index + 1).padStart(2, "0")} · ${segment.short}
            </span>
            <h2>${segment.title}</h2>
            <p>${segment.subtitle}</p>
          </header>
          ${models.map((model, modelIndex) =>
            modelCard(model, models, modelIndex)
          ).join("")}
        </section>`;
    }).join("");
  }

  function renderFilters() {
    const energyLabel =
      ENERGY.find(([id]) => id === activeEnergy)?.[1] || "Todos";
    const segmentLabel =
      data.segments.find(segment => segment.id === activeSegment)?.title || "Todos";
    const selectedModel =
      data.models.find(model => model.id === activeModel);

    if (energySummary) energySummary.textContent = energyLabel;
    if (segmentSummary) segmentSummary.textContent = segmentLabel;
    if (modelSummary) {
      modelSummary.textContent = selectedModel
        ? `${selectedModel.brand} ${selectedModel.name}`
        : "Seleccionar modelo";
    }

    energyNav.innerHTML = ENERGY.map(([id, label]) => `
      <button class="filter-chip ${activeEnergy === id ? "active" : ""}"
              data-energy="${id}"
              type="button">
        ${label}
      </button>`).join("");

    segmentNav.innerHTML = `
      <button class="filter-chip ${activeSegment === "all" ? "active" : ""}"
              data-segment="all"
              type="button">
        Todos
      </button>
      ${data.segments.map(segment => `
        <button class="filter-chip ${activeSegment === segment.id ? "active" : ""}"
                data-segment="${segment.id}"
                type="button">
          ${segment.title}
        </button>`).join("")}`;

    const list = filteredModels();
    modelNav.innerHTML = list.map(model => `
      <button class="filter-chip ${activeModel === model.id ? "active" : ""}"
              data-model-target="${model.id}"
              type="button">
        ${model.brand} ${model.name}
      </button>`).join("");

    counter.innerHTML =
      `<strong>${list.length}</strong> ${list.length === 1
        ? "modelo visible"
        : "modelos visibles"}`;

    clear.hidden = activeEnergy === "all" && activeSegment === "all";
  }

  function update() {
    renderFilters();
    renderCatalog();
  }

  energyNav.addEventListener("click", event => {
    const button = event.target.closest("[data-energy]");
    if (!button) return;
    activeEnergy = button.dataset.energy;
    activeModel = null;
    update();
  });

  segmentNav.addEventListener("click", event => {
    const button = event.target.closest("[data-segment]");
    if (!button) return;
    activeSegment = button.dataset.segment;
    activeModel = null;
    update();
  });

  modelNav.addEventListener("click", event => {
    const button = event.target.closest("[data-model-target]");
    if (!button) return;

    activeModel = button.dataset.modelTarget;
    renderFilters();
    modelFilterPanel.open = false;

    document.getElementById(activeModel)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  clear.addEventListener("click", () => {
    activeEnergy = "all";
    activeSegment = "all";
    activeModel = null;
    update();
  });

  window.addEventListener("scroll", () => {
    back.style.display = window.scrollY > 900 ? "block" : "none";
  });

  back.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  if (photoLightbox && photoLightboxImage && photoLightboxCaption) {
    catalog.addEventListener("click", event => {
      const photo = event.target.closest(".catalog-photo");
      if (!photo) return;

      photoLightboxImage.src = photo.dataset.src;
      photoLightboxImage.alt = photo.dataset.caption;
      photoLightboxCaption.textContent = photo.dataset.caption;
      photoLightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });

    const closePhotoLightbox = () => {
      photoLightbox.hidden = true;
      photoLightboxImage.src = "";
      document.body.style.overflow = "";
    };

    photoLightbox.addEventListener("click", event => {
      if (
        event.target === photoLightbox ||
        event.target.closest(".catalog-lightbox__close")
      ) closePhotoLightbox();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !photoLightbox.hidden) {
        closePhotoLightbox();
      }
    });
  }

  update();
})();
