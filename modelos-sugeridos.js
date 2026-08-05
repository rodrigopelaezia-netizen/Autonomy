
(() => {
  const models = window.AUTONOMY_MODELS;
  const segments = window.AUTONOMY_SEGMENTS;
  const catalog = document.getElementById("catalog");
  const energyFilters = document.getElementById("energy-filters");
  const segmentFilters = document.getElementById("segment-filters");
  const modelSelect = document.getElementById("model-select");
  const resultCount = document.getElementById("result-count");
  const clearFilters = document.getElementById("clear-filters");
  const backToTop = document.getElementById("back-to-top");
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("p");

  let activeEnergy = "all";
  let activeSegment = "all";

  const energyLabels = [
    ["all", "Todos"],
    ["BEV", "BEV · 100% eléctrico"],
    ["PHEV", "PHEV · Híbrido enchufable"],
    ["REEV", "REEV · Rango extendido"],
    ["HEV", "HEV · Sin enchufe"],
  ];

  const formatMoney = (number) =>
    `USD ${new Intl.NumberFormat("es-BO", {maximumFractionDigits:0}).format(number).replaceAll(",", ".")}`;

  const modelRange = (model) => {
    const values = model.versions.map(v => v[3]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max).replace("USD ","")}`;
  };

  const roleFor = (index, count) => {
    if (count === 2) return index === 0 ? "Versión de entrada" : "Versión recomendada";
    return ["Versión de entrada","Mejor equilibrio","Versión superior"][index] || "Versión disponible";
  };

  const summaryFor = (index, count) => {
    if (count === 2) return index === 0
      ? "Cubre lo esencial y prioriza una inversión más contenida."
      : "Añade equipamiento o autonomía para quien usará el vehículo como opción principal.";
    return [
      "La opción más accesible para entrar a la gama.",
      "El punto medio entre precio, autonomía y equipamiento.",
      "La alternativa más completa para quien prioriza equipamiento."
    ][index] || "Configuración disponible.";
  };

  const whatsapp = "59163560315";
  const generalMessage = encodeURIComponent(
    "*Consulta AutoNomy — Modelos sugeridos*\n\nHola, estuve revisando la guía y quiero asesoramiento para elegir un vehículo."
  );
  ["header-whatsapp","floating-whatsapp","final-whatsapp"].forEach(id => {
    document.getElementById(id).href = `https://wa.me/${whatsapp}?text=${generalMessage}`;
  });

  const versionCard = (model, version, index) => {
    const recommended = index === Math.min(1, model.versions.length - 1);
    const message = encodeURIComponent(
      `*Consulta AutoNomy — ${model.brand} ${model.name} 2026*\n\nHola, quiero información sobre la versión ${version[0]}.`
    );
    return `
      <article class="version-card ${recommended ? "recommended" : ""}">
        <span class="version-role">${roleFor(index, model.versions.length)}</span>
        <h4>${version[0]}</h4>
        <p>${summaryFor(index, model.versions.length)}</p>
        <div class="version-meta">
          <span>Autonomía eléctrica<b>${version[1]}</b></span>
          <span>Autonomía combinada<b>${version[2]}</b></span>
        </div>
        <div class="version-price">
          <small>Precio referencial puesto en Bolivia</small>
          <strong>${formatMoney(version[3])}</strong>
        </div>
        <a class="version-whatsapp" href="https://wa.me/${whatsapp}?text=${message}" target="_blank" rel="noopener">
          Consultar esta versión
        </a>
      </article>`;
  };

  const gallery = (model) => {
    const warning = model.image_status === "real" ? "" : `<span class="placeholder-warning">Fotografía oficial pendiente</span>`;
    return `
      <div class="model-gallery">
        <figure class="gallery-item gallery-main" data-src="${model.images[0]}" data-caption="${model.brand} ${model.name} · exterior">
          <img src="${model.images[0]}" alt="${model.brand} ${model.name} 2026 · exterior" loading="lazy">
          <span class="gallery-caption">Exterior</span>${warning}
        </figure>
        <div class="gallery-secondary">
          <figure class="gallery-item" data-src="${model.images[1]}" data-caption="${model.brand} ${model.name} · interior y consola">
            <img src="${model.images[1]}" alt="${model.brand} ${model.name} 2026 · interior" loading="lazy">
            <span class="gallery-caption">Interior y consola</span>${warning}
          </figure>
          <figure class="gallery-item" data-src="${model.images[2]}" data-caption="${model.brand} ${model.name} · espacio y practicidad">
            <img src="${model.images[2]}" alt="${model.brand} ${model.name} 2026 · espacio" loading="lazy">
            <span class="gallery-caption">Espacio y practicidad</span>${warning}
          </figure>
        </div>
      </div>`;
  };

  const comparison = (model) => {
    const heads = model.versions.map(v => `<th>${v[0]}</th>`).join("");
    const rows = [
      ["Tecnología", ...model.versions.map(() => model.tech)],
      ["Autonomía eléctrica CLTC", ...model.versions.map(v => v[1])],
      ["Autonomía combinada", ...model.versions.map(v => v[2])],
      ["Precio referencial Bolivia", ...model.versions.map(v => formatMoney(v[3]))],
    ];
    return `
      <details class="comparison">
        <summary>Comparar las versiones</summary>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Parámetro</th>${heads}</tr></thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </div>
      </details>`;
  };

  const modelCard = (model) => `
    <article class="model-card" id="${model.id}" data-energy="${model.energy}" data-segment="${model.segment}">
      <div class="model-header">
        <div>
          <p class="model-brand">${model.brand}</p>
          <h3 class="model-title">${model.name} <span>2026</span></h3>
        </div>
        <span class="tech-badge">${model.tech}</span>
      </div>

      <div class="model-copy">
        <div>
          <p class="persona">${model.tagline}</p>
          <p class="model-description">${model.description}</p>
          ${model.preventa ? `<a class="model-preventa" href="index.html#${model.preventa}">Unidad disponible en preventa →</a>` : ""}
        </div>
        <aside class="model-price">
          <small>Rango referencial puesto en Bolivia</small>
          <strong>${modelRange(model)}</strong>
          <span>Incluye las versiones mostradas.</span>
        </aside>
      </div>

      ${gallery(model)}

      <div class="consider-box">
        <strong>Antes de elegir, considera</strong>
        <p>${model.consider}</p>
      </div>

      <div class="versions-heading">
        <h3>Versiones recomendadas</h3>
        <p>Las diferencias se explican en lenguaje común antes de entrar a la comparativa.</p>
      </div>

      <div class="version-grid" style="--version-count:${model.versions.length}">
        ${model.versions.map((v,i) => versionCard(model,v,i)).join("")}
      </div>

      ${comparison(model)}

      <p class="model-footer">
        Datos y precios referenciales del borrador de validación AutoNomy. Autonomías expresadas en CLTC cuando corresponde.
      </p>
    </article>`;

  models.forEach(model => {
    const t = model.tech.toLowerCase();
    model.energy = t.includes("rango extendido") ? "REEV" :
      t.includes("enchufable") ? "PHEV" :
      t.includes("no enchufable") ? "HEV" : "BEV";
  });

  function filteredModels() {
    return models.filter(model =>
      (activeEnergy === "all" || model.energy === activeEnergy) &&
      (activeSegment === "all" || model.segment === activeSegment)
    );
  }

  function renderFilters() {
    energyFilters.innerHTML = energyLabels.map(([id,label]) =>
      `<button class="filter-chip ${activeEnergy === id ? "active" : ""}" data-energy="${id}" type="button">${label}</button>`
    ).join("");

    segmentFilters.innerHTML = [
      `<button class="filter-chip ${activeSegment === "all" ? "active" : ""}" data-segment="all" type="button">Todos</button>`,
      ...segments.map(([id,label]) =>
        `<button class="filter-chip ${activeSegment === id ? "active" : ""}" data-segment="${id}" type="button">${label}</button>`
      )
    ].join("");

    const available = filteredModels();
    modelSelect.innerHTML = `<option value="">Todos los modelos</option>` +
      available.map(model => `<option value="${model.id}">${model.brand} ${model.name}</option>`).join("");

    resultCount.textContent = `${available.length} ${available.length === 1 ? "modelo visible" : "modelos visibles"}`;
  }

  function renderCatalog() {
    const visibleIds = new Set(filteredModels().map(m => m.id));
    catalog.innerHTML = segments.map(([segmentId, segmentLabel]) => {
      const segmentModels = models.filter(m => m.segment === segmentId && visibleIds.has(m.id));
      if (!segmentModels.length) return "";
      return `
        <section class="segment-section" id="segment-${segmentId}">
          <div class="segment-heading">
            <p>Guía por segmento</p>
            <h2>${segmentLabel}</h2>
          </div>
          ${segmentModels.map(modelCard).join("")}
        </section>`;
    }).join("");

    document.querySelectorAll(".gallery-item").forEach(item => {
      item.addEventListener("click", () => {
        lightboxImage.src = item.dataset.src;
        lightboxImage.alt = item.dataset.caption;
        lightboxCaption.textContent = item.dataset.caption;
        lightbox.hidden = false;
        document.body.classList.add("no-scroll");
      });
    });
  }

  function update() {
    renderFilters();
    renderCatalog();
  }

  energyFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-energy]");
    if (!button) return;
    activeEnergy = button.dataset.energy;
    update();
  });

  segmentFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-segment]");
    if (!button) return;
    activeSegment = button.dataset.segment;
    update();
  });

  modelSelect.addEventListener("change", () => {
    if (!modelSelect.value) return;
    document.getElementById(modelSelect.value)?.scrollIntoView({behavior:"smooth",block:"start"});
  });

  clearFilters.addEventListener("click", () => {
    activeEnergy = "all";
    activeSegment = "all";
    update();
  });

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox || event.target.closest(".lightbox-close")) {
      lightbox.hidden = true;
      document.body.classList.remove("no-scroll");
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !lightbox.hidden) {
      lightbox.hidden = true;
      document.body.classList.remove("no-scroll");
    }
  });

  window.addEventListener("scroll", () => {
    backToTop.style.display = window.scrollY > 900 ? "block" : "none";
  });

  backToTop.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));

  update();
})();
