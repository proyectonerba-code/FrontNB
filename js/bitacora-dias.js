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
  window.__bitacoraLimpiar = function () {
    var total = estado.dias.reduce(function (n, d) { return n + d.eventos.length; }, 0);
    if (!confirm('Vas a BORRAR los ' + total + ' registros de la bitácora.\n\nEsta acción no se puede deshacer.\n\n¿Continuar?')) return;
    var palabra = prompt('Para confirmar, escribe BORRAR en mayúsculas:');
    if (palabra === null) return;
    if (String(palabra).trim().toUpperCase() !== 'BORRAR') {
      alert('No coincide. No se borró nada.');
      return;
    }
    SA.api('/api/auditoria', { method: 'DELETE', body: { confirmar: palabra } }).then(function (r) {
      alert('Bitácora vaciada. Se borraron ' + ((r && r.borrados) || 0) + ' registros.');
      if (typeof window.__bitacoraRefrescar === 'function') window.__bitacoraRefrescar();
    }).catch(function (err) {
      alert('No se pudo vaciar: ' + (err && err.message ? err.message : 'error desconocido'));
    });
  };
})();