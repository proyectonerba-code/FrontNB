/* Grupo NERBA HIDALGO - Contenido del pie de pagina en TODAS las interfaces.
   El pie queda limpio a proposito: solo datos de la empresa que podemos
   sostener. No se anuncian certificaciones, garantias, plazos de respuesta ni
   cifras de operaciones, porque son afirmaciones que la empresa tiene que
   poder respaldar (y un pie no es el lugar para prometer).
   Este archivo REEMPLAZA el contenido de cualquier <footer> por:
     1) la franja de datos de la empresa,
     2) la linea de derechos reservados y enlaces legales, y
     3) la linea roja con brillo que cierra el pie.
   Cambias los datos aqui y se actualizan los 25 pies del sitio a la vez. */
(function () {
  if (document.getElementById('un-pie-empresa')) return;
  var pie = document.querySelector('footer');
  if (!pie) return;

  var DATOS = {
    razon: 'GRUPO EMPRESARIAL NERBA, S.A. DE C.V.',
    giro: 'Automatización • Seguridad electrónica • Videovigilancia • Control de acceso • Puertas automáticas • Cercos eléctricos • Instalación de minisplits • Calentadores • Monitoreo 24/7 • Y mucho más',
    direccion: 'Los Pinos No. 112-B, Col. El Cerezo, C.P. 43669, Tulancingo de Bravo, Hidalgo, México',
    tulancingo: '775 130 0335',
    pachuca: '771 219 8250',
    correo: 'gruponerba@hotmail.com',
    logo: '/assets/logo.png',
    // Redes oficiales. Iconos SVG en linea (estilo FontAwesome Brands) para no
    // depender de que la pagina cargue FontAwesome: el pie se inyecta en todas
    // las interfaces y no todas traen esa hoja.
    redes: [
      { nombre: 'TikTok', url: 'https://www.tiktok.com/@grupoempresarialnerba', vista: '0 0 448 512',
        trazo: 'M448,209.9a210.1,210.1,0,0,1-122.8-39.3V349.4A162.6,162.6,0,1,1,185,188.3V278.2a74.6,74.6,0,1,0,52.2,71.2V0l88,0a121.2,121.2,0,0,0,1.9,22.2,122.2,122.2,0,0,0,54.7,82.2,118.5,118.5,0,0,0,66.2,20.1Z' },
      { nombre: 'Instagram', url: 'https://www.instagram.com/grupo_nerba.hgo/', vista: '0 0 448 512',
        trazo: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z' },
      { nombre: 'Facebook', url: 'https://www.facebook.com/GRUPO.NERBA.hgo/', vista: '0 0 320 512',
        trazo: 'M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z' },
    ],
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function ruta(rel) { return rel.charAt(0) === '/' ? rel : '/' + rel; }

  function css() {
    if (document.getElementById('un-pie-css')) return;
    var st = document.createElement('style');
    st.id = 'un-pie-css';
    st.textContent =
      // Aire extra: hay pies que traen padding 0 y el resplandor se salia.
      // El margen lateral va aqui porque al vaciar el pie se perdio el contenedor
      // interno que lo traia, y sin esto el texto se pegaba a los bordes.
      '#un-pie-empresa{width:100%;max-width:1280px;margin-left:auto;margin-right:auto;' +
      'display:flex;flex-direction:column;gap:1.35rem;' +
      'padding:1.15rem clamp(1rem,4vw,2rem) 1.6rem;font-family:Inter,system-ui,sans-serif;' +
      'box-sizing:border-box}' +
      '#un-pie-empresa .un-pe-fila{display:flex;flex-wrap:wrap;align-items:center;gap:1.25rem 2.5rem}' +
      '#un-pie-empresa .un-pe-logo{height:52px;width:auto;max-width:min(50vw,300px);object-fit:contain;flex:0 0 auto}' +
      '#un-pie-empresa .un-pe-bloque{display:flex;flex-direction:column;gap:.3rem;flex:1 1 280px;min-width:240px}' +
      '#un-pie-empresa .un-pe-razon{font-size:15px;font-weight:800;color:#0b1c30;letter-spacing:.02em;text-transform:uppercase;line-height:1.4}' +
      '#un-pie-empresa .un-pe-giro{font-size:13px;color:#475569;line-height:1.7}' +
      '#un-pie-empresa .un-pe-dato{font-size:13px;color:#475569;line-height:1.7;display:flex;align-items:flex-start;gap:.5rem}' +
      '#un-pie-empresa .un-pe-dato i{font-style:normal;flex:0 0 auto;opacity:.7}' +
      '#un-pie-empresa .un-pe-tel{font-weight:800;color:#0b1c30;white-space:nowrap}' +
      '#un-pie-empresa .un-pe-ciudad{font-weight:400;color:#64748b}' +
      '#un-pie-empresa .un-pe-enlace{color:#b0000b;text-decoration:none;overflow-wrap:anywhere}' +
      '#un-pie-empresa .un-pe-enlace:hover{text-decoration:underline}' +
      // Redes: columna compacta que no empuja a los bloques de datos.
      '#un-pie-empresa .un-pe-social{display:flex;flex-direction:column;gap:.55rem;flex:0 0 auto}' +
      '#un-pie-empresa .un-pe-social-titulo{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#64748b}' +
      '#un-pie-empresa .un-pe-social-fila{display:flex;gap:.6rem}' +
      '#un-pie-empresa .un-pe-social-btn{width:38px;height:38px;border-radius:999px;border:1px solid #e2e8f0;background:#fff;' +
      'display:inline-flex;align-items:center;justify-content:center;color:#475569;text-decoration:none;transition:all .18s ease}' +
      '#un-pie-empresa .un-pe-social-btn svg{width:17px;height:17px;fill:currentColor;display:block}' +
      '#un-pie-empresa .un-pe-social-btn:hover{border-color:#b0000b;color:#b0000b;background:#fef2f2;transform:translateY(-1px)}' +
      '#un-pie-legal{padding-top:.4rem;display:flex;flex-wrap:wrap;align-items:center;' +
      'justify-content:space-between;gap:.5rem 1rem;font-size:12.5px;color:#64748b}' +
      '#un-pie-legal nav{display:flex;flex-wrap:wrap;gap:.4rem 1.15rem}' +
      '#un-pie-legal a{color:inherit;text-decoration:none}' +
      '#un-pie-legal a:hover{color:#b0000b;text-decoration:underline}' +
      // Linea roja fina y mate. Sin brillo: el nucleo usa el rojo
      // institucional oscuro y los extremos se van a transparente para que la
      // linea se disuelva en el fondo en vez de cortarse en seco.
      '#un-pie-linea{position:relative;display:block;height:2px;width:100%;margin:1.1rem 0 .65rem;' +
      'border-radius:999px;pointer-events:none;' +
      'background:linear-gradient(90deg,rgba(176,0,11,0) 0%,rgba(176,0,11,.08) 14%,rgba(176,0,11,.28) 32%,rgba(176,0,11,.5) 50%,rgba(176,0,11,.28) 68%,rgba(176,0,11,.08) 86%,rgba(176,0,11,0) 100%);' +
      'box-shadow:0 0 2px rgba(176,0,11,.12)}' +
      '#un-pie-linea::after{content:\'\';position:absolute;left:8%;right:8%;top:50%;height:4px;' +
      'transform:translateY(-50%);border-radius:999px;pointer-events:none;' +
      'background:linear-gradient(90deg,rgba(176,0,11,0) 0%,rgba(176,0,11,.09) 32%,rgba(176,0,11,.15) 50%,rgba(176,0,11,.09) 68%,rgba(176,0,11,0) 100%);' +
      'filter:blur(3px);opacity:.65}' +
      'html.dark-mode #un-pie-empresa .un-pe-razon,html.dark #un-pie-empresa .un-pe-razon,' +
      'html.dark-mode #un-pie-empresa .un-pe-tel,html.dark #un-pie-empresa .un-pe-tel{color:#f1f5f9}' +
      'html.dark-mode #un-pie-empresa .un-pe-giro,html.dark #un-pie-empresa .un-pe-giro,' +
      'html.dark-mode #un-pie-empresa .un-pe-dato,html.dark #un-pie-empresa .un-pe-dato{color:#94a3b8}' +
      'html.dark-mode #un-pie-empresa .un-pe-ciudad,html.dark #un-pie-empresa .un-pe-ciudad{color:#64748b}' +
      'html.dark-mode #un-pie-empresa .un-pe-enlace,html.dark #un-pie-empresa .un-pe-enlace,' +
      'html.dark-mode #un-pie-legal a:hover,html.dark #un-pie-legal a:hover{color:#ff8a80}' +
      'html.dark-mode #un-pie-legal,html.dark #un-pie-legal{color:#94a3b8}' +
      'html.dark-mode #un-pie-empresa .un-pe-social-titulo,html.dark #un-pie-empresa .un-pe-social-titulo{color:#64748b}' +
      'html.dark-mode #un-pie-empresa .un-pe-social-btn,html.dark #un-pie-empresa .un-pe-social-btn{border-color:#334155;background:#0f172a;color:#cbd5e1}' +
      'html.dark-mode #un-pie-empresa .un-pe-social-btn:hover,html.dark #un-pie-empresa .un-pe-social-btn:hover{border-color:#ff8a80;color:#ff8a80;background:rgba(255,138,128,.08)}' +
      'html.dark-mode #un-pie-linea,html.dark #un-pie-linea{opacity:.75}' +
      '@media (max-width:640px){#un-pie-empresa{padding:.75rem clamp(.9rem,5vw,1.25rem) 1rem}' +
      '#un-pie-empresa .un-pe-bloque{min-width:100%}#un-pie-empresa .un-pe-logo{height:38px}}' +
      '@media (prefers-reduced-motion:reduce){#un-pie-linea::after{filter:blur(3px)}}';
    (document.head || document.documentElement).appendChild(st);
  }

  css();

  // Privacidad y terminos ya traen el logo en el header. Con el logo tambien en
  // el pie la pagina muestra la misma insignia dos veces, asi que esas dos
  // interfaces se marcan con data-pie-sin-logo="1" para que aqui no se repita
  // y solo quede la insignia de arriba.
  var sinLogo = document.documentElement.getAttribute('data-pie-sin-logo') === '1';
  var imgLogo = sinLogo ? '' :
    '<img class="un-pe-logo" src="' + esc(DATOS.logo) + '" alt="Logo Grupo NERBA HIDALGO" ' +
    'onerror="this.style.display=\'none\'">';

  // El pie a veces es una fila flex: sin wrap el contenido se aplasta al lado.
  try {
    if (pie.className && /(^|\s)flex(\s|$)/.test(pie.className)) pie.style.flexWrap = 'wrap';
  } catch (e) {}

  // Algunos pies traen padding 0 (registro, privacidad, terminos): sin un
  // minimo, la linea roja y su resplandor se salen por el borde inferior.
  // Se respeta el padding que ya traia si es mayor.
  try {
    var cs = window.getComputedStyle(pie);
    var px = function (v) { return parseFloat(v) || 0; };
    if (px(cs.paddingTop) < 20) pie.style.paddingTop = '1.25rem';
    if (px(cs.paddingBottom) < 40) pie.style.paddingBottom = '2.75rem';
  } catch (e) {}

  // Se vacia el pie: fuera certificaciones, garantias, cifras y promesas.
  while (pie.firstChild) pie.removeChild(pie.firstChild);

  var caja = document.createElement('div');
  caja.id = 'un-pie-empresa';
  caja.setAttribute('role', 'contentinfo');
  // Botones de redes: se arman desde DATOS.redes para que los enlaces vivan
  // en un solo lugar.
  var redesHtml = DATOS.redes.map(function (r) {
    return '<a class="un-pe-social-btn" href="' + esc(r.url) + '" target="_blank" rel="noopener"' +
      ' aria-label="' + esc(r.nombre) + ' de Grupo NERBA HIDALGO">' +
      '<svg viewBox="' + esc(r.vista) + '" aria-hidden="true"><path d="' + esc(r.trazo) + '"/></svg></a>';
  }).join('');
  caja.innerHTML =
    '<div class="un-pe-fila">' +
    imgLogo +
    '<div class="un-pe-bloque">' +
    '<span class="un-pe-razon">' + esc(DATOS.razon) + '</span>' +
    '<span class="un-pe-giro">' + esc(DATOS.giro) + '</span>' +
    '</div>' +
    '<div class="un-pe-bloque">' +
    '<span class="un-pe-dato"><i aria-hidden="true">📍</i><span>' + esc(DATOS.direccion) + '</span></span>' +
    '<span class="un-pe-dato"><i aria-hidden="true">☎</i><span class="un-pe-tel">' + esc(DATOS.tulancingo) +
    ' <span class="un-pe-ciudad">Tulancingo</span> &nbsp;|&nbsp; ' + esc(DATOS.pachuca) +
    ' <span class="un-pe-ciudad">Pachuca</span></span></span>' +
    '<span class="un-pe-dato"><i aria-hidden="true">✉</i><a class="un-pe-enlace" href="mailto:' +
    esc(DATOS.correo) + '">' + esc(DATOS.correo) + '</a></span>' +
    '</div>' +
    '<div class="un-pe-social">' +
    '<span class="un-pe-social-titulo">Síguenos</span>' +
    '<span class="un-pe-social-fila">' + redesHtml + '</span>' +
    '</div></div>' +
    '<div id="un-pie-legal">' +
    '<span>© ' + esc(DATOS.razon) + '</span>' +
    '<nav>' +
    '<a href="' + ruta('privacidad.html') + '">Aviso de privacidad</a>' +
    '<a href="' + ruta('terminos.html') + '">Términos y condiciones</a>' +
    '</nav></div>' +
    '<span id="un-pie-linea" aria-hidden="true"></span>';
  pie.appendChild(caja);
})();
