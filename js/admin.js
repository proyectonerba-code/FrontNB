/* Grupo NERBA HIDALGO - Cableado de las vistas staff (/admin/).
   Las interfaces son los disenos del simulador tal cual; aqui solo se conectan
   datos reales, sesion y guardias. Deteccion automatica por pagina. */
(function () {
  var isElec = /^\/electronica\//.test(location.pathname);
  var BASE = isElec ? '/electronica' : '/admin';
  if (!/^\/admin\//.test(location.pathname) && !isElec) return;
  /* Visor de las fotos adjuntas. Va aqui, bien arriba del archivo, y no mas
     abajo: cada bloque de pagina termina con su propio `return`, asi que lo que
     se defina despues de uno de esos return nunca llega a ejecutarse.
     El diseño original traia un modal de zoom que solo mostrava un ícono de
     imagen y el nombre del archivo: el personal nunca veía la foto real. Este
     visor abre TODAS las que subió el cliente (hasta 20 en Proyecto Especial)
     y se construye desde JS porque admin.js lo comparten varias paginas y cada
     una trae su propio modal-stub. */
  var GALERIA_ID = 'nb-galeria-fotos';
  window.abrirGaleriaFotos = function (folio, fotos) {
    var lista = (Array.isArray(fotos) ? fotos : []).filter(function (s) {
      return typeof s === 'string' && s.indexOf('data:image/') === 0;
    });
    if (!lista.length) return;
    var viejo = document.getElementById(GALERIA_ID);
    if (viejo) viejo.remove();
    var d = document.createElement('div');
    d.id = GALERIA_ID;
    d.className = 'fixed inset-0 z-[200] overflow-y-auto p-4 sm:p-8';
    d.style.background = 'rgba(2,6,23,.92)';
    d.innerHTML =
      '<div class="flex items-start justify-between gap-4 mb-5">' +
        '<div><h3 style="color:#fff;font-weight:800;font-size:15px">Fotografías adjuntas</h3>' +
        '<p style="color:#94a3b8;font-size:11.5px;margin-top:2px">' + lista.length +
        (lista.length === 1 ? ' imagen · ' : ' imágenes · ') +
        String(folio || '').replace(/[<>&]/g, '') + '</p></div>' +
        '<button type="button" data-cerrar style="color:#cbd5e1;background:#1e293b;border:1px solid #334155;' +
        'border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer">Cerrar (Esc)</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">' +
      lista.map(function (s, i) {
        return '<figure style="margin:0;background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:8px">' +
          '<img src="' + s + '" alt="Fotografía ' + (i + 1) + '" ' +
          'style="width:100%;height:190px;object-fit:cover;border-radius:6px;display:block">' +
          '<figcaption style="color:#94a3b8;font-size:10px;text-align:center;padding-top:6px">Foto ' +
          (i + 1) + ' de ' + lista.length + '</figcaption></figure>';
      }).join('') + '</div>';
    document.body.appendChild(d);
    document.body.style.overflow = 'hidden';
    d.addEventListener('click', function (e) {
      if (e.target === d || (e.target.closest && e.target.closest('[data-cerrar]'))) window.cerrarGaleriaFotos();
    });
  };
  window.cerrarGaleriaFotos = function () {
    var v = document.getElementById(GALERIA_ID);
    if (v) v.remove();
    document.body.style.overflow = '';
  };
  // Escape cierra el visor. Va aqui porque el manejador general de modales que
  // hay mas abajo esta despues de un return y nunca corre en esta pagina.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById(GALERIA_ID)) window.cerrarGaleriaFotos();
  });

  if (isElec) { if (!UN.requireElec(BASE + '/catalogo.html')) return; }
  else if (!UN.requireStaff(BASE + '/catalogo.html')) return;
  UN.rewriteLinks();
  var user = UN.getUser() || {};
  var esc = UN.esc;
  try { ensureAdminHeader(); } catch (e) { /* header original como respaldo */ }
  // En zona electrónica, los data-path de admin apuntan a su espejo.
  if (isElec) {
    try {
      var ZMAP = { 'admin-catalogo': '/electronica/catalogo.html', 'admin-cotizaciones': '/electronica/cotizaciones.html', 'admin-perfil': '/electronica/perfil.html', 'admin-panel': '/electronica/cotizaciones.html' };
      Object.keys(ZMAP).forEach(function (dp) {
        Array.prototype.slice.call(document.querySelectorAll('[data-path="' + dp + '"]')).forEach(function (a) { a.setAttribute('href', ZMAP[dp]); });
      });
    } catch (e) {}
  }
  // Links del pie por zona (el header ya es único). Solo href="#" sin data-path.
  try {
    Array.prototype.slice.call(document.querySelectorAll('footer a')).forEach(function (a) {
      if ((a.getAttribute('href') || '') !== '#' || a.getAttribute('data-path')) return;
      var t = ((a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase());
      function set(h) { a.setAttribute('href', h); }
      if (t.indexOf('cotizaciones recibidas') >= 0 || t.indexOf('expedientes') >= 0 || t.indexOf('inspecciones') >= 0) set(BASE + '/cotizaciones.html');
      else if (t.indexOf('catálogo') >= 0 || t.indexOf('catalogo') >= 0 || t.indexOf('equipos') >= 0) set(BASE + '/catalogo.html');
      else if (t.indexOf('mantenimiento') >= 0) set(isElec ? BASE + '/historial.html' : BASE + '/mantenimiento.html');
    });
  } catch (e) {}
  function q(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n'); }

  function setName(root, names) {
    if (!root || !user.nombre) return;
    names.forEach(function (n) {
      root.innerHTML = root.innerHTML.split(n).join(esc(user.nombre));
    });
  }

  function ensureAdminHeader() {
    // Header único global: mismo estilo en todos los roles (zona admin o electrónica).
    if (window.UN && UN.ensureMenu) UN.ensureMenu(isElec ? 'electronica' : 'admin');
  }


  /* ================= COTIZACIONES RECIBIDAS ================= */
  var tbody = document.querySelector('tbody');
  var buscador = document.getElementById('buscador');
  // El tbody solo se oculta si esta pagina es la de cotizaciones, que es la unica
  // que lo vuelve a mostrar en load(). Sin esta condicion, en mantenimiento.html
  // (que no tiene #buscador) el tbody quedaba oculto para siempre y las filas se
  // pintaban sin verse nunca.
  if (tbody && buscador) tbody.style.display = 'none';
  if (tbody && buscador && typeof abrirModalRespuesta === 'function') {
    (function () {
      var els = document.querySelectorAll('header div');
      for (var i = els.length - 1; i >= 0; i--) {
        if (els[i].querySelector('nav')) continue;
        if (els[i].closest('nav')) continue;
        if (/ADMINISTRADOR/i.test(els[i].textContent) && els[i].querySelector('img')) {
          setName(els[i], ['Carlos Mendoza', 'Ing. Carlos Mendoza']);
          UN.profileMenu(els[i], BASE + '/perfil.html');
          break;
        }
      }
    })();
    var QUOTES = {};
    var MESES = { '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic' };
    function fechaCorta(iso) {
      var p = String(iso || '').split('-');
      return (p[2] || '') + ' ' + (MESES[p[1]] || '') + ' ' + (p[0] || '');
    }
    function setBadge(cell, estado) {
      estado = String(estado || 'PENDIENTE').toUpperCase();
      var map = {
        APROBADA: ['bg-emerald-100 text-emerald-800 border-emerald-200', 'bg-emerald-500', 'Evaluación Aprobada'],
        RECHAZADA: ['bg-slate-200 text-slate-600 border-slate-300', 'bg-slate-400', 'Rechazada'],
        PENDIENTE: ['bg-amber-100 text-amber-800 border-amber-200', 'bg-amber-500', 'Pendiente Inspección'],
      };
      var m = map[estado] || map.PENDIENTE;
      var dot = cell.querySelector('.flex.items-center > span');
      if (dot) dot.className = 'w-2.5 h-2.5 rounded-full ' + (estado === 'APROBADA' ? 'bg-emerald-500' : (estado === 'RECHAZADA' ? 'bg-slate-400' : 'bg-amber-500'));
      var badge = null;
      cell.querySelectorAll('span').forEach(function (s) {
        if (!badge && /Pendiente|Aprobada|Rechazada|Evaluaci/.test(s.textContent)) badge = s;
      });
      if (badge) {
        badge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1.5 ' + m[0];
        badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full mr-1 ' + m[1] + '"></span>' + m[2];
      }
    }
    // Pinta las miniaturas de una fila. Se separa del llenado para poder reutilizarla
// cuando las fotos llegan despues (la lista ya no las trae).
function pintaFotosEnFila(celda, folio, fotos) {
  celda.innerHTML = '';
  var tira = document.createElement('div');
  tira.className = 'flex flex-wrap gap-1.5';
  // Solo 5 miniaturas para que la fila no crezca, pero el clic abre el
  // visor con TODAS (en Proyecto Especial son hasta 20).
  fotos.slice(0, 5).forEach(function (src) {
    var c = document.createElement('div');
    c.className = 'w-12';
    var im = document.createElement('img');
    im.src = src;
    im.alt = 'Fotografía adjunta';
    im.className = 'w-12 h-12 rounded-md object-cover border border-slate-200 cursor-zoom-in';
    im.style.objectFit = 'cover';
    im.addEventListener('click', function () { abrirGaleriaFotos(folio, fotos); });
    c.appendChild(im);
    tira.appendChild(c);
  });
  celda.appendChild(tira);
  var mas = document.createElement('button');
  mas.type = 'button';
  mas.className = 'text-[10px] font-semibold text-brand-700 hover:text-brand-800 underline mt-1 text-left';
  mas.textContent = fotos.length + (fotos.length === 1 ? ' foto adjunta' : ' fotos adjuntas') + ' · ver todas';
  mas.addEventListener('click', function () { abrirGaleriaFotos(folio, fotos); });
  celda.appendChild(mas);
}

// Pide las fotos de UNA cotizacion. Se cachean para no volver a pedirlas si la
// fila se vuelve a pintar.
var FOTOS_CACHE = {};
// La fila pudo haberse reordenado o filtrado mientras cargaba: se busca de nuevo
// su celda de fotos antes de pintar.
function destinoDeFila(folio, celda) {
  var tr = document.querySelector('tr[data-folio="' + folio + '"]');
  return (tr && tr.children[3]) ? tr.children[3] : celda;
}
function cargarFotosDeFila(folio, celda) {
  if (!folio || !celda) return;
  if (FOTOS_CACHE[folio]) {
    if (FOTOS_CACHE[folio].length) pintaFotosEnFila(celda, folio, FOTOS_CACHE[folio]);
    return;
  }
  if (typeof UN === 'undefined' || !UN.api) return;
  UN.api('/api/cotizaciones/' + encodeURIComponent(folio)).then(function (c) {
    // Con las fotos archivadas el registro llega sin imagenes: se piden al
    // archivo. Si no, la fila diria "Sin fotos adjuntas" cuando si las tiene.
    if (c && c.fotosArchivadas && !(Array.isArray(c.fotos) && c.fotos.length)) {
      return UN.api('/api/archivo/fotos/' + encodeURIComponent(folio)).then(function (a) {
        pintarFotosEnFila(destinoDeFila(folio, celda), folio, (a && a.fotos) || []);
      }).catch(function () { pintaFotosEnFila(destinoDeFila(folio, celda), folio, []); });
    }
    var fotos = Array.isArray(c.fotos) ? c.fotos.filter(function (f) {
      return typeof f === 'string' && f.indexOf('data:image/') === 0;
    }) : [];
    FOTOS_CACHE[folio] = fotos;
    // La fila pudo haberse cambiado mientras cargaba.
    var destino = destinoDeFila(folio, celda);
    if (fotos.length) pintaFotosEnFila(destino, folio, fotos);
    else {
      destino.innerHTML = '';
      var note = document.createElement('p');
      note.className = 'text-[10px] text-slate-400 italic';
      note.textContent = 'Sin fotos adjuntas.';
      destino.appendChild(note);
    }
  }).catch(function () {
    celda.innerHTML = '';
    var note = document.createElement('p');
    note.className = 'text-[10px] text-slate-400 italic';
    note.textContent = 'No se pudieron cargar las fotos.';
    celda.appendChild(note);
  });
}

function fillRow(tr, c) {
      c.estado = String(c.estado || 'PENDIENTE').toUpperCase();
      tr.setAttribute('data-estado', c.estado);
      tr.setAttribute('data-folio', c.folio);
      tr.className = tr.className.replace(/bg-(amber|emerald)-50\/15/g, '').trim();
      if (c.estado === 'PENDIENTE') tr.classList.add('bg-amber-50/15');
      if (c.estado === 'APROBADA') tr.classList.add('bg-emerald-50/15');
      var tds = tr.children;
      var folioEl = tds[0].querySelector('span.font-mono');
      if (folioEl) folioEl.textContent = c.folio;
      // Referencia para los manejadores de foto que se crean más abajo.
      tr.setAttribute('data-folio-fotos', c.folio);
      var fechaEl = tds[0].querySelector('div.text-slate-500');
      if (fechaEl) fechaEl.textContent = fechaCorta(c.fecha);
      setBadge(tds[0], c.estado);
      // La fila se clona de una plantilla del diseño que todavía trae textos de
      // ejemplo de otro país (Mendoza, "+51 (01) 456-7890", "Ref: a dos cuadras
      // del CC El Polo"). Aquí se pisan TODAS las celdas con lo que trae la
      // cotización, porque lo que no se pisa se queda viendo en cada fila real.
      var soloLectura = tds[0].querySelector('span.block');
      if (soloLectura) soloLectura.textContent = 'Solo lectura';
      var cells1 = tds[1].querySelectorAll('div');
      if (cells1[0]) cells1[0].textContent = c.nombre || '-';
      cells1.forEach(function (d) {
        if (/^\+[\d\s()+-]+$/.test(d.textContent.trim()) && d.querySelector('svg')) {
          d.childNodes.forEach(function (n) { if (n.nodeType === 3) n.nodeValue = ' ' + (c.telefono || 'Sin teléfono'); });
        }
        if (/@/.test(d.textContent)) d.textContent = c.email || '-';
        // "Cliente Verificado" y el teléfono secundario venía en la plantilla.
        if (/^Cliente Verificado$/i.test(d.textContent.trim())) d.textContent = '';
        if (/^Sec:/.test(d.textContent.trim())) d.textContent = c.telefonoSec ? 'Sec: ' + c.telefonoSec : '';
      });
      // El orden de los div de esta celda es: chip, dirección, distrito y referencia.
      // Antes se escribía el tipo de inmueble en el div de la dirección (todo
      // corrido una posición) y la referencia de ejemplo se quedaba siempre.
      var tds2 = tds[2].querySelectorAll('div');
      if (tds2[0]) {
        var icoChip = tds2[0].querySelector('svg');
        tds2[0].textContent = c.tipoInmueble || c.area || 'Proyecto';
        if (icoChip) tds2[0].insertBefore(icoChip, tds2[0].firstChild);
      }
      if (tds2[1]) tds2[1].textContent = c.direccion || '-';
      if (tds2[2]) tds2[2].textContent = c.distrito || '';
      if (tds2[3]) {
        var ref = String(c.referencia || '').trim();
        if (ref) {
          tds2[3].style.display = '';
          var etiquetaRef = tds2[3].querySelector('span');
          tds2[3].textContent = '';
          if (etiquetaRef) tds2[3].appendChild(etiquetaRef);
          tds2[3].appendChild(document.createTextNode(' ' + ref));
        } else {
          // Sin referencia no solo se oculta: tambien se vacia, para que el
          // texto de ejemplo no quede ahi dentro.
          tds2[3].style.display = 'none';
          tds2[3].textContent = '';
        }
      }
      var tds3 = tds[3];
      if (tds3) {
        // La fila se clona de una plantilla que todavia trae los textos de
        // ejemplo del diseño: "3 FOTOS", "Nítidas" y las miniaturas "Fachada",
        // "Muro Post" y "Cochera". Por eso se veian fotos que el cliente nunca
        // subio, junto a la suya. Aqui se vacia la celda completa y se pinta
        // solo con lo que trae la cotizacion.
        tds3.innerHTML = '';
        var fotos = Array.isArray(c.fotos) ? c.fotos.filter(function (f) {
          return typeof f === 'string' && f.indexOf('data:image/') === 0;
        }) : [];
        var cuantas = fotos.length || Number(c.fotosN || 0);
        if (fotos.length) {
          pintaFotosEnFila(tds3, c.folio, fotos);
        } else if (cuantas) {
          // La lista ya no trae las fotos (solo el numero): se piden cuando la
          // fila entra en pantalla. Antes cada refresco del panel se descargaba
          // TODAS las fotos de TODAS las cotizaciones.
          var aviso = document.createElement('p');
          aviso.className = 'text-[10px] text-slate-400 italic';
          aviso.textContent = 'Cargando ' + cuantas + (cuantas === 1 ? ' foto…' : ' fotos…');
          tds3.appendChild(aviso);
          cargarFotosDeFila(c.folio, tds3);
        } else {
          var note = document.createElement('p');
          note.className = 'text-[10px] text-slate-400 italic';
          note.textContent = 'Sin fotos adjuntas.';
          tds3.appendChild(note);
        }
      }
      var reqBox = tds[4].querySelector('div.bg-slate-50');
      if (reqBox) {
        reqBox.innerHTML = '';
        (String(c.descripcion || 'Sin detalle.').split('\n')).forEach(function (ln, i) {
          if (i > 0) reqBox.appendChild(document.createElement('br'));
          reqBox.appendChild(document.createTextNode(ln));
        });
      }
      var btns = tds[5] ? tds[5].querySelectorAll('button[onclick]') : [];
      btns.forEach(function (b) {
        var o = b.getAttribute('onclick') || '';
        var label = (b.textContent || '').trim();
        if (/^(Estatus de la solicitud|Cambiar Estado|Coordinar Visita|Agendar Inspección|Dar Respuesta)$/i.test(label)) b.setAttribute('data-role', 'status');
        if (o.indexOf('abrirModalPdfOficial(') === 0) {
          b.setAttribute('data-role', 'pdf');
          b.setAttribute('onclick', "abrirModalPdfOficial('" + q(c.folio) + "', '" + q(c.nombre) + "', '" + q(c.tipoInmueble) + "', '" + q(c.direccion) + "', '" + q(c.telefono) + "', '" + q(c.email) + "')");
        } else if (o.indexOf('abrirModalRespuesta(') === 0) {
          b.setAttribute('data-role', /whatsapp/i.test(label) ? 'whatsapp' : (/^(Estatus de la solicitud|Cambiar Estado|Coordinar Visita|Agendar Inspección|Dar Respuesta)$/i.test(label) ? 'status' : 'respuesta'));
          b.setAttribute('onclick', "abrirModalRespuesta('" + q(c.nombre) + "', '" + q(c.folio) + "', '" + q(c.telefono) + "', '" + q(c.descripcion) + "', '" + q(c.tipoInmueble) + "')");
        } else if (o.indexOf('eliminarCotizacion(') === 0) {
          b.setAttribute('data-role', 'eliminar');
          b.setAttribute('onclick', "eliminarCotizacion('" + q(c.folio) + "')");
        }
      });
      convertirEstatus(tr, c);
    }
    function convertirEstatus(tr, c) {
      var action = tr.children[5];
      if (!action) return;
      var btn = tr.querySelector('button[data-estatus-control]');
      if (!btn) {
        var buttons = action.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
          var candidate = buttons[i];
          var text = (candidate.textContent || '').trim();
          var onclick = candidate.getAttribute('onclick') || '';
          if (candidate.getAttribute('data-role') === 'status' || (!/whatsapp/i.test(text) && /^(Coordinar Visita|Agendar Inspección|Dar Respuesta|Estatus de la solicitud|Cambiar Estado)$/i.test(text))) {
            btn = candidate;
            break;
          }
        }
        if (!btn) {
          for (var j = 0; j < buttons.length; j++) {
            var fallback = buttons[j];
            var fallbackText = (fallback.textContent || '').trim();
            var fallbackOnclick = fallback.getAttribute('onclick') || '';
            if (fallbackOnclick.indexOf('abrirModalRespuesta(') === 0 && !/whatsapp/i.test(fallbackText)) {
              btn = fallback;
              break;
            }
          }
        }
      }
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        action.appendChild(btn);
      }
      btn.type = 'button';
      btn.className = 'w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] border border-slate-200 transition whitespace-nowrap';
      btn.setAttribute('data-role', 'status');
      btn.setAttribute('data-estatus-control', '1');
      btn.setAttribute('data-folio', c.folio);
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.removeAttribute('onclick');
      btn.textContent = 'Estatus de la solicitud';
      if (btn._unEst) return;
      btn._unEst = true;
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        toggleEstMenu(btn, QUOTES[c.folio] || c);
      });
    }
    var __estMenu = null;
    var __estCloser = null;
    function closeEstMenu() {
      if (__estMenu && __estMenu.parentNode) __estMenu.parentNode.removeChild(__estMenu);
      __estMenu = null;
      if (__estCloser) document.removeEventListener('click', __estCloser);
      __estCloser = null;
    }
    function toggleEstMenu(btn, c) {
      closeEstMenu();
      c = QUOTES[c.folio] || c;
      c.estado = String(c.estado || 'PENDIENTE').toUpperCase();
      var m = document.createElement('div');
      m.className = 'fixed z-[100] w-56 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden';
      m.setAttribute('role', 'menu');
      m.innerHTML = '<p class="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Estatus de ' + esc(c.folio) + '</p>' +
        ['PENDIENTE', 'APROBADA', 'RECHAZADA'].map(function (e) {
          var dot = e === 'APROBADA' ? 'bg-emerald-500' : (e === 'RECHAZADA' ? 'bg-slate-400' : 'bg-amber-500');
          var mark = e === c.estado ? ' ✓' : '';
          var label = e === 'PENDIENTE' ? 'Pendiente' : (e === 'APROBADA' ? 'Aprobada' : 'Rechazada');
          return '<button type="button" data-est="' + e + '" class="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">' +
            '<span class="w-2 h-2 rounded-full ' + dot + '"></span>' + label + mark + '</button>';
        }).join('');
      document.body.appendChild(m);
      var r = btn.getBoundingClientRect();
      var top = r.bottom + 6;
      if (top + m.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - m.offsetHeight - 6);
      m.style.top = top + 'px';
      m.style.left = Math.max(8, Math.min(window.innerWidth - m.offsetWidth - 8, r.left)) + 'px';
      __estMenu = m;
      btn.setAttribute('aria-expanded', 'true');
      m.querySelectorAll('[data-est]').forEach(function (op) {
        op.addEventListener('click', async function () {
          var est = op.getAttribute('data-est');
          closeEstMenu();
          try {
            var upd = await UN.api('/api/cotizaciones/' + encodeURIComponent(c.folio) + '/estado', { method: 'PUT', body: { estado: est } });
            upd.estado = String(upd.estado || est).toUpperCase();
            QUOTES[c.folio] = upd;
            var tr = btn.closest('tr');
            if (tr) fillRow(tr, upd);
            recount();
            if (typeof mostrarToast === 'function') mostrarToast('Estatus actualizado a ' + est.charAt(0) + est.slice(1).toLowerCase() + '.', 'emerald');
          } catch (err) {
            if (typeof mostrarToast === 'function') mostrarToast(err.message || 'No se pudo actualizar el estatus.', 'red');
            else aviso(err.message);
          }
        });
      });
      __estCloser = function (ev) {
        if (__estMenu && !__estMenu.contains(ev.target) && !btn.contains(ev.target)) closeEstMenu();
      };
      setTimeout(function () { document.addEventListener('click', __estCloser); }, 0);
    }
    function recount() {
      var arr = Object.keys(QUOTES).map(function (k) { return QUOTES[k]; });
      var ap = arr.filter(function (x) { return x.estado === 'APROBADA'; }).length;
      var pe = arr.filter(function (x) { return x.estado === 'PENDIENTE'; }).length;
      var re = arr.filter(function (x) { return x.estado === 'RECHAZADA'; }).length;
      document.querySelectorAll('button').forEach(function (b) {
        var t = b.textContent.trim().toLowerCase();
        if (t.indexOf('pendiente') === 0) b.textContent = 'Pendientes (' + pe + ')';
        else if (t.indexOf('rechazada') === 0 || t.indexOf('respondida') === 0) b.textContent = 'Rechazadas (' + re + ')';
        else if (t.indexOf('aprobada') === 0) b.textContent = 'Aprobadas (' + ap + ')';
        else if (t.indexOf('todas') === 0) b.textContent = 'Todas (' + arr.length + ')';
      });
    }
    function paintStats(o) {
      var holder = document.getElementById('admin-stats');
      if (!holder) return;
      var cards = [
        ['description', 'Total recibidas', o.cotizaciones],
        ['pending', 'Pendientes', o.pendientes],
        ['verified', 'Aprobadas', o.aprobadas],
        ['group', 'Usuarios', o.usuarios],
      ];
      holder.innerHTML = cards.map(function (c) {
        var icons = {
          description: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
          pending: '<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
          verified: '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
          group: '<path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>'
        };
        return '<div class="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">' +
          '<span class="w-11 h-11 rounded-xl grid place-items-center shrink-0" style="background:rgba(217,27,27,.1)"><svg class="w-6 h-6 text-[#d91b1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (icons[c[0]] || icons.description) + '</svg></span>' +
          '<div><p class="text-2xl font-extrabold leading-none">' + c[2] + '</p>' +
          '<p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">' + c[1] + '</p></div></div>';
      }).join('');
    }
    function paintFilters(o) {
      o = o || {};
      var btns = Array.prototype.slice.call(document.querySelectorAll('button')).filter(function (b) {
        return /^(todos|pendientes|respondidas|aprobadas|rechazadas)/i.test(b.textContent.trim());
      });
      var ACTIVE = 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm transition';
      var rech = Object.keys(QUOTES).filter(function (k) { return QUOTES[k].estado === 'RECHAZADA'; }).length;
      btns.forEach(function (b) {
        if (!b._unCls) b._unCls = b.className;
        var t = b.textContent.trim().toLowerCase();
        var label = t.indexOf('pendiente') === 0 ? 'Pendientes' : (t.indexOf('aprobada') === 0 ? 'Aprobadas' : (t.indexOf('respondida') === 0 || t.indexOf('rechazada') === 0 ? 'Rechazadas' : 'Todas'));
        var n = label === 'Todas' ? (o.cotizaciones == null ? Object.keys(QUOTES).length : o.cotizaciones) : (label === 'Pendientes' ? (o.pendientes == null ? Object.keys(QUOTES).filter(function (k) { return QUOTES[k].estado === 'PENDIENTE'; }).length : o.pendientes) : (label === 'Aprobadas' ? (o.aprobadas == null ? Object.keys(QUOTES).filter(function (k) { return QUOTES[k].estado === 'APROBADA'; }).length : o.aprobadas) : rech));
        var mode = label === 'Todas' ? 'todas' : (label === 'Pendientes' ? 'PENDIENTE' : (label === 'Aprobadas' ? 'APROBADA' : 'RECHAZADA'));
        b.textContent = label + ' (' + n + ')';
        if (b.className.indexOf('bg-slate-900') < 0) b.className = b._unCls;
        b.onclick = function () {
          tbody.querySelectorAll('tr[data-folio]').forEach(function (r) {
            var est = r.getAttribute('data-estado') || '';
            var show = (mode === 'todas' || est === mode);
            r.dataset.quoteMatch = show ? '1' : '0';
            r.style.display = show ? '' : 'none';
          });
          btns.forEach(function (x) { x.className = x._unCls; });
          b.className = ACTIVE;
        };
      });
      paintQuotePager();
    }
    var quotePage = 1;
    function paintQuotePager() {
      var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr[data-folio]'));
      rows.forEach(function (row) { if (row.dataset.quoteMatch == null) row.dataset.quoteMatch = '1'; });
      var matches = rows.filter(function (row) { return row.dataset.quoteMatch === '1'; });
      var pageSize = 10;
      var pages = matches.length ? Math.ceil(matches.length / pageSize) : 0;
      quotePage = Math.min(Math.max(1, quotePage), pages || 1);
      var start = (quotePage - 1) * pageSize;
      matches.forEach(function (row, index) { row.style.display = index >= start && index < start + pageSize ? '' : 'none'; });
      var label = document.getElementById('quote-pager-label');
      if (label) label.textContent = matches.length ? 'Mostrando ' + (start + 1) + ' a ' + Math.min(matches.length, start + pageSize) + ' de ' + matches.length + ' cotizaciones recibidas' : 'Mostrando 0 cotizaciones recibidas';
      var pager = document.getElementById('quote-pagination');
      if (!pager) return;
      pager.innerHTML = '';
      if (!pages) return;
      function add(labelText, target, disabled) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = labelText;
        button.className = 'px-3 py-1.5 rounded-lg ' + (target === quotePage ? 'bg-brand-600 text-white font-bold' : 'border border-slate-200 bg-white text-slate-600') + (disabled ? ' opacity-40 cursor-not-allowed' : '');
        button.disabled = !!disabled;
        if (!disabled) button.addEventListener('click', function () { quotePage = target; paintQuotePager(); });
        pager.appendChild(button);
      }
      add('Anterior', quotePage - 1, quotePage <= 1);
      for (var n = 1; n <= pages; n++) add(String(n), n, false);
      add('Siguiente', quotePage + 1, quotePage >= pages);
    }
    async function load() {
      var lista;
      try {
        lista = await UN.api('/api/cotizaciones');
        if (isElec) lista = (lista || []).filter(function (c) { return c.area === 'PRODUCTOS_ELECTRONICOS' || c.tipoInmueble === 'Productos Electrónicos'; });
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-sm text-red-700">No se pudieron cargar las cotizaciones. Verifica la sesión del administrador.</td></tr>';
        throw e;
      }
      var ov = { cotizaciones: lista.length, pendientes: 0, aprobadas: 0, usuarios: 0 };
      try {
        ov = await UN.api('/api/admin/overview');
      } catch (e) {}
      for (var k2 in QUOTES) delete QUOTES[k2];
      lista.forEach(function (c) { QUOTES[c.folio] = c; });
      var tpl = Array.prototype.slice.call(tbody.querySelectorAll('tr')).filter(function (row) { return row.children.length >= 6; })[0];
      tbody.innerHTML = '';
      if (!tpl) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-sm text-slate-500">Sin cotizaciones recibidas.</td></tr>';
      } else if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-sm text-slate-500">Sin cotizaciones recibidas.</td></tr>';
      } else {
        lista.forEach(function (c) {
          var tr = tpl.cloneNode(true);
          fillRow(tr, c);
          tbody.appendChild(tr);
        });
       }
       tbody.style.display = '';
       paintStats(ov);
       paintFilters(ov);
       paintQuotePager();
     }
    window.abrirEstatusCotizacion = async function (folio) {
      var btn = document.querySelector('tr[data-folio="' + folio + '"] button[data-estatus-control]');
      if (!btn) {
        var rows = Array.prototype.slice.call(document.querySelectorAll('tbody tr'));
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].textContent.indexOf(folio) < 0) continue;
          btn = Array.prototype.slice.call(rows[i].querySelectorAll('button')).filter(function (b) {
            return (b.textContent || '').trim() === 'Estatus de la solicitud';
          })[0];
          if (btn) break;
        }
      }
      if (!btn) return;
      var c = QUOTES[folio];
      if (!c) {
        try { c = await UN.api('/api/cotizaciones/' + encodeURIComponent(folio)); QUOTES[folio] = c; }
        catch (e) { if (typeof mostrarToast === 'function') mostrarToast(e.message || 'No se encontró la cotización.', 'red'); return; }
      }
      btn.setAttribute('data-estatus-control', '1');
      toggleEstMenu(btn, c);
    };
    tbody.addEventListener('click', function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (!b || b._unEst || b.getAttribute('data-estatus-control') !== '1') return;
      var tr = b.closest('tr');
      var folio = tr && (tr.getAttribute('data-folio') || (tr.textContent.match(/COT-[A-Z0-9-]+/i) || [])[0]);
      if (!folio) return;
      ev.preventDefault();
      ev.stopPropagation();
      window.abrirEstatusCotizacion(folio);
    }, true);
    window.descargarPDF = function (folio) {
      var c = QUOTES[folio];
      if (!c) { aviso('Folio no encontrado en esta sesión.'); return; }
      // Cierra el modal del expediente primero: una sola ventana (print tab directo, sin visor encima)
      if (typeof cerrarModalPdfOficial === 'function') { try { cerrarModalPdfOficial(); } catch (e) {} }
      UN.downloadQuote(c);
    };
    // Borrar para el personal ya no se lleva la cotizacion del cliente: el backend
