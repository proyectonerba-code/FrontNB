// Modulo de la bitacora (superadmin): dos cosas nuevas.
//
//  1) Paginacion POR DIA. Antes no habia paginacion: se pedian hasta 2000
//     eventos y se pintaban todos de golpe, y los botones "Anterior" y
//     "Siguiente" con sus numeros eran HTML fijo, sin ningun manejador. Ahora
//     se agrupan los eventos por dia y cada pagina es un dia; las flechas
//     cambian de dia.
//
//  2) Boton para vaciar la bitacora, con confirmacion escrita (BORRAR) y
//     una nota de que es irreversible.
(function () {
  if (window.__bitacoraDias) return;
  window.__bitacoraDias = true;

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function diaDe(e) {
    // El backend manda fecha en ISO (YYYY-MM-DD) y hora aparte.
    var f = String(e.fecha || '');
    if (f.length < 10) return '';
    return f.slice(0, 10);
  }

  function diaBonito(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    if (p.length < 3) return iso;
    return Number(p[2]) + ' de ' + (MESES[Number(p[1]) - 1] || p[1]) + ' de ' + p[0];
  }

  function etiquetaDia(iso) {
    var hoy = new Date();
    var hoyIso = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
    var ayer = new Date(hoy.getTime() - 864e5);
    var ayerIso = ayer.getFullYear() + '-' + String(ayer.getMonth() + 1).padStart(2, '0') + '-' + String(ayer.getDate()).padStart(2, '0');
    if (iso === hoyIso) return 'Hoy';
    if (iso === ayerIso) return 'Ayer';
    return diaBonito(iso);
  }

  // Agrupa por dia, del mas reciente al mas viejo.
  function agruparPorDia(items) {
    var mapa = {};
    var orden = [];
    (items || []).forEach(function (e) {
      var d = diaDe(e);
      if (!d) return;
      if (!mapa[d]) { mapa[d] = []; orden.push(d); }
      mapa[d].push(e);
    });
    orden.sort(function (a, b) { return a < b ? 1 : (a > b ? -1 : 0); });
    return orden.map(function (d) { return { dia: d, eventos: mapa[d] }; });
  }

  var estado = { dias: [], pagina: 0 };

  function pintarDia() {
    var tbody = document.getElementById('auditTableBody');
    if (!tbody) return;
    var grupo = estado.dias[estado.pagina];
    if (!grupo) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-8">No hay eventos en esta bitácora.</td></tr>';
    } else {
      tbody.innerHTML = (window.__auditRowHTML ? grupo.eventos.map(window.__auditRowHTML) : []).join('');
    }
    actualizarPie();
  }

  function actualizarPie() {
    var pie = document.getElementById('auditFooterCount');
    var grupo = estado.dias[estado.pagina];
    var total = estado.dias.reduce(function (n, d) { return n + d.eventos.length; }, 0);
    if (pie) {
      pie.textContent = estado.dias.length
        ? 'Día ' + (estado.pagina + 1) + ' de ' + estado.dias.length + ' · ' + (grupo ? grupo.eventos.length : 0) + ' eventos del ' + etiquetaDia(grupo ? grupo.dia : '')
        : 'Sin registros en la bitácora';
    }
    var totalEl = document.getElementById('auditTotal');
    if (totalEl && total) totalEl.textContent = total.toLocaleString('es-MX');

    var ant = document.getElementById('auditDiaAnt');
    var sig = document.getElementById('auditDiaSig');
    if (ant) {
      ant.disabled = estado.pagina <= 0;
      ant.textContent = '◀ ' + (estado.pagina > 0 && estado.dias[estado.pagina - 1] ? etiquetaDia(estado.dias[estado.pagina - 1].dia) : 'Día anterior');
    }
    if (sig) {
      var hay = estado.pagina < estado.dias.length - 1;
      sig.disabled = !hay;
      sig.textContent = hay ? etiquetaDia(estado.dias[estado.pagina + 1].dia) + ' ▶' : 'Día siguiente ▶';
    }

    // La lista de numeros que traia el diseño no servia para nada; se
    // reemplaza por los dias reales que hay registrados.
    var chips = document.getElementById('auditDiaChips');
    if (chips) {
      chips.innerHTML = estado.dias.slice(0, 30).map(function (d, i) {
        return '<button type="button" data-dia="' + i + '" class="px-2 py-1 rounded text-[11px] font-bold ' +
          (i === estado.pagina ? 'bg-primary text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high') + '">' +
          etiquetaDia(d.dia) + '</button>';
      }).join('');
      chips.querySelectorAll('[data-dia]').forEach(function (b) {
        b.addEventListener('click', function () {
          estado.pagina = parseInt(b.getAttribute('data-dia'), 10) || 0;
          pintarDia();
        });
      });
    }
  }

  window.__bitacoraPaginar = function (items) {
    estado.dias = agruparPorDia(items);
    estado.pagina = 0;
    pintarDia();
  };

  // Las flechas cambian de dia.
  document.addEventListener('DOMContentLoaded', function () {
    var a = document.getElementById('auditDiaAnt');
    var s = document.getElementById('auditDiaSig');
    if (a) a.addEventListener("click", function () { window.__bitacoraIrDia(-1); });
    if (s) s.addEventListener("click", function () { window.__bitacoraIrDia(1); });
  });
  window.__bitacoraIrDia = function (delta) {
    var destino = estado.pagina + delta;
    if (destino < 0 || destino >= estado.dias.length) return;
    estado.pagina = destino;
    pintarDia();
  };

  // ---- Boton de vaciar la bitacora ----------------------------------------
  // Ventana propia con el estilo de la zona superadmin. Antes se usaban
  // confirm() y prompt() del navegador, que se veian genericos.
  var idModal = 'auditVaciarModal';

  function construirModal(total) {
    var viejo = document.getElementById(idModal);
    if (viejo) return viejo;
    var m = document.createElement('div');
    m.id = idModal;
    m.style.cssText = 'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;' +
      'background:rgba(2,6,23,.72);padding:16px';
    m.innerHTML =
      '<div class="w-full max-w-md rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container overflow-hidden">' +
        '<div class="flex items-center gap-3 px-5 py-4 border-b border-surface-container">' +
          '<span class="material-symbols-outlined text-error text-xl">delete_sweep</span>' +
          '<div><h3 class="text-sm font-bold text-on-surface">Vaciar bitácora</h3>' +
          '<p class="text-[11px] text-secondary mt-0.5">Solo SuperAdmin</p></div>' +
        '</div>' +
        '<div class="px-5 py-5 space-y-4">' +
          '<div class="rounded-lg border border-error/30 bg-error/5 p-3.5 flex gap-2.5">' +
            '<span class="material-symbols-outlined text-error text-lg shrink-0">warning</span>' +
            '<p class="text-xs text-on-surface leading-relaxed">Se van a borrar <strong>' + total +
            '</strong> registros de la bitácora. <strong>Esta acción no se puede deshacer.</strong></p>' +
          '</div>' +
          '<div>' +
            '<label class="text-xs font-semibold text-on-surface block mb-1.5">Para confirmar, escribe ' +
              '<strong class="text-error">BORRAR</strong> en mayúsculas</label>' +
            '<input id="auditVaciarTexto" type="text" autocomplete="off" spellcheck="false" placeholder="BORRAR" ' +
              'class="w-full rounded-lg border border-surface-container bg-surface-container-low px-3 py-2.5 ' +
              'text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 uppercase">' +
            '<p id="auditVaciarError" class="text-[11px] text-error mt-1.5 hidden">La palabra no coincide.</p>' +
          '</div>' +
        '</div>' +
        '<div class="px-5 py-4 border-t border-surface-container flex items-center justify-end gap-2.5">' +
          '<button type="button" id="auditCancelar" class="px-4 py-2 rounded-lg text-on-surface text-xs font-bold ' +
            'hover:bg-surface-container transition-colors">Cancelar</button>' +
          '<button type="button" id="auditConfirmar" disabled class="px-4 py-2 rounded-lg bg-error text-white text-xs ' +
            'font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed">Vaciar bitácora</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);

    var input = document.getElementById('auditVaciarTexto');
    var btn = document.getElementById('auditConfirmar');
    var err = document.getElementById('auditVaciarError');
    input.addEventListener('input', function () {
      btn.disabled = input.value.trim().toUpperCase() !== 'BORRAR';
      err.classList.add('hidden');
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !btn.disabled) btn.click();
      if (e.key === 'Escape') cerrarModal();
    });
    document.getElementById('auditCancelar').addEventListener('click', cerrarModal);
    m.addEventListener('click', function (e) { if (e.target === m) cerrarModal(); });
    return m;
  }

  function cerrarModal() {
    var m = document.getElementById(idModal);
    if (m) m.style.display = 'none';
    var i = document.getElementById('auditVaciarTexto');
    if (i) i.value = '';
    var b = document.getElementById('auditConfirmar');
    if (b) { b.disabled = true; b.textContent = 'Vaciar bitácora'; }
  }

  function avisar(texto, tipo) {
    if (window.SA && SA.toast) { SA.toast(texto, tipo); return; }
    if (window.UN && UN.toast) { UN.toast(texto, tipo === 'emerald' ? 'exito' : 'error'); return; }
    window.alert(texto);
  }

  window.__bitacoraLimpiar = function () {
    var total = estado.dias.reduce(function (n, d) { return n + d.eventos.length; }, 0);
    var modal = construirModal(total);
    modal.style.display = 'flex';
    var input = document.getElementById('auditVaciarTexto');
    if (input) setTimeout(function () { input.focus(); }, 40);

    var btn = document.getElementById('auditConfirmar');
    var err = document.getElementById('auditVaciarError');
    btn.onclick = function () {
      if (input.value.trim().toUpperCase() !== 'BORRAR') { err.classList.remove('hidden'); return; }
      btn.disabled = true;
      btn.textContent = 'Borrando…';
      // Ojo: antes se llamaba SA.api, y ese metodo no existe en el conector de
      // la zona superadmin, por lo que la peticion nunca salia y no se borraba
      // nada. El que si existe, y admite DELETE con cuerpo, es UN.api.
      UN.api('/api/auditoria', { method: 'DELETE', body: { confirmar: 'BORRAR' } })
        .then(function (r) {
          cerrarModal();
          avisar('Bitácora vaciada. Se borraron ' + ((r && r.borrados) || 0) + ' registros.', 'emerald');
          if (typeof window.__bitacoraRefrescar === 'function') window.__bitacoraRefrescar();
        })
        .catch(function (e) {
          btn.disabled = false;
          btn.textContent = 'Vaciar bitácora';
          avisar('No se pudo vaciar: ' + (e && e.message ? e.message : 'error desconocido'), 'error');
        });
    };
  };
})();