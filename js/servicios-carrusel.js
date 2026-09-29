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
  function irA(i, suave) {
    var porPagina = ancho();
    var total = paginas();
    indice = ((i % total) + total) % total;
    var paso = track.scrollWidth / total;
    var destino = Math.round(indice * paso);
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
    nav.className = 'flex items-center justify-between gap-4 mt-8';
    nav.innerHTML =
      '<div class="flex items-center gap-2" data-serv-dots></div>' +
      '<div class="flex items-center gap-2">' +
      '<button type="button" data-serv-prev aria-label="Servicios anteriores" class="w-11 h-11 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:border-primary-container hover:text-primary-container transition-colors flex items-center justify-center shadow-sm">&#8249;</button>' +
      '<button type="button" data-serv-next aria-label="Siguientes servicios" class="w-11 h-11 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:border-primary-container hover:text-primary-container transition-colors flex items-center justify-center shadow-sm">&rsaquo;</button>' +
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
      html += '<button type="button" data-dot="' + i + '" aria-label="Ir al grupo ' + (i + 1) + '" class="h-2 rounded-full transition-all ' +
        (i === indice ? 'w-7 bg-primary-container' : 'w-2 bg-neutral-300 hover:bg-neutral-400') + '"></button>';
    }
    dots.innerHTML = html;
    dots.querySelectorAll('[data-dot]').forEach(function (b) {
      b.addEventListener('click', function () { pararAuto(); irA(parseInt(b.getAttribute('data-dot'), 10), true); });
    });
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