// la oculta solo del panel del personal. Por eso el aviso lo dice, para que
// nadie dude de si el cliente pierde su documento.
window.eliminarCotizacion = async function (folio) {
      var c = QUOTES[folio];
      var ok = await UN.confirmarEnvio({
        titulo: 'Quitar del panel la cotizacion ' + folio,
        lineas: [
          c ? 'Cliente: ' + (c.nombre || '-') : 'Folio: ' + folio,
          'Deja de aparecer en la bandeja del personal.',
          'El cliente sigue viendo y descargando su cotizacion.',
          c && c.ocultaCliente ? 'Ojo: el cliente ya la habia ocultado en su cuenta.' : '',
        ].filter(Boolean),
        boton: 'Si, quitar del panel'
      });
      if (!ok) return;
      try {
        await UN.api('/api/cotizaciones/' + encodeURIComponent(folio), { method: 'DELETE', body: {} });
        delete QUOTES[folio];
        var tr = document.querySelector('tbody tr[data-folio="' + folio + '"]');
        if (tr && tr.parentNode) tr.parentNode.removeChild(tr);
        recount();
        if (typeof mostrarToast === 'function') mostrarToast('Cotizacion ' + folio + ' quitada del panel. El cliente la sigue viendo.', 'emerald');
      } catch (err) { aviso(err.message); }
    };
    window.actualizarLista = function () {
      load().then(function () { mostrarToast('Bandeja sincronizada con la central.', 'emerald'); }).catch(function (e) { aviso(e.message); });
    };
    window.exportarReporte = function () {
      var filas = Object.keys(QUOTES).map(function (k) {
        var c = QUOTES[k];
        return [c.folio, c.fecha, c.nombre, c.email, c.telefono, c.tipoInmueble, c.direccion, c.producto, c.estado];
      });
      if (!filas.length) { mostrarToast('No hay cotizaciones para exportar.', 'emerald'); return; }
      var ok = (window.EXCEL ? EXCEL.descargar({
        nombre: 'grupo_nerba_hidalgo_cotizaciones',
        hoja: 'Cotizaciones',
        titulo: 'Cotizaciones · Grupo Nerba Hidalgo',
        columnas: [
          { titulo: 'FOLIO', ancho: 21 },
          { titulo: 'FECHA', ancho: 12, tipo: 'fecha' },
          { titulo: 'CLIENTE', ancho: 26 },
          { titulo: 'EMAIL', ancho: 28 },
          { titulo: 'TELEFONO', ancho: 15 },
          { titulo: 'INMUEBLE', ancho: 18 },
          { titulo: 'DIRECCION', ancho: 32 },
          { titulo: 'PRODUCTO', ancho: 26 },
          { titulo: 'ESTADO', ancho: 14, tipo: 'estado' }
        ],
        filas: filas
      }) : false);
      mostrarToast(ok ? 'Excel descargado con ' + filas.length + ' cotizaciones.' : 'No se pudo generar el Excel.', 'emerald');
    };
    load().catch(function (e) { aviso(e.message); });
    return;
  }

  /* Anti-bloqueo de scroll: Escape cierra cualquier modal admin y libera el scroll.
     Red de seguridad por si algun flujo deja el overflow trabado. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    // El visor de fotos se cierra primero: es el que se abre encima de todo.
    if (document.getElementById(GALERIA_ID)) { window.cerrarGaleriaFotos(); return; }
    ['product-admin-modal', 'delete-confirm-modal', 'product-detail-modal',
     'modal-respuesta', 'modal-pdf-oficial', 'modal-foto-preview', 'modal-mantenimiento'].forEach(function (id) {
      var m = document.getElementById(id);
      if (m && !m.classList.contains('hidden')) {
        m.classList.add('hidden');
        m.classList.remove('flex', 'modal-visible');
        m.classList.add('modal-hidden');
      }
    });
    document.body.style.overflow = '';
  });
  window.addEventListener('pageshow', function () { document.body.style.overflow = ''; });

    /* ================= MANTENIMIENTOS (diseno real) ================= */
  var mantTable = document.getElementById('maintenance-table');
  if (mantTable) {
    (function () {
      var els = document.querySelectorAll('header div');
      for (var i = els.length - 1; i >= 0; i--) {
        if (els[i].querySelector('nav')) continue;
        if (els[i].closest('nav')) continue;
        if (/ADMINISTRADOR/i.test(els[i].textContent) && els[i].querySelector('img')) {
          setName(els[i], ['Carlos Mendoza', 'Ing. Carlos Mendoza']);
          var nm = els[i].querySelector('span.text-sm, span.font-bold');
          void nm;
          UN.profileMenu(els[i], BASE + '/perfil.html');
          break;
        }
      }
    })();
    var MANTS = {};
    var fE = 'todas', fQ = '', fOrden = 'recientes', fPag = 1;
    var POR_PAG = 8;
    function setBadge(cell, estado) {
      var map = {
        REALIZADA: ['bg-emerald-50 text-emerald-700 border-emerald-200', 'bg-emerald-500', 'Realizada'],
        EN_PROCESO: ['bg-blue-50 text-blue-700 border-blue-200', 'bg-blue-500', 'En Proceso'],
        PENDIENTE: ['bg-amber-100 text-amber-800 border-amber-200', 'bg-amber-500', 'Pendiente Revisión'],
      };
      var m = map[estado] || map.PENDIENTE;
      var badge = null;
      cell.querySelectorAll('span').forEach(function (s) {
        if (/Pendiente|Proceso|Camino|Realizada|Revisi/.test(s.textContent)) badge = s;
      });
      if (badge) {
        badge.className = 'inline-flex items-center gap-1.5 w-max px-2.5 py-0.5 rounded-full text-xs font-bold border ' + m[0];
        badge.innerHTML = '<span class="badge-dot ' + m[1] + '"></span> ' + m[2];
      }
    }
    function fechaLarga(iso) {
      var p = String(iso || '').split('-');
      return (p[2] || '') + '/' + (p[1] || '') + '/' + (p[0] || '');
    }
    function buildRow(tpl, c) {
      var tr = tpl.cloneNode(true);
      tr.setAttribute('data-estado', c.estado);
      var tds = tr.children;
      var f0 = tds[0].querySelector('span.font-extrabold');
      if (f0) f0.textContent = c.id;
      var fdate = tds[0].querySelector('div.text-slate-400');
      if (fdate) fdate.textContent = fechaLarga(c.fecha);
      setBadge(tds[0], c.estado);
      tds[0].querySelectorAll('span.text-slate-600').forEach(function (s) {
        if (/^COT-/.test(s.textContent.trim())) s.textContent = c.folio || '—';
      });
      var n0 = tds[1].querySelector('span.font-bold');
      if (n0) n0.textContent = c.nombre;
      tds[1].querySelectorAll('span').forEach(function (s) {
        if (/@/.test(s.textContent)) s.childNodes.forEach(function (n) { if (n.nodeType === 3) n.nodeValue = ' ' + c.email; });
      });
      var telOk = false;
      tds[1].querySelectorAll('span, div').forEach(function (d) {
        if (!telOk && /^\+[\d\s()+-]+$/.test(d.textContent.trim()) && d.querySelector('svg')) {
          d.childNodes.forEach(function (n) { if (n.nodeType === 3) n.nodeValue = ' ' + c.telefono; });
          telOk = true;
        }
      });
      var t2 = tds[2].querySelectorAll('span');
      if (t2[0]) {
        var keep = t2[0].querySelector('svg');
        t2[0].textContent = '';
        if (keep) t2[0].appendChild(keep);
        t2[0].appendChild(document.createTextNode(c.tipoInmueble || 'General'));
      }
      var dparts = tds[2].querySelectorAll('span.text-xs, div.text-xs');
      if (dparts[1]) dparts[1].textContent = c.direccion || '—';
      var refs = tds[2].querySelectorAll('span.text-\\[11px\\], div.text-\\[11px\\]');
      if (refs[0]) {
        if (c.folio) { refs[0].style.display = ''; refs[0].textContent = 'Ref: ' + c.folio; }
        else { refs[0].style.display = 'none'; }
      }
      var det = tds[3].querySelector('p');
      if (det) {
        det.innerHTML = '';
        String(c.descripcion || 'Sin detalle.').split('\n').forEach(function (ln, i) {
          if (i > 0) det.appendChild(document.createElement('br'));
          det.appendChild(document.createTextNode(ln));
        });
      }
      var tags = tds[3].querySelector('div.mt-2');
      if (tags) tags.parentNode.removeChild(tags);
      var acc = tds[4];
      acc.querySelectorAll('button, a').forEach(function (b) { b.parentNode.removeChild(b); });
      var box = acc.querySelector('div') || acc;
      while (box.firstChild) box.removeChild(box.firstChild);
      function mkBtn(cls, label, fn) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = cls;
        b.textContent = label;
        b.addEventListener('click', fn);
        return b;
      }
      async function setEst(est) {
        try {
          var upd = await UN.api('/api/mantenimiento/' + encodeURIComponent(c.id), { method: 'PUT', body: { estado: est } });
          MANTS[upd.id] = upd;
          render();
        } catch (e) { aviso(e.message); }
      }
      if (c.estado === 'PENDIENTE') {
        box.appendChild(mkBtn('w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition', 'Coordinar Visita', function () { setEst('EN_PROCESO'); }));
      }
      if (c.estado !== 'REALIZADA') {
        box.appendChild(mkBtn('w-full inline-flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition', 'Marcar Realizada', function () { setEst('REALIZADA'); }));
      }
      if (c.estado !== 'PENDIENTE') {
        box.appendChild(mkBtn('w-full inline-flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition', 'Regresar a Pendiente', function () { setEst('PENDIENTE'); }));
      }
      var wa = document.createElement('a');
      wa.className = 'w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition';
      wa.textContent = 'WhatsApp';
      var tel = String(c.telefono || '').replace(/\D/g, '');
      if (tel && tel[0] !== '5') tel = '52' + tel;
      wa.href = 'https://wa.me/' + tel + '?text=' + encodeURIComponent('Hola ' + c.nombre + ', sobre tu solicitud ' + c.id + ': ');
      wa.target = '_blank';
      box.appendChild(wa);
      var pdf = document.createElement('button');
      pdf.type = 'button';
      pdf.className = 'w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition';
      pdf.textContent = 'Ficha PDF';
      pdf.addEventListener('click', function () { UN.downloadMant(c, true); });
      box.appendChild(pdf);
      return tr;
    }
    function listaFiltrada() {
      var arr = Object.keys(MANTS).map(function (k) { return MANTS[k]; });
      arr = arr.filter(function (m) {
        return (fE === 'todas' || m.estado === fE) &&
          (!fQ || UN.matches(m.id + ' ' + m.nombre + ' ' + (m.email || ''), fQ));
      });
      arr.sort(function (a, b) {
        if (fOrden === 'antiguas') return String(a.fecha).localeCompare(String(b.fecha));
        if (fOrden === 'prioridad') {
          var w = { PENDIENTE: 0, EN_PROCESO: 1, REALIZADA: 2 };
          return (w[a.estado] == null ? 9 : w[a.estado]) - (w[b.estado] == null ? 9 : w[b.estado]);
        }
        return String(b.fecha).localeCompare(String(a.fecha));
      });
      return arr;
    }
    function paintStats() {
      var arr = Object.keys(MANTS).map(function (k) { return MANTS[k]; });
      var vals = { total: arr.length,
        pe: arr.filter(function (x) { return x.estado === 'PENDIENTE'; }).length,
        ep: arr.filter(function (x) { return x.estado === 'EN_PROCESO'; }).length,
        re: arr.filter(function (x) { return x.estado === 'REALIZADA'; }).length };
      document.querySelectorAll('main span.text-3xl, section span.text-3xl').forEach(function (sp) {
        var box = sp.parentElement && sp.parentElement.parentElement;
        var label = box ? box.textContent : '';
        if (/Total Solicitudes/i.test(label)) sp.textContent = vals.total;
        else if (/Pendientes/i.test(label)) sp.textContent = vals.pe;
        else if (/Revisi|Proceso/i.test(label)) sp.textContent = vals.ep;
        else if (/Realizada/i.test(label)) sp.textContent = vals.re;
      });
      var badge = document.getElementById('mant-nav-count');
      if (badge) badge.textContent = vals.pe;
      recount(vals);
    }
    function recount(v) {
      v = v || (function () {
        var arr = Object.keys(MANTS).map(function (k) { return MANTS[k]; });
        return { todas: arr.length,
          pendientes: arr.filter(function (x) { return x.estado === 'PENDIENTE'; }).length,
          proceso: arr.filter(function (x) { return x.estado === 'EN_PROCESO'; }).length,
          realizadas: arr.filter(function (x) { return x.estado === 'REALIZADA'; }).length };
      })();
      document.querySelectorAll('button').forEach(function (b) {
        var t = b.textContent.trim().toLowerCase();
        if (t.indexOf('todas') === 0) b.childNodes.forEach(function (n) { if (n.nodeType === 3) n.nodeValue = 'Todas (' + v.todas + ') '; });
        else if (t.indexOf('pendiente') === 0) b.childNodes.forEach(function (n) { if (n.nodeType === 3) n.nodeValue = 'Pendientes (' + v.pendientes + ') '; });
        else if (t.indexOf('en proceso') === 0) b.childNodes.forEach(function (n) { if (n.nodeType === 3) n.nodeValue = 'En Proceso (' + v.proceso + ') '; });
        else if (t.indexOf('realizada') === 0) b.childNodes.forEach(function (n) { if (n.nodeType === 3) n.nodeValue = 'Realizadas (' + v.realizadas + ') '; });
      });
    }
    function paintFilters() {
      var btns = Array.prototype.slice.call(document.querySelectorAll('button')).filter(function (b) {
        return /^(todas|pendientes|en proceso|realizadas)/i.test(b.textContent.trim());
      });
      var ACTIVE = 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm transition';
      btns.forEach(function (b) {
        if (!b._unCls) b._unCls = b.className;
        b.onclick = function () {
          var t = b.textContent.trim().toLowerCase();
          fE = t.indexOf('pendiente') === 0 ? 'PENDIENTE' : (t.indexOf('en proceso') === 0 ? 'EN_PROCESO' : (t.indexOf('realizada') === 0 ? 'REALIZADA' : 'todas'));
          fPag = 1;
          render();
          btns.forEach(function (x) { x.className = x._unCls; });
          b.className = ACTIVE;
        };
      });
    }
    function paintPagin(total) {
      var pages = Math.max(1, Math.ceil(total / POR_PAG));
      if (fPag > pages) fPag = pages;
      var box = document.querySelector('[data-purpose="pagination-controls"]');
      if (!box) return;
      var spans = box.querySelectorAll('span');
      if (spans[0]) {
        var ini = total ? (fPag - 1) * POR_PAG + 1 : 0;
        var fin = Math.min(total, fPag * POR_PAG);
        spans[0].innerHTML = 'Mostrando <b>' + ini + '</b> a <b>' + fin + '</b> de <b>' + total + '</b> solicitudes registradas';
      }
      var nums = box.querySelectorAll('button');
      var holder = nums.length ? nums[0].parentNode : null;
      nums.forEach(function (b) {
        var t = b.textContent.trim().toLowerCase();
        if (t !== 'anterior' && t !== 'siguiente' && !/^\d+$/.test(t)) return;
        if (t === 'anterior') b.onclick = function () { if (fPag > 1) { fPag--; render(); } };
        else if (t === 'siguiente') b.onclick = function () {
          if (fPag < pages) { fPag++; render(); }
        };
      });
      if (holder) {
        Array.prototype.slice.call(holder.children).forEach(function (b) {
          if (/^\d+$/.test(b.textContent.trim())) holder.removeChild(b);
        });
        var prev = null;
        Array.prototype.slice.call(holder.children).forEach(function (b) {
          if (b.textContent.trim().toLowerCase() === 'anterior') prev = b;
        });
        var show = Math.min(pages, 12);
        for (var pg = 1; pg <= show; pg++) {
          (function (pg) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = String(pg);
            var active = pg === fPag;
            b.className = active
              ? 'w-8 h-8 rounded-lg bg-brand-600 text-white text-xs font-bold shadow-sm'
              : 'w-8 h-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold bg-white transition';
            b.onclick = function () { fPag = pg; render(); };
            if (prev && prev.nextSibling) holder.insertBefore(b, prev.nextSibling);
            else holder.appendChild(b);
            prev = b;
          })(pg);
        }
      }
    }
    var POR_PAG = 8;
    var tplRow = null;
    function render() {
      var lista = listaFiltrada();
      var tbody = document.querySelector('#maintenance-table tbody');
      if (!tplRow) {
        var first = tbody.querySelector('tr');
        if (first) tplRow = first.cloneNode(true);
      }
      tbody.innerHTML = '';
      var slice = lista.slice((fPag - 1) * POR_PAG, fPag * POR_PAG);
      slice.forEach(function (c) { tbody.appendChild(buildRow(tplRow, c)); });
      if (!slice.length) {
        var tr0 = document.createElement('tr');
        tr0.innerHTML = '<td colspan="5" class="text-center text-slate-500 py-6">Sin solicitudes.</td>';
        tbody.appendChild(tr0);
      }
      paintPagin(lista.length);
    }
    async function load() {
      var lista = await UN.api('/api/mantenimiento');
      for (var k in MANTS) delete MANTS[k];
      lista.forEach(function (m) { MANTS[m.id] = m; });
      render();
      paintStats();
      paintFilters();
      recount();
    }
    (function () {
      var q = document.querySelector('input[placeholder*="Buscar por folio"]');
      if (q) q.addEventListener('input', function (e) { fQ = e.target.value.trim(); fPag = 1; render(); });
      var sels = document.querySelectorAll('select');
      sels.forEach(function (s) {
        var has = false;
        Array.prototype.slice.call(s.options || []).forEach(function (o) {
          if (/reciente|antigua|prioridad/i.test(o.text)) has = true;
        });
        if (has) s.addEventListener('change', function () {
          var v = s.value.toLowerCase();
          fOrden = v.indexOf('antigua') >= 0 ? 'antiguas' : (v.indexOf('prioridad') >= 0 ? 'prioridad' : 'recientes');
          fPag = 1;
          render();
        });
      });
      // Avisos en la esquina. Esta pagina no tiene contenedor de toast ni
      // mostrarToast, asi que Sincronizar recargaba los datos sin cambiar nada
      // en pantalla y parecia un boton muerto: no habia forma de saber si
      // estaba trabajando, si ya estaba al dia o si habia fallado.
      function avisoMant(msg, tipo) {
        var cont = document.getElementById('toast-mantenimiento');
        if (!cont) {
          cont = document.createElement('div');
          cont.id = 'toast-mantenimiento';
          cont.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:120;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:92vw';
          document.body.appendChild(cont);
        }
        var el = document.createElement('div');
        el.style.cssText = 'color:#fff;font-size:13px;font-weight:600;padding:11px 16px;border-radius:12px;' +
          'box-shadow:0 10px 24px rgba(0,0,0,.18);max-width:330px;transition:opacity .25s,transform .25s;' +
          'background:' + (tipo === 'error' ? '#b91c1c' : (tipo === 'info' ? '#0f172a' : '#047857'));
        el.textContent = msg;
        cont.appendChild(el);
        setTimeout(function () {
          el.style.opacity = '0';
          el.style.transform = 'translateY(8px)';
          setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
        }, 2800);
      }

      document.querySelectorAll('button').forEach(function (b) {
        var t = b.textContent.trim().toLowerCase();
        // Por PREFIJO, no texto exacto: si se cambia la etiqueta del boton
        // ("CSV" -> "Excel") el cableado no se rompe.
        if (t.indexOf('exportar') === 0) b.addEventListener('click', function () {
          var filas = Object.keys(MANTS).map(function (k) {
            var m = MANTS[k];
            return [m.id, m.folio, m.fecha, m.nombre, m.email, m.telefono, m.direccion, m.descripcion, m.estado];
          });
          if (!filas.length) { avisoMant('No hay mantenimientos para exportar.', 'error'); return; }
          var ok = (window.EXCEL ? EXCEL.descargar({
            nombre: 'grupo_nerba_hidalgo_mantenimientos',
            hoja: 'Mantenimientos',
            titulo: 'Mantenimientos · Grupo Nerba Hidalgo',
            columnas: [
              { titulo: 'ID', ancho: 16 },
              { titulo: 'FOLIO', ancho: 21 },
              { titulo: 'FECHA', ancho: 12, tipo: 'fecha' },
              { titulo: 'CLIENTE', ancho: 26 },
              { titulo: 'EMAIL', ancho: 28 },
              { titulo: 'TELEFONO', ancho: 15 },
              { titulo: 'DIRECCION', ancho: 32 },
              { titulo: 'DESCRIPCION', ancho: 40 },
              { titulo: 'ESTADO', ancho: 14, tipo: 'estado' }
            ],
            filas: filas
          }) : false);
          avisoMant(ok ? 'Excel descargado: ' + filas.length + ' registros.' : 'No se pudo generar el Excel.', ok ? 'ok' : 'error');
        });
        if (t.indexOf('sincronizar') === 0) b.addEventListener('click', function () {
          // El icono solo gira MIENTRAS carga: antes giraba siempre por una
          // clase fija en el HTML y parecia trabajar sin hacer nada.
          var ico = b.querySelector('svg');
          if (ico) ico.classList.add('animate-spin');
          avisoMant('Sincronizando con la central...', 'info');
          load().then(function () {
            avisoMant('Lista actualizada: ' + Object.keys(MANTS).length + ' solicitudes.', 'ok');
          }).catch(function (e) {
            avisoMant('No se pudo sincronizar: ' + (e.message || e), 'error');
          }).then(function () {
            if (ico) ico.classList.remove('animate-spin');
          });
        });
      });
    })();
    load().catch(function (e) { aviso(e.message); });
    return;
  }


  /* ================= PERFIL ADMIN ================= */
  var seccion = document.getElementById('seccion-contacto');
  if (seccion && document.getElementById('btn-save-master')) {
    var bc = document.getElementById('breadcrumb-home');
    if (bc) {
      var nc = bc.cloneNode(true);
      nc.setAttribute('href', BASE + (isElec ? '/historial.html' : '/mantenimiento.html'));
      nc.removeAttribute('id');
      bc.parentNode.replaceChild(nc, bc);
    }
    UN.api('/api/me').then(function (me) {
      UN.setSession(localStorage.getItem('unidos_token'), me);
      var fi = function (id, v) { var el = document.getElementById(id); if (el && v !== undefined) el.value = v; return el ? el.value : ''; };
      fi('input-fullname', me.nombre || '');
      fi('input-email', me.email || '');
      fi('input-phone', me.telefono || '');
      fi('input-phone2', me.telefonoSec || '');
      fi('input-company', me.empresa || '');
      var h3 = seccion.querySelector('h3');
      if (h3 && me.nombre) h3.textContent = me.nombre;
      // el nombre tambien abre el mini-menu (igual que en las demas interfaces)
      if (h3) UN.profileMenu(h3, BASE + '/perfil.html');
      var rolChip = Array.prototype.slice.call(seccion.querySelectorAll('span')).filter(function (s) {
        return /VERIFICADO|ADMINISTRADOR/.test(s.textContent) && s.textContent.length < 30;
      })[0];
      if (rolChip && me.rol) rolChip.textContent = me.rol + ' VERIFICADO';
      var chip2 = document.getElementById('user-profile-menu-button');
      if (chip2) {
        var nm = chip2.querySelector('div.hidden span, span.font-bold');
        if (nm && me.nombre) nm.textContent = me.nombre;
        UN.profileMenu(chip2, BASE + '/perfil.html');
      } else {
        // sin chip en esta vista: el avatar abre el mismo mini-menu (perfil/salir)
        var av = seccion.querySelector('div.relative.group');
        if (av) UN.profileMenu(av, BASE + '/perfil.html');
      }
    }).catch(function (e) {
      if (e && (e.status === 401 || e.status === 403)) location.href = '/login.html?next=' + encodeURIComponent(BASE + '/perfil.html');
    });
    var btnSave = document.getElementById('btn-save-master');
    if (btnSave) btnSave.addEventListener('click', async function () {
      function v(id) { var el = document.getElementById(id); return el ? el.value : ''; }
      try {
        // El diseno no tiene input-address: la direccion no se toca desde aqui.
        var body = {
          nombre: v('input-fullname').trim(),
          telefono: v('input-phone').trim(),
          telefonoSec: v('input-phone2').trim(),
          empresa: v('input-company').trim(),
        };
        if (!body.nombre) { aviso('Escribe tu nombre completo.'); return; }
        var me = await UN.api('/api/me', { method: 'PUT', body: body });
        UN.setSession(localStorage.getItem('unidos_token'), me);
        if (typeof showToast === 'function') showToast('Datos actualizados.', 'Perfil Actualizado');
        else aviso('Perfil actualizado.');
      } catch (e) { aviso(e.message); }
    });

  }
})();
