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
      '@media (prefers-reduced-motion:reduce){#servicios-track{scroll-behavior:auto;scroll-snap-type:none;}}' +
      /* Los botones de abajo se crean desde el JS y sin estas reglas salian
         invisibles: el SVG no tenia tamano ni color, y los puntos nada. */
      '.un-snav{position:absolute;inset:0;pointer-events:none;z-index:5;}' +
      '.un-sflecha{position:absolute;top:36%;display:none;align-items:center;justify-content:center;' +
        'width:46px;height:46px;border-radius:9999px;background:#fff;color:#1c1917;' +
        'border:1px solid rgba(0,0,0,.10);box-shadow:0 6px 18px rgba(0,0,0,.16);' +
        'pointer-events:auto;cursor:pointer;padding:0;' +
        'transition:transform .18s ease,background .18s ease,color .18s ease,box-shadow .18s ease;}' +
      '.un-sflecha svg{width:24px;height:24px;display:block;}' +
      '.un-sflecha-izq{left:-8px;}' +
      '.un-sflecha-der{right:-8px;}' +
      '/* En celular las flechas estorban: ahi se desliza con el dedo. */' +
      '@media (min-width:640px){.un-sflecha{display:flex;}}' +
      '@media (min-width:1280px){.un-sflecha-izq{left:-14px;}.un-sflecha-der{right:-14px;}}' +
      '.un-sflecha:hover{background:var(--color-primary-container,#d91b1b);color:#fff;' +
        'transform:scale(1.07);box-shadow:0 10px 24px rgba(0,0,0,.22);}' +
      '.un-sflecha:active{transform:scale(.96);}' +
      '.un-sflecha:focus-visible{outline:2px solid var(--color-primary-container,#d91b1b);outline-offset:3px;}' +
      '.un-sflecha[disabled]{opacity:.25;cursor:default;box-shadow:none;}' +
      '.un-sflecha[disabled]:hover{background:#fff;color:#1c1917;transform:none;box-shadow:none;}' +
      '.un-sdots{position:absolute;left:0;right:0;bottom:-30px;display:flex;gap:.4rem;' +
        'justify-content:center;align-items:center;}' +
      '.un-sdots button{width:9px;height:9px;border-radius:9999px;border:0;padding:0;cursor:pointer;' +
        'pointer-events:auto;' +
        'background:rgba(28,25,23,.28);transition:width .2s ease,background .2s ease;}' +
      '.un-sdots button:hover{background:rgba(28,25,23,.5);}' +
      '.un-sdots button[aria-current="true"]{width:26px;background:var(--color-primary-container,#d91b1b);}' +
      '.un-sdots button:focus-visible{outline:2px solid var(--color-primary-container,#d91b1b);outline-offset:3px;}' +
      '@media (prefers-reduced-motion:reduce){.un-sflecha,.un-sdots button{transition:none;}}';
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
    // Con el ancho de la pantalla, no siempre 3: en celular cabe una tarjeta y
    // el numero de grupos es otro. Con la cuenta fija, en el celu los puntos
    // eran 3 y las flechas solo alcanzaban las tres primeras.
    return Math.max(1, Math.ceil(items.length / ancho()));
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
    var tope = Math.max(0, track.scrollWidth - track.clientWidth);
    var destino;
    if (kids[i]) destino = kids[i].offsetLeft - primero.offsetLeft;
    // La ultima pagina puede venir incompleta: se pega al final del recorrido.
    else destino = tope;
    // Y se recorta al tope de todos modos: con 7 tarjetas y 3 por pagina la
    // septima queda mas alla de lo que se puede scrollear, y el navegador la
    // frenaba en el final. Entonces "ir al ultimo grupo" se quedaba a medio
    // camino, el automatico no avanzaba y la flecha no se apagaba nunca.
    return Math.max(0, Math.min(destino, tope));
  }
  function irA(i, suave) {
    var porPagina = ancho();
    var total = paginas();
    // Se queda dentro del recorrido: en los extremos ya no hay a donde ir.
    indice = Math.min(total - 1, Math.max(0, i));
    // El destino se saca de la tarjeta que abre la pagina, no de dividir el
    // ancho total: con scroll-snap los anclajes estan en cada tarjeta, y un
    // paso calculado aparte no cae en ninguno, asi que el navegador lo devuelve
    // al inicio y las flechas parecian no hacer nada.
    var destino = offsetDePagina(indice, porPagina);
    marcarMoviendo();
    if (suave === false || reduceMotion()) track.scrollLeft = destino;
    else track.scrollTo({ left: destino, behavior: 'smooth' });
    // Los puntos y las flechas tienen que seguir al carrusel. Antes esto no
    // pasaba: se movia la pista pero los controles se quedaban en el primer
    // grupo, y la flecha de "siguiente" nunca se apagaba al final.
    estado();
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
      '<button type="button" class="un-sflecha un-sflecha-izq" data-serv-prev aria-label="Servicios anteriores">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg></button>' +
      '<button type="button" class="un-sflecha un-sflecha-der" data-serv-next aria-label="Siguientes servicios">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg></button>' +
      '<div class="un-sdots" role="tablist" aria-label="Paginas de servicios" data-serv-dots></div>';
    root.appendChild(nav);
    nav.querySelector('[data-serv-prev]').addEventListener('click', function () { pararAuto(); irA(indice - 1, true); });
    nav.querySelector('[data-serv-next]').addEventListener('click', function () { pararAuto(); irA(indice + 1, true); });
    estado();
  }

  function estado() {
    var dots = root.querySelector('[data-serv-dots]');
    if (!dots) return;
    var total = paginas();
    // En los extremos la flecha de ese lado se apaga: antes daba la vuelta y
    // teletransportaba al final del recorrido, que se Sentia como que fallaba.
    var prev = root.querySelector('[data-serv-prev]');
    var next = root.querySelector('[data-serv-next]');
    if (prev) prev.disabled = indice <= 0;
    if (next) next.disabled = total < 2 || indice >= total - 1;
    // Los puntos solo se rehacen si cambio el numero de grupos. Antes se
    // recreaban en cada movimiento, asi que al tabular se perdia el foco.
    if (dots.children.length !== total) {
      var html = '';
      for (var i = 0; i < total; i++) {
        html += '<button type="button" data-dot="' + i + '" role="tab" aria-label="Ir al grupo ' + (i + 1) + '"></button>';
      }
      dots.innerHTML = html;
      dots.querySelectorAll('[data-dot]').forEach(function (b) {
        b.addEventListener('click', function () { pararAuto(); irA(parseInt(b.getAttribute('data-dot'), 10), true); });
      });
    }
    dots.querySelectorAll('[data-dot]').forEach(function (b, i) {
      b.setAttribute('aria-current', i === indice ? 'true' : 'false');
    });
    // El velo de los bordes solo aparece del lado que hay hacia donde ir.
    root.setAttribute('data-velo-izq', indice > 0 ? '1' : '0');
    root.setAttribute('data-velo-der', indice < total - 1 ? '1' : '0');
  }

  function arrancarAuto() {
    pararAuto();
    if (reduceMotion()) return;
    if (items.length <= POR_PAGINA) return;
    timer = setInterval(function () {
      if (pinzado) return;
      var total = paginas();
      if (indice >= total - 1) irA(0, false); // vuelve al inicio, sin viaje largo
      else irA(indice + 1, true);
    }, AUTO_MS);
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

  // Si el visitante desliza con el dedo (o mueve la barra), la pagina actual se
  // deduce del scroll: si no, las flechas y los puntos se quedan en el grupo
  // anterior y el automatico arranco desde ahi, rebobinando lo que el visitante
  // ya habia pasado. Durante un movimiento del propio carrusel se ignora.
  var moviendo = false, timerMov = null, timerScroll = null;
  function marcarMoviendo() {
    moviendo = true;
    clearTimeout(timerMov);
    timerMov = setTimeout(function () { moviendo = false; }, 700);
  }
  function desdeScroll() {
    if (moviendo) return;
    var porPagina = ancho();
    var total = paginas();
    var mejor = 0, mejorDist = Infinity;
    for (var p = 0; p < total; p++) {
      var d = Math.abs(offsetDePagina(p, porPagina) - track.scrollLeft);
      if (d < mejorDist) { mejorDist = d; mejor = p; }
    }
    if (mejor !== indice) { indice = mejor; estado(); }
  }
  track.addEventListener('scroll', function () {
    clearTimeout(timerScroll);
    timerScroll = setTimeout(desdeScroll, 130);
  }, { passive: true });

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
