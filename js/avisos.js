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

  // Ventana emergente centrada (sin fondo que bloquee la página): el aviso
  // anterior vivía en la esquina y no se notaba. Una sola instancia: si llega
  // otro aviso, se reemplaza el contenido y se reinicia el tiempo.
  var ESTILOS = [
    '.aviso-modal{position:fixed;z-index:2147483000;left:50%;top:15%;transform:translate(-50%,-14px) scale(.96);',
    'width:min(calc(100vw - 32px),400px);background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:18px;',
    'box-shadow:0 24px 60px rgba(2,6,23,.3);padding:22px 22px 20px;text-align:center;box-sizing:border-box;overflow:hidden;',
    'font:600 14px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;',
    'opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease}',
    '.aviso-modal.visible{opacity:1;pointer-events:auto;transform:translate(-50%,0) scale(1)}',
    '.aviso-ico{width:46px;height:46px;border-radius:999px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px}',
    '.aviso-ico svg{width:22px;height:22px;display:block}',
    '.aviso-ok .aviso-ico{background:#dcfce7;color:#047857}',
    '.aviso-error .aviso-ico{background:#fee2e2;color:#b91c1c}',
    '.aviso-info .aviso-ico{background:#f1f5f9;color:#475569}',
    '.aviso-txt{word-break:break-word;color:#334155}',
    '.aviso-cerrar{position:absolute;top:10px;right:10px;background:transparent;border:0;color:#94a3b8;',
    'width:26px;height:26px;border-radius:8px;cursor:pointer;font:700 14px/1 system-ui;padding:0}',
    '.aviso-cerrar:hover{background:#f1f5f9;color:#475569}',
    '.aviso-bar{position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left;}',
    '.aviso-ok .aviso-bar{background:#047857}.aviso-error .aviso-bar{background:#b91c1c}.aviso-info .aviso-bar{background:#64748b}',
    'html.dark-mode .aviso-modal,html.dark .aviso-modal{background:#0f172a;color:#f1f5f9;border-color:#334155}',
    'html.dark-mode .aviso-txt,html.dark .aviso-txt{color:#cbd5e1}',
    'html.dark-mode .aviso-cerrar,html.dark .aviso-cerrar{color:#64748b}',
    'html.dark-mode .aviso-cerrar:hover,html.dark .aviso-cerrar:hover{background:#1e293b;color:#cbd5e1}',
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
    '@media (max-width:480px){.aviso-modal{top:12%}}'
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

  var OK = /listo|guardad|descarg|enviad|cread|actualiz|eliminad|quitad|asignad|restaurad|restablecid|sincroniz|exportad/i;
  var MAL = /no se pudo|no pudo|error|incorrect|inv[aá]lid|falta|requiere|denegad|excede|demasiad|no est[aá]|no tiene|debe |obligatori|no se puede|aún no|sin permiso/i;

  function aviso(mensaje, tipo, ms) {
    if (!global.document || !document.body) return function () {};
    unaVez();
    if (tipo !== 'ok' && tipo !== 'error' && tipo !== 'info') {
      var t = String(mensaje == null ? '' : mensaje);
      tipo = MAL.test(t) ? 'error' : (OK.test(t) ? 'ok' : 'info');
    }
    var caja = document.getElementById('aviso-nb-modal');
    if (!caja) {
      caja = document.createElement('div');
      caja.id = 'aviso-nb-modal';
      caja.setAttribute('role', 'status');
      caja.innerHTML = '<span class="aviso-ico" aria-hidden="true"></span>' +
        '<div class="aviso-txt"></div>' +
        '<button class="aviso-cerrar" type="button" aria-label="Cerrar">&times;</button>' +
        '<span class="aviso-bar" aria-hidden="true"></span>';
      document.body.appendChild(caja);
      caja.querySelector('.aviso-cerrar').addEventListener('click', function () { cerrarAviso(); });
    }
    caja.className = 'aviso-modal aviso-' + tipo;
    caja.querySelector('.aviso-ico').innerHTML = ICONOS[tipo];
    caja.querySelector('.aviso-txt').textContent = String(mensaje == null ? '' : mensaje);
    var espera = ms || (tipo === 'error' ? 6000 : 3200);
    var barra = caja.querySelector('.aviso-bar');
    try {
      barra.style.transition = 'none';
      barra.style.transform = 'scaleX(1)';
      void caja.offsetWidth;
    } catch (e) {}
    requestAnimationFrame(function () {
      caja.classList.add('visible');
      try {
        barra.style.transition = 'transform ' + espera + 'ms linear';
        barra.style.transform = 'scaleX(0)';
      } catch (e) {}
    });
    if (aviso._t) { try { clearTimeout(aviso._t); } catch (e) {} }
    aviso._t = setTimeout(function () { cerrarAviso(); }, espera);
    return function () { cerrarAviso(); };
  }
  function cerrarAviso() {
    if (aviso._t) { try { clearTimeout(aviso._t); } catch (e) {} aviso._t = null; }
    var caja = document.getElementById('aviso-nb-modal');
    if (caja) caja.classList.remove('visible');
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var caja = document.getElementById('aviso-nb-modal');
      if (caja && caja.classList.contains('visible')) cerrarAviso();
    }
  });

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