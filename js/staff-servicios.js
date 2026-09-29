/* Grupo NERBA HIDALGO - Gestion de "Servicios generales" (admin/superadmin).
   Mismo estilo que el panel de catalogo: la UI se inyecta desde aqui, asi que
   no hay que tocar cada HTML. Solo ADMIN y SUPERADMIN ven la barra; el resto de
   roles (incluido PRODUCTOS_ELECTRONICOS) no reciben nada.
   CRUD contra /api/servicios. */
(function () {
  if (!window.UN) return;
  var u = UN.getUser() || {};
  var rol = String(u.rol || '').toUpperCase();
  if (rol !== 'ADMIN' && rol !== 'SUPERADMIN') return;
  if (!localStorage.getItem('unidos_token')) return;
  if (!document.getElementById('servicios-carousel')) return; // solo donde existe la seccion

  function esc(s) { return UN.esc(s); }
  var servicios = [];
  var foto = '';

  function ensureCss() {
    if (document.getElementById('un-serv-css')) return;
    var st = document.createElement('style');
    st.id = 'un-serv-css';
    st.textContent =
      '.un-sbar{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin:0 0 14px 0}' +
      '.un-sbtn{background:#d91b1b;color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:11px 20px;border-radius:10px;border:0;cursor:pointer;box-shadow:0 4px 10px -2px rgba(217,27,27,.4);font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.un-sbtn:hover{background:#b0000b}' +
      '.un-sghost{background:#fff;color:#334155;font-size:12px;font-weight:700;padding:9px 14px;border-radius:10px;border:1px solid #e2e8f0;cursor:pointer}' +
      '.un-sghost:hover{border-color:#d91b1b;color:#d91b1b}' +
      '.un-slist{display:flex;flex-direction:column;gap:8px;max-height:46vh;overflow-y:auto}' +
      '.un-sitem{display:flex;gap:12px;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}' +
      '.un-sitem img{width:64px;height:48px;object-fit:cover;border-radius:8px;background:#f1f5f9;flex-shrink:0}' +
      '.un-sitem .un-st{flex:1;min-width:0}' +
      '.un-sitem .un-st b{display:block;font-size:13px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.un-sitem .un-st span{font-size:11px;color:#64748b}' +
      '.un-smodal{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,.6);padding:16px}' +
      '.un-smodal.hidden{display:none}' +
      '.un-scard{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 20px 40px -12px rgba(15,23,42,.25);width:100%;max-width:560px;max-height:92vh;overflow-y:auto}' +
      '.un-schead{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #f1f5f9}' +
      '.un-schead b{font-size:17px;color:#0f172a;font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.un-scbody{padding:20px 22px;display:flex;flex-direction:column;gap:14px}' +
      '.un-scbody label.un-slab{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#475569;display:block;margin-bottom:6px}' +
      '.un-scbody input[type=text],.un-scbody textarea{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;font-size:14px;color:#0f172a;background:#fff;box-sizing:border-box}' +
      '.un-scbody input:focus,.un-scbody textarea:focus{outline:none;border-color:#d91b1b}' +
      '.un-scfoot{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid #f1f5f9}' +
      '.un-sfoto{position:relative;height:190px;border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;overflow:hidden;display:flex;align-items:center;justify-content:center}' +
      '.un-sfoto img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
      '.un-sfoto .un-spick{position:relative;z-index:2;font-size:12px;font-weight:800;padding:9px 16px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#334155;cursor:pointer}' +
      '.un-sfoto .un-spick:hover{border-color:#d91b1b;color:#d91b1b}' +
      '.un-stoast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);z-index:200;' +
      'background:#0f172a;color:#fff;font-size:13px;font-weight:600;padding:12px 20px;border-radius:10px;' +
      'box-shadow:0 12px 30px -8px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:all .25s ease;max-width:90vw}' +
      '.un-stoast.ver{opacity:1;transform:translateX(-50%) translateY(0)}' +
      '.un-stoast.err{background:#b0000b}';
    document.head.appendChild(st);
  }

  function barra() {
    if (document.getElementById('un-sbar')) return;
    var d = document.createElement('div');
    d.className = 'un-sbar';
    d.id = 'un-sbar';
    d.innerHTML =
      '<button type="button" class="un-sghost" id="un-s-gestionar">Gestionar servicios</button>' +
      '<button type="button" class="un-sbtn" id="un-s-nuevo">+ Agregar servicio</button>';
    var sec = document.getElementById('servicios-carousel');
    sec.parentNode.insertBefore(d, sec);
    d.querySelector('#un-s-nuevo').addEventListener('click', function () { form(null); });
    d.querySelector('#un-s-gestionar').addEventListener('click', listar);
  }

  function modal(titulo, cuerpo, botones) {
    closeModal();
    var w = document.createElement('div');
    w.className = 'un-smodal';
    w.id = 'un-s-modal';
    w.innerHTML = '<div class="un-scard"><div class="un-schead"><b>' + titulo + '</b>' +
      '<button type="button" data-x aria-label="Cerrar" style="border:0;background:none;font-size:20px;cursor:pointer;color:#64748b">&times;</button></div>' +
      cuerpo + '<div class="un-scfoot">' + botones + '</div></div>';
    document.body.appendChild(w);
    w.querySelector('[data-x]').addEventListener('click', closeModal);
    w.addEventListener('click', function (e) { if (e.target === w) closeModal(); });
    return w;
  }
  function closeModal() {
    var m = document.getElementById('un-s-modal');
    if (m) m.remove();
  }
  // Aviso flotante en vez de alert(): alert() congela la pagina y en pruebas
  // automatizadas cuelga el navegador. Ademas se ve mas pulido.
  var toastT = null;
  function aviso(txt, esError) {
    var t = document.getElementById('un-stoast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'un-stoast';
      t.className = 'un-stoast';
      document.body.appendChild(t);
    }
    t.textContent = txt;
    t.className = 'un-stoast' + (esError ? ' err' : '');
    // Fuerza el reflow para que anime desde el estado inicial.
    void t.offsetWidth;
    t.classList.add('ver');
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('ver'); }, 3200);
  }

  // ---------- listar / editar / borrar ----------
  function listar() {
    UN.api('/api/servicios').then(function (lista) {
      servicios = Array.isArray(lista) ? lista : [];
      var cuerpo = '<div class="un-scbody"><div class="un-slist">' +
        (servicios.length ? servicios.map(fila).join('') : '<p style="font-size:13px;color:#64748b;margin:0">Todavia no hay servicios. Usa "Agregar servicio".</p>') +
        '</div></div>';
      var w = modal('Servicios generales', cuerpo,
        '<button type="button" class="un-sghost" data-cerrar> Cerrar</button>' +
        '<button type="button" class="un-sbtn" data-agregar>+ Agregar</button>');
      w.querySelector('[data-cerrar]').addEventListener('click', closeModal);
      w.querySelector('[data-agregar]').addEventListener('click', function () { form(null); });
      w.querySelectorAll('[data-edit]').forEach(function (b) {
        b.addEventListener('click', function () {
          var s = servicios.filter(function (x) { return x.id === b.getAttribute('data-edit'); })[0];
          if (s) form(s);
        });
      });
      armar(w);
    }).catch(function (e) { aviso('No se pudieron cargar los servicios: ' + ((e && e.message) || '')); });
  }

  function fila(s) {
    var img = s.image ? '<img alt="" src="' + esc(s.image) + '">' : '<img alt="" src="/assets/servicios/servicios-alarma.jpeg">';
    return '<div class="un-sitem">' + img +
      '<div class="un-st"><b>' + esc(s.title) + '</b><span>' + esc(s.eyebrow || 'Sin etiqueta') + '</span></div>' +
      '<button type="button" class="un-sghost" data-edit="' + esc(s.id) + '">Editar</button>' +
      '<button type="button" class="un-sghost" data-del="' + esc(s.id) + '" style="color:#b0000b;border-color:#fecaca">Borrar</button>' +
      '<span style="display:none" data-confirm="' + esc(s.id) + '">' +
      '<button type="button" class="un-sghost" data-yes="' + esc(s.id) + '" style="color:#fff;background:#b0000b;border-color:#b0000b">Si, borrar</button>' +
      '<button type="button" class="un-sghost" data-no="' + esc(s.id) + '">Cancelar</button></span>' +
      '</div>';
  }

  // Confirmacion en dos pasos sobre la misma fila. Se sustituye el confirm()
  // del navegador porque congela la pagina y en pruebas cuelga el proceso.
  function armar(w) {
    w.querySelectorAll('[data-yes]').forEach(function (b) {
      b.addEventListener('click', function () { borrar(b.getAttribute('data-yes')); });
    });
    w.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-del');
        var box = w.querySelector('[data-confirm="' + id + '"]');
        if (box) { box.style.display = 'inline-flex'; box.style.gap = '6px'; box.style.alignItems = 'center'; }
        b.style.display = 'none';
      });
    });
    w.querySelectorAll('[data-no]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-no');
        var box = w.querySelector('[data-confirm="' + id + '"]');
        if (box) box.style.display = 'none';
        var del = w.querySelector('[data-del="' + id + '"]');
        if (del) del.style.display = '';
      });
    });
  }

  function borrar(id) {
    var s = servicios.filter(function (x) { return x.id === id; })[0];
    UN.api('/api/servicios/' + encodeURIComponent(id), { method: 'DELETE' }).then(function () {
      avisar('Servicio borrado.');
      if (typeof UN.notifyCatalog === 'function') UN.notifyCatalog();
      if (typeof window.__unReloadServicios === 'function') window.__unReloadServicios();
      listar();
    }).catch(function (e) { aviso('No se pudo borrar: ' + ((e && e.message) || '')); });
  }

  // ---------- alta / edicion ----------
  function form(s) {
    foto = s ? (s.image || '') : '';
    var esNuevo = !s;
    var cuerpo = '<form class="un-scbody" id="un-sform">' +
      '<div><label class="un-slab" for="us-t">Titulo *</label><input type="text" id="us-t" maxlength="120" required value="' + esc(s ? s.title : '') + '"></div>' +
      '<div><label class="un-slab" for="us-e">Etiqueta</label><input type="text" id="us-e" maxlength="60" value="' + esc(s ? s.eyebrow : '') + '" placeholder="VIDEOS Y MONITOREO"></div>' +
      '<div><label class="un-slab" for="us-d">Descripcion *</label><textarea id="us-d" rows="4" maxlength="600" required placeholder="De que trata el servicio">' + esc(s ? s.description : '') + '</textarea></div>' +
      '<div><label class="un-slab">Foto</label><div class="un-sfoto" id="us-foto"><button type="button" class="un-spick" id="us-pick">Elegir imagen</button></div></div>' +
      '<div><label class="un-slab" for="us-h">Enlace (opcional)</label><input type="text" id="us-h" value="' + esc(s ? s.href : '') + '" placeholder="#catalogo"></div>' +
      '<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#0f172a;cursor:pointer">' +
      '<input type="checkbox" id="us-a"' + (s && s.activo === false ? '' : ' checked') + '> Mostrar en el inicio</label>' +
      '</form>';
    var w = modal(esNuevo ? 'Agregar servicio' : 'Editar servicio', cuerpo,
      '<button type="button" class="un-sghost" data-cerrar>Cancelar</button>' +
      '<button type="button" class="un-sbtn" id="us-save">Guardar</button>');
    w.querySelector('[data-cerrar]').addEventListener('click', closeModal);

    function pintarFoto() {
      var box = w.querySelector('#us-foto');
      var src = foto || '/assets/servicios/servicios-alarma.jpeg';
      box.innerHTML = '<img alt="" src="' + esc(src) + '"><button type="button" class="un-spick" id="us-pick">Cambiar imagen</button>';
      box.querySelector('#us-pick').addEventListener('click', elegir);
    }
    function elegir() {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        if (f.size > 8 * 1024 * 1024) { aviso('La imagen pesa mas de 8MB. Usa una mas chica.'); return; }
        // Se comprime en el navegador: manda un dataURL, no un archivo.
        var img = new Image();
        var url = URL.createObjectURL(f);
        img.onload = function () {
          try {
            var max = 1200;
            var s = Math.min(1, max / Math.max(img.width || 1, img.height || 1));
            var c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.width * s));
            c.height = Math.max(1, Math.round(img.height * s));
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            foto = c.toDataURL('image/jpeg', 0.82);
            pintarFoto();
          } catch (err) { URL.revokeObjectURL(url); aviso('No se pudo procesar la imagen.'); }
        };
        img.onerror = function () { URL.revokeObjectURL(url); aviso('Ese archivo no es una imagen valida.'); };
        img.src = url;
      });
      inp.click();
    }
    pintarFoto();

    w.querySelector('#us-save').addEventListener('click', function () {
      function g(id) { var el = w.querySelector(id); return el ? el.value.trim() : ''; }
      var body = {
        eyebrow: g('#us-e'),
        title: g('#us-t'),
        description: g('#us-d'),
        href: g('#us-h'),
        image: foto,
        activo: !!w.querySelector('#us-a').checked,
      };
      if (!body.title) { aviso('El titulo es obligatorio.'); return; }
      if (!body.description) { aviso('La descripcion es obligatoria.'); return; }
      var boton = w.querySelector('#us-save');
      boton.disabled = true; boton.textContent = 'Guardando...';
      var p = esNuevo
        ? UN.api('/api/servicios', { method: 'POST', body: body })
        : UN.api('/api/servicios/' + encodeURIComponent(s.id), { method: 'PUT', body: body });
      p.then(function () {
        closeModal();
        if (typeof UN.notifyCatalog === 'function') UN.notifyCatalog();
        if (typeof window.__unReloadServicios === 'function') window.__unReloadServicios();
        aviso(esNuevo ? 'Servicio agregado.' : 'Servicio actualizado.');
      }).catch(function (e) {
        aviso('No se pudo guardar: ' + ((e && e.message) || ''));
        boton.disabled = false; boton.textContent = 'Guardar';
      });
    });
  }

  ensureCss();
  barra();
})();
