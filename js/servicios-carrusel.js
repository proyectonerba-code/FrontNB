/* Grupo NERBA HIDALGO - Carrusel de "Servicios generales" del index.
   Muestra 3 tarjetas a la vez y se desplaza solo. Los datos vienen de
   /api/servicios, que edita el staff (admin/superadmin). Si la API falla, no
   toca nada y se quedan los tiles que ya venia en el HTML.

   Sin dependencias: el desplazamiento es un scroll del contenedor, no un
   carrusel de libreria. Asi se comporta bien con el dedo en el celu y respeta
   'prefers-reduced-motion'. */
(function () {
  var root = document.getElementById('servicios-carousel');
  if (!root) return;
  var track = document.getElementById('servicios-track');
  if (!track) return;
  /* La pista pasa a ser un scroll horizontal. El grid del HTML hacia que
     las tarjetas bajaran de a tres en filas, no de lado: sin overflow las
     flechas no tenian a donde moverse. Cada tarjeta toma 1/3 del ancho en
     escritorio y el ancho completo en movil, con scroll-snap para que se
     wasnt a medias al arrastrar con el dedo. */
  (function ensureCarruselCSS() {
    if (document.getElementById('un-serv-carrusel')) return;
    var st = document.createElement('style');
    st.id = 'un-serv-carrusel';
    st.textContent =
      '#servicios-track{display:flex;gap:1.5rem;overflow-x:auto;scroll-snap-type:x mandatory;' +
        'scroll-behavior:smooth;' +
        '-webkit-overflow-scrolling:touch;scrollbar-width:none;}' +
      '#servicios-track::-webkit-scrollbar{display:none;}' +
      '#servicios-track > *{flex:0 0 100%;scroll-snap-align:start;min-width:0;}' +
      '@media (min-width:1024px){#servicios-track > *{flex:0 0 calc((100% - 3rem)/3);}}' +
      '@media (prefers-reduced-motion:reduce){#servicios-track{scroll-behavior:auto;scroll-snap-type:none;}}';
    document.head.appendChild(st);
  })();

  var UN = window.UN;
  if (!UN || !UN.api) return;

  var POR_PAGINA = 3;
  var AUTO_MS = 5000;
  var items = [];
  var indice = 0;
  var timer = null;
  var pinzado = false;

  function esc(s) { try { return UN.esc(s); } catch (e) { return String(s == null ? '' : s); } }

  function reduceMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function tarjeta(s) {
    var img = s.image
      ? '<img alt="' + esc(s.title) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="' + esc(s.image) + '">'
      : '<div class="w-full h-full bg-neutral-100"></div>';
    var eyebrow = s.eyebrow
      ? '<span class="font-label-caps text-primary-container uppercase tracking-wider text-[11px] font-bold">' + esc(s.eyebrow) + '</span>'
      : '';
    var enlace = s.href
      ? '<div class="mt-4"><a class="inline-flex items-center gap-1 font-label-lg text-neutral-900 group-hover:text-primary-container uppercase text-[13px] font-bold transition-colors" href="' + esc(s.href) + '" data-un-masinfo="1"><span>MÁS INFORMACIÓN</span><span class="text-primary-container font-bold group-hover:translate-x-1 transition-transform">&gt;</span></a></div>'
      : '';
    return '<div class="group bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-primary-container rounded-xl flex flex-col justify-between transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">' +
      '<div class="p-8 text-left">' + eyebrow +
      '<h3 class="font-headline-lg text-headline-lg text-neutral-900 font-bold uppercase mt-2 group-hover:text-primary-container transition-colors">' + esc(s.title) + '</h3>' +
      '<p class="font-body-md text-body-md text-neutral-600 mt-3">' + esc(s.description) + '</p>' +
      enlace + '</div>' +
      '<div class="w-full h-72 overflow-hidden bg-neutral-100 border-t border-neutral-200">' + img + '</div>' +
      '</div>';
  }

  function paginas() {
    return Math.max(1, Math.ceil(items.length / POR_PAGINA));
  }

  function pintar() {
    track.innerHTML = items.map(tarjeta).join('');
    controles();
    irA(indice, false);
  }

  function ancho() {
    return window.matchMedia('(min-width: 1024px)').matches ? POR_PAGINA : 1;
  }

  // Desplaza el contenedor hasta la tarjeta que toca. En movil cabe 1 a la vez.
  // Distancia horizontal hasta la tarjeta que abre la pagina pedida.
  // Distancia horizontal hasta la tarjeta que abre la pagina pedida.
  // Se mide con offsetLeft de las tarjetas, que es justo donde el navegador
  // pone los anclajes del scroll-snap.
  function offsetDePagina(pagina, porPagina) {
    var kids = track.children;
    var primero = kids[0];
    if (!primero) return 0;
    var i = pagina * porPagina;
    // La ultima pagina puede venir incompleta: se pega al final del recorrido.
    if (!kids[i]) return Math.max(0, track.scrollWidth - track.clientWidth);
    return Math.max(0, kids[i].offsetLeft - primero.offsetLeft);
  }
  function irA(i, suave) {
    var porPagina = ancho();
    var total = paginas();
    indice = ((i % total) + total) % total;
    // El destino se saca de la tarjeta que abre la pagina, no de dividir el
    // ancho total: con scroll-snap los anclajes estan en cada tarjeta, y un
    // paso calculado aparte no cae en ninguno, asi que el navegador lo devuelve
    // al inicio y las flechas parecian no hacer nada.
    var destino = offsetDePagina(indice, porPagina);
    if (suave === false || reduceMotion()) track.scrollLeft = destino;
    else track.scrollTo({ left: destino, behavior: 'smooth' });
    if (typeof window.__unServiciosirA === 'function') {
      try { window.__unServiciosirA(indice, total); } catch (e) {}
    }
  }

  function controles() {
    if (root.querySelector('[data-serv-nav]')) { estado(); return; }
    var nav = document.createElement('div');
    nav.setAttribute('data-serv-nav', '1');
    nav.className = 'un-snav';
    nav.innerHTML =
      '<div class="un-sdots" role="tablist" aria-label="Paginas de servicios" data-serv-dots></div>' +
      '<div class="un-sflechas">' +
      '<button type="button" class="un-sflecha" data-serv-prev aria-label="Servicios anteriores">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>' +
      '<button type="button" class="un-sflecha" data-serv-next aria-label="Siguientes servicios">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg></button>' +
      '</div>';
    root.appendChild(nav);
    nav.querySelector('[data-serv-prev]').addEventListener('click', function () { pararAuto(); irA(indice - 1, true); });
    nav.querySelector('[data-serv-next]').addEventListener('click', function () { pararAuto(); irA(indice + 1, true); });
    estado();
  }

  function estado() {
    var dots = root.querySelector('[data-serv-dots]');
    if (!dots) return;
    var total = paginas();
    if (total < 2) { dots.innerHTML = ''; return; }
    var html = '';
    for (var i = 0; i < total; i++) {
      html += '<button type="button" data-dot="' + i + '" role="tab" aria-label="Ir al grupo ' + (i + 1) +
        '" aria-current="' + (i === indice ? 'true' : 'false') + '"></button>';
    }
    dots.innerHTML = html;
    dots.querySelectorAll('[data-dot]').forEach(function (b) {
      b.addEventListener('click', function () { pararAuto(); irA(parseInt(b.getAttribute('data-dot'), 10), true); });
    });
    // El velo de los bordes solo aparece del lado que hay hacia donde ir.
    root.setAttribute('data-velo-izq', indice > 0 ? '1' : '0');
    root.setAttribute('data-velo-der', indice < total - 1 ? '1' : '0');
  }

  function arrancarAuto() {
    pararAuto();
    if (reduceMotion()) return;
    if (items.length <= POR_PAGINA) return;
    timer = setInterval(function () { if (!pinzado) irA(indice + 1, true); }, AUTO_MS);
  }
  function pararAuto() { if (timer) { clearInterval(timer); timer = null; } }

  // Al tocar o pasar el mouse se detiene el auto-avance, y al salir vuelve.
  ['mouseenter', 'touchstart', 'focusin', 'pointerdown'].forEach(function (ev) {
    root.addEventListener(ev, function () { pinzado = true; pararAuto(); });
  });
  ['mouseleave', 'touchend', 'focusout'].forEach(function (ev) {
    root.addEventListener(ev, function () { pinzado = false; arrancarAuto(); });
  });

  // Con el cursor sobre la seccion, las flechas del teclado tambien recorren.
  root.setAttribute('tabindex', '-1');
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); pararAuto(); irA(indice + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pararAuto(); irA(indice - 1, true); }
  });

  window.addEventListener('resize', function () { if (items.length) irA(indice, false); });

  function cargar() {
    UN.api('/api/servicios').then(function (lista) {
      if (!Array.isArray(lista) || !lista.length) return; // deja los tiles de respaldo
      items = lista.filter(function (s) { return s && s.activo !== false; });
      if (!items.length) return;
      indice = 0;
      pintar();
      arrancarAuto();
      try { window.__unServicios = items.slice(); } catch (e) {}
    }).catch(function () { /* sin API se quedan los tiles del HTML */ });
  }

  // El staff avisa por el mismo canal que el catalogo al guardar o borrar.
  try {
    window.addEventListener('storage', function (e) { if (e && e.key === 'unidos_catalog_ping') cargar(); });
  } catch (e) {}
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      var bc = new BroadcastChannel('unidos-catalogo');
      bc.onmessage = function () { cargar(); };
    } catch (e) {}
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) cargar(); });
  setInterval(cargar, 60000);

  window.__unReloadServicios = cargar;
  cargar();
})();
