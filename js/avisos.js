/* Avisos de Grupo NERBA HIDALGO: toast y confirmacion con el estilo del
   proyecto, sin librerias externas.
 *
 * Antes se usaba alert() y confirm() nativos de Windows: se veian como cajas
 * grises del sistema operativo, fuera de lugar, y el confirm() ademas obliga
 * a bloquear la pagina mientras el usuario lee. Con esto todo se ve igual en
 * cualquier pantalla y el modal se cierra solo.
 *
 *   aviso('Guardado', 'ok');            aviso('No se pudo', 'error');
 *   if (await confirmar('¿Eliminar?')) { ... }
 *
 * aviso() decide solo si es aviso, error o éxito si no se le dice.
 */
(function (global) {
  'use strict';

  var ESTILOS = [
    'aviso-caja{position:fixed;z-index:2147483000;display:flex;gap:10px;align-items:flex-start;',
    'max-width:min(92vw,380px);padding:12px 15px;border-radius:14px;color:#fff;',
    'font:600 13px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;',
    'box-shadow:0 12px 32px rgba(2,6,23,.28);opacity:0;transform:translateY(12px);',
    'transition:opacity .22s ease,transform .22s ease;pointer-events:auto}',
    '.aviso-caja.visible{opacity:1;transform:translateY(0)}',
    '.aviso-ico{flex:0 0 auto;width:18px;height:18px;margin-top:1px}',
    '.aviso-txt{flex:1 1 auto;word-break:break-word}',
    '.aviso-cerrar{flex:0 0 auto;background:rgba(255,255,255,.18);border:0;color:#fff;',
    'width:20px;height:20px;border-radius:6px;cursor:pointer;font:700 12px/1 system-ui;padding:0}',
    '.aviso-cerrar:hover{background:rgba(255,255,255,.32)}',
    '.aviso-ok{background:#047857}.aviso-error{background:#b91c1c}.aviso-info{background:#0f172a}',
    '.aviso-lienzo{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;',
    'justify-content:center;padding:18px;background:rgba(2,6,23,.66);backdrop-filter:blur(3px);',
    'opacity:0;transition:opacity .18s ease}',
    '.aviso-lienzo.visible{opacity:1}',
    '.aviso-panel{width:100%;max-width:430px;background:#fff;border-radius:18px;overflow:hidden;',
    'box-shadow:0 24px 60px rgba(2,6,23,.35);transform:translateY(10px) scale(.98);',
    'transition:transform .18s ease}',
    '.aviso-lienzo.visible .aviso-panel{transform:none}',
    '.aviso-cab{display:flex;gap:12px;align-items:flex-start;padding:18px 18px 6px}',
    '.aviso-cab-ico{flex:0 0 auto;width:36px;height:36px;border-radius:11px;display:flex;',
    'align-items:center;justify-content:center;color:#fff;font-size:19px}',
    '.aviso-cab h3{margin:0 0 3px;font:800 15px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#0f172a}',
    '.aviso-cab p{margin:0;font:400 13px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#475569}',
    '.aviso-lista{margin:8px 18px 0;padding:0;list-style:none;max-height:34vh;overflow:auto}',
    '.aviso-lista li{display:flex;gap:9px;padding:6px 0;border-top:1px solid #f1f5f9;',
    'font:400 13px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#334155}',
    '.aviso-lista li:first-child{border-top:0}',
    '.aviso-lista li b{flex:0 0 auto;color:#b91c1c}',
    '.aviso-pie{display:flex;gap:10px;justify-content:flex-end;padding:16px 18px 18px}',
    '.aviso-btn{border:0;border-radius:12px;padding:11px 18px;cursor:pointer;',
    'font:700 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;transition:filter .15s ease}',
    '.aviso-btn:hover{filter:brightness(.94)}',
    '.aviso-btn-cancel{background:#f1f5f9;color:#475569}',
    '.aviso-btn-ok{background:#d91b1b;color:#fff;box-shadow:0 6px 16px rgba(217,27,27,.28)}',
    '.aviso-btn-peligro{background:#b91c1c;color:#fff}',
    '@media (max-width:480px){.aviso-caja{left:12px;right:12px;bottom:12px;max-width:none}}'
  ].join('');

  var ICONOS = {
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 8v5"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="9"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 11v6"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="9"/></svg>'
  };

  function unaVez() {
    if (document.getElementById('avisos-nb-estilos')) return;
    var s = document.createElement('style');
    s.id = 'avisos-nb-estilos';
    s.textContent = ESTILOS;
    (document.head || document.documentElement).appendChild(s);
  }

  function contenedor() {
    var c = document.getElementById('avisos-nb-pila');
    if (!c) {
      c = document.createElement('div');
      c.id = 'avisos-nb-pila';
      c.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2147483000;display:flex;' +
        'flex-direction:column;align-items:flex-end;gap:9px;pointer-events:none';
      document.body.appendChild(c);
    }
    return c;
  }

  var OK = /listo|guardad|descarg|enviad|cread|actualiz|eliminad|quitad|asignad|restaurad|restablecid|sincroniz|exportad/i;
  var MAL = /no se pudo|no pudo|error|incorrect|inv[aá]lid|falta|requiere|denegad|excede|demasiad|no est[aá]|no tiene|debe |obligatori|no se puede|aún no|sin permiso/i;

  function aviso(mensaje, tipo, ms) {
    if (!global.document || !document.body) return;
    unaVez();
    if (tipo !== 'ok' && tipo !== 'error' && tipo !== 'info') {
      var t = String(mensaje == null ? '' : mensaje);
      tipo = MAL.test(t) ? 'error' : (OK.test(t) ? 'ok' : 'info');
    }
    var caja = document.createElement('div');
    caja.className = 'aviso-caja aviso-' + tipo;
    caja.setAttribute('role', 'status');
    caja.innerHTML = '<span class="aviso-ico">' + ICONOS[tipo] + '</span>' +
      '<span class="aviso-txt"></span>' +
      '<button class="aviso-cerrar" type="button" aria-label="Cerrar">&times;</button>';
    caja.querySelector('.aviso-txt').textContent = String(mensaje == null ? '' : mensaje);
    contenedor().appendChild(caja);
    // Un rAF para que la transicion se vea (si se muestra y oculta en el mismo
    // tick, el navegador no pinta la animacion).
    requestAnimationFrame(function () { caja.classList.add('visible'); });

    var vivo = true;
    function cerrar() {
      if (!vivo) return;
      vivo = false;
      caja.classList.remove('visible');
      setTimeout(function () { if (caja.parentNode) caja.parentNode.removeChild(caja); }, 260);
    }
    caja.querySelector('.aviso-cerrar').addEventListener('click', cerrar);
    setTimeout(cerrar, ms || (tipo === 'error' ? 6000 : 3600));
    return cerrar;
  }

  function confirmar(opciones) {
    // confirmar('¿Eliminar?') o confirmar({titulo, texto, lineas, boton, tipo})
    var o = opciones;
    if (typeof o === 'string') o = { texto: o };
    o = o || {};

    return new Promise(function (resolver) {
      if (!global.document || !document.body) return resolver(global.confirm ? global.confirm(o.texto || '') : true);
      unaVez();

      var hayLineas = Array.isArray(o.lineas) && o.lineas.filter(Boolean).length > 0;
      var peligro = o.tipo !== 'ok';
      var lienzo = document.createElement('div');
      lienzo.className = 'aviso-lienzo';
      lienzo.setAttribute('role', 'dialog');
      lienzo.setAttribute('aria-modal', 'true');

      var panel = document.createElement('div');
      panel.className = 'aviso-panel';
      var cabIco = document.createElement('div');
      cabIco.className = 'aviso-cab-ico';
      cabIco.style.background = peligro ? '#fee2e2' : '#dcfce7';
      cabIco.style.color = peligro ? '#b91c1c' : '#047857';
      cabIco.innerHTML = peligro
        ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 9v5"/><circle cx="12" cy="17" r="1.1" fill="currentColor" stroke="none"/><path d="M10.3 3.9L2.6 17.4A2 2 0 004.3 20.4h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

      var cab = document.createElement('div');
      cab.className = 'aviso-cab';
      var textos = document.createElement('div');
      textos.style.minWidth = '0';
      var h = document.createElement('h3');
      h.textContent = o.titulo || (peligro ? 'Confirmar' : 'Confirmar');
      var p = document.createElement('p');
      p.textContent = o.texto || 'Revisa antes de continuar.';
      textos.appendChild(h);
      textos.appendChild(p);
      cab.appendChild(cabIco);
      cab.appendChild(textos);
      panel.appendChild(cab);

      if (hayLineas) {
        var ul = document.createElement('ul');
        ul.className = 'aviso-lista';
        o.lineas.filter(Boolean).forEach(function (linea) {
          var li = document.createElement('li');
          var punto = document.createElement('b');
          punto.textContent = '•';
          var txt = document.createElement('span');
          txt.textContent = linea;
          li.appendChild(punto);
          li.appendChild(txt);
          ul.appendChild(li);
        });
        panel.appendChild(ul);
      }

      var pie = document.createElement('div');
      pie.className = 'aviso-pie';
      var btnCancel = document.createElement('button');
      btnCancel.type = 'button';
      btnCancel.className = 'aviso-btn aviso-btn-cancel';
      btnCancel.textContent = o.cancelar || 'Cancelar';
      var btnOk = document.createElement('button');
      btnOk.type = 'button';
      btnOk.className = 'aviso-btn ' + (peligro ? 'aviso-btn-peligro' : 'aviso-btn-ok');
      btnOk.textContent = o.boton || 'Confirmar';
      pie.appendChild(btnCancel);
      pie.appendChild(btnOk);
      panel.appendChild(pie);
      lienzo.appendChild(panel);
      document.body.appendChild(lienzo);

      var antes = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { lienzo.classList.add('visible'); });

      var yaRespondio = false;
      function cerrar(v) {
        if (yaRespondio) return;
        yaRespondio = true;
        document.removeEventListener('keydown', alTeclear);
        document.body.style.overflow = antes;
        lienzo.classList.remove('visible');
        setTimeout(function () { if (lienzo.parentNode) lienzo.parentNode.removeChild(lienzo); }, 200);
        resolver(!!v);
      }
      function alTeclear(e) { if (e.key === 'Escape') cerrar(false); }
      btnOk.addEventListener('click', function () { cerrar(true); });
      btnCancel.addEventListener('click', function () { cerrar(false); });
      lienzo.addEventListener('click', function (e) { if (e.target === lienzo) cerrar(false); });
      document.addEventListener('keydown', alTeclear);
      try { btnOk.focus(); } catch (e) {}
    });
  }

  global.AVISO = { aviso: aviso, confirmar: confirmar, ok: function (m) { return aviso(m, 'ok'); }, error: function (m) { return aviso(m, 'error'); }, info: function (m) { return aviso(m, 'info'); } };
  // Atajos cortos para no tener que importar en cada archivo.
  global.aviso = aviso;
  global.confirmar = confirmar;
})(window);