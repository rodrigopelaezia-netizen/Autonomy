
(() => {
  const data = window.AUTONOMY_CATALOG;
  const catalog = document.getElementById("catalog");
  const energyNav = document.getElementById("energy-nav");
  const segmentNav = document.getElementById("segment-nav");
  const modelNav = document.getElementById("model-nav");
  const counter = document.querySelector(".filter-counter");
  const clear = document.querySelector(".clear-filters");
  const back = document.getElementById("back-to-top");
  let activeEnergy = "all";
  let activeSegment = "all";
  let activeModel = null;
  const photoLightbox = document.getElementById("catalog-lightbox");
  const photoLightboxImage = photoLightbox?.querySelector("img") || null;
  const photoLightboxCaption = photoLightbox?.querySelector("p") || null;

  const ENERGY = [
    ["all","Todos"],
    ["BEV","BEV · 100% eléctrico"],
    ["PHEV","PHEV · Híbrido enchufable"],
    ["REEV","REEV · Rango extendido"],
    ["HEV","HEV · Sin enchufe"]
  ];

  const energyType = model => {
    const t = model.tech.toLowerCase();
    if (t.includes("rango extendido")) return "REEV";
    if (t.includes("enchufable")) return "PHEV";
    if (t.includes("no enchufable")) return "HEV";
    return "BEV";
  };

  const money = value => `USD ${new Intl.NumberFormat("es-BO",{maximumFractionDigits:0}).format(value).replaceAll(",",".")}`;
  const range = model => {
    const vals = model.versions.map(v => v.price);
    const min = Math.min(...vals), max = Math.max(...vals);
    return min === max ? money(min) : `${money(min)} – ${money(max).replace("USD ","")}`;
  };
  const whatsappBase = `https://wa.me/${data.whatsapp}`;
  const general = encodeURIComponent("*Consulta AutoNomy — Modelos sugeridos*\n\nHola, quiero asesoramiento para elegir un vehículo.");
  ["header-whatsapp","floating-whatsapp","final-whatsapp"].forEach(id => document.getElementById(id).href=`${whatsappBase}?text=${general}`);

  const filtered = () => data.models.filter(m =>
    (activeEnergy === "all" || energyType(m) === activeEnergy) &&
    (activeSegment === "all" || m.segment === activeSegment)
  );

  const valueFor = (m,v,key) => ({
    tech:m.tech,evRange:v.evRange,combined:v.combined,battery:v.battery,power:v.power,
    torque:v.torque,drivetrain:v.drivetrain,dc:v.dc,ac:v.ac,dimensions:m.common.dimensions,
    wheelbase:m.common.wheelbase,seats:m.common.seats,trunk:m.common.trunk,
    suspension:m.common.suspension,camera:v.camera,adas:v.adas,screen:m.common.screen,
    instrument:m.common.instrument,v2l:m.common.v2l,price:money(v.price)
  })[key] || "Dato por confirmar";

  const matrixRows = [
    ["Tecnología","tech",false],["Autonomía eléctrica","evRange",false],["Autonomía combinada","combined",false],
    ["Batería","battery",false],["Potencia","power",false],["Torque","torque",false],["Tracción","drivetrain",false],
    ["Carga rápida DC","dc",false],["Carga AC","ac",true],["Dimensiones","dimensions",true],
    ["Distancia entre ejes","wheelbase",true],["Asientos","seats",true],["Maletero / espacio","trunk",true],
    ["Suspensión","suspension",true],["Cámara","camera",true],["Asistencias","adas",true],
    ["Pantalla central","screen",true],["Instrumental / HUD","instrument",true],["Descarga V2L","v2l",true],
    ["Precio referencial Bolivia","price",true]
  ];

  const versionCard = (m,v) => {
    const msg = encodeURIComponent(`*Consulta AutoNomy — ${m.brand} ${m.name} 2026*\nVersión: ${v.name}\n\nHola, quiero conocer disponibilidad, precio final y tiempo estimado.`);
    return `<article class="version-card ${v.recommended?"recommended":""}">
      <span class="version-role">${v.role}</span><h5>${v.name}</h5><p>${v.summary}</p>
      <div class="version-meta"><span>Autonomía<b>${v.evRange}</b></span><span>Tracción<b>${v.drivetrain}</b></span></div>
      <div class="version-contact-row"><div class="price"><small>Precio referencial puesto en Bolivia</small><strong>${money(v.price)}</strong></div>
      <a class="version-whatsapp" href="${whatsappBase}?text=${msg}" target="_blank" rel="noopener">Consultar</a></div>
    </article>`;
  };

  const matrix = m => `<section class="matrix">
    <div class="matrix-heading"><h4>Resumen técnico</h4><p>Los datos principales están visibles; despliega la matriz para revisar 20 parámetros.</p></div>
    <div class="table-wrap"><table><thead><tr><th>Parámetro</th>${m.versions.map(v=>`<th>${v.name}</th>`).join("")}</tr></thead>
    <tbody>${matrixRows.map(([label,key,extra])=>`<tr class="${extra?"extra-row":""}"><td>${label}</td>${m.versions.map(v=>`<td>${valueFor(m,v,key)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <button class="matrix-toggle" type="button">Ver matriz completa</button></section>`;

  const imageStage = m => {
    const labels = m.imageLabels || ["Vista principal", "Vista adicional", "Detalle del modelo"];
    return `
      <div class="model-real-gallery">
        <figure class="real-main catalog-photo" data-src="${m.images[0]}" data-caption="${m.brand} ${m.name} · ${labels[0]}">
          <img src="${m.images[0]}" alt="${m.brand} ${m.name} 2026 · ${labels[0]}" loading="lazy">
          <figcaption>${labels[0]}</figcaption>
        </figure>
        <div class="real-secondary">
          <figure class="catalog-photo" data-src="${m.images[1]}" data-caption="${m.brand} ${m.name} · ${labels[1]}">
            <img src="${m.images[1]}" alt="${m.brand} ${m.name} 2026 · ${labels[1]}" loading="lazy">
            <figcaption>${labels[1]}</figcaption>
          </figure>
          <figure class="catalog-photo" data-src="${m.images[2]}" data-caption="${m.brand} ${m.name} · ${labels[2]}">
            <img src="${m.images[2]}" alt="${m.brand} ${m.name} 2026 · ${labels[2]}" loading="lazy">
            <figcaption>${labels[2]}</figcaption>
          </figure>
        </div>
      </div>`;
  };

  const card = (m,segmentModels,index) => {
    const prev=segmentModels[index-1],next=segmentModels[index+1];
    return `<article id="${m.id}" class="model-card" data-model="${m.id}" data-segment="${m.segment}" data-energy="${energyType(m)}">
      <div class="model-topline"><div><p class="model-brand">${m.brand}</p><h3 class="model-title">${m.name} <span>2026</span></h3></div><span class="tech-badge">${m.tech}</span></div>
      <div class="model-copy">
        <div><p class="persona">${m.persona}</p><p class="model-description">${m.description}</p></div>
        <aside class="competitors"><strong>Compite directamente con</strong>${m.competitors.join(" · ")}</aside>
        <aside class="model-range"><small>Precio referencial puesto en Bolivia</small><strong>${range(m)}</strong><span>Rango que incluye todas las versiones mostradas.</span></aside>
      </div>
      ${imageStage(m)}
      <div class="versions-heading"><h4>Versiones recomendadas</h4><p>Diferencias explicadas antes de la comparativa técnica.</p></div>
      <div class="version-grid" style="--version-count:${m.versions.length}">${m.versions.map(v=>versionCard(m,v)).join("")}</div>
      <section class="upgrade-box"><h4>${m.versions.length>2?"¿Qué obtienes al subir de versión?":"¿Qué cambia realmente?"}</h4>
        <div class="upgrade-grid">${m.upgrade.map(u=>`<div class="upgrade-step"><b>${u.from} → ${u.to}</b><p>${u.text}</p></div>`).join("") || `<div class="upgrade-step"><p>Una sola configuración sugerida.</p></div>`}</div>
        <p class="recommendation"><strong>Recomendación AutoNomy:</strong> ${m.recommendation}</p>
      </section>
      ${matrix(m)}
      <p class="price-disclaimer">${data.priceDisclaimer} ${data.dataDisclaimer}</p>
      <nav class="model-pager">${prev?`<a href="#${prev.id}">← ${prev.brand} ${prev.name}</a>`:`<a href="#filter-navigation">↑ Volver a los filtros</a>`}${next?`<a href="#${next.id}">${next.brand} ${next.name} →</a>`:`<a href="#filter-navigation">Volver a los filtros ↑</a>`}</nav>
    </article>`;
  };

  function render(){
    const visible=new Set(filtered().map(m=>m.id));
    catalog.innerHTML=data.segments.map((s,i)=>{
      const ms=data.models.filter(m=>m.segment===s.id&&visible.has(m.id));
      if(!ms.length)return "";
      return `<section id="segment-${s.id}" class="segment-section" style="--segment-background:${s.background}" data-segment-section="${s.id}">
        <header class="segment-header"><span class="segment-index">${String(i+1).padStart(2,"0")} · ${s.short}</span><h2>${s.title}</h2><p>${s.subtitle}</p></header>
        ${ms.map((m,idx)=>card(m,ms,idx)).join("")}</section>`;
    }).join("");
    document.querySelectorAll(".matrix-toggle").forEach(btn=>btn.addEventListener("click",()=>{
      const mx=btn.closest(".matrix"),open=mx.classList.toggle("open");
      btn.textContent=open?"Ocultar matriz completa":"Ver matriz completa";
    }));
  }

  function renderFilters(){
    energyNav.innerHTML=`<span class="filter-label">Tipo de energía</span><div class="filter-options">${ENERGY.map(([id,label])=>`<button class="filter-chip ${activeEnergy===id?"active":""}" data-energy="${id}" type="button">${label}</button>`).join("")}</div>`;
    segmentNav.innerHTML=`<span class="filter-label">Segmento</span><div class="filter-options"><button class="filter-chip ${activeSegment==="all"?"active":""}" data-segment="all" type="button">Todos</button>${data.segments.map(s=>`<button class="filter-chip ${activeSegment===s.id?"active":""}" data-segment="${s.id}" type="button">${s.title}</button>`).join("")}</div>`;
    const list=filtered();
    modelNav.innerHTML=`<span class="filter-label">Ir al modelo</span><div class="filter-options">${list.map(m=>`<button class="filter-chip ${activeModel===m.id?"active":""}" data-model-target="${m.id}" type="button">${m.brand} ${m.name}</button>`).join("")}</div>`;
    counter.innerHTML=`<strong>${list.length}</strong> ${list.length===1?"modelo visible":"modelos visibles"}`;
    clear.hidden=activeEnergy==="all"&&activeSegment==="all";
  }
  function update(){renderFilters();render()}
  energyNav.addEventListener("click",e=>{const b=e.target.closest("[data-energy]");if(!b)return;activeEnergy=b.dataset.energy;activeModel=null;update()});
  segmentNav.addEventListener("click",e=>{const b=e.target.closest("[data-segment]");if(!b)return;activeSegment=b.dataset.segment;activeModel=null;update()});
  modelNav.addEventListener("click",e=>{const b=e.target.closest("[data-model-target]");if(!b)return;activeModel=b.dataset.modelTarget;renderFilters();document.getElementById(activeModel)?.scrollIntoView({behavior:"smooth",block:"start"})});
  clear.addEventListener("click",()=>{activeEnergy="all";activeSegment="all";activeModel=null;update()});
  window.addEventListener("scroll",()=>back.style.display=window.scrollY>900?"block":"none");
  back.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
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
      if (event.target === photoLightbox || event.target.closest(".catalog-lightbox__close")) closePhotoLightbox();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !photoLightbox.hidden) closePhotoLightbox();
    });
  }
  update();
})();
