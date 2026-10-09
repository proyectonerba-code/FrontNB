/* Grupo NERBA HIDALGO - Avisos personalizados.
   El admin o superadmin crea notificaciones con titulo, texto e imagen
   opcional, y elige a quien van. El destinatario las ve en la campana del
   header y al tocarlas se abren en una ventanita. */
(function () {
  if (!window.UN) return;
  var KEY = 'nerba_avisos_v1';
  var ROLES = [
    ['TODOS', 'Todos los usuarios'],
    ['CLIENTE', 'Solo clientes'],
    ['ADMIN', 'Solo administradores'],
    ['SUPERADMIN', 'Solo super administradores'],
    ['PRODUCTOS_ELECTRONICOS', 'Solo productos electronicos'],
    ['PROYECTOS_ESPECIALES', 'Solo proyectos especiales'],
    ['STAFF', 'Todo el personal (todos los roles internos)']
  ];
  var STAFF_ROLES = ['ADMIN', 'SUPERADMIN', 'PRODUCTOS_ELECTRONICOS', 'PROYECTOS_ESPECIALES'];
  function leer() {
    try { var l = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; }
  }
  function guardar(l) {
    try { localStorage.setItem(KEY, JSON.stringify(l)); return true; } catch (e) { return false; }
  }
  function rol() { return String((UN.getUser() || {}).rol || '').toUpperCase(); }
  function yoEmail() { return String((UN.getUser() || {}).email || '').toLowerCase(); }
  function esCreador() { return rol() === 'ADMIN' || rol() === 'SUPERADMIN'; }
  function esc(s) { return UN.esc(s); }
  function ahoraISO() { return new Date().toISOString(); }
  function nuevoId() { return 'av-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function etiquetaRol(v) {
    for (var i = 0; i < ROLES.length; i++) { if (ROLES[i][0] === v) return ROLES[i][1]; }
    return v;
  }
  function etiquetaDestinoServidor(a) {
    var d = (a && a.destino) || { tipo: 'todos' };
    if (!d || d.tipo === 'todos') return 'Todos los usuarios';
    if (d.tipo === 'roles') return 'Roles: ' + ((d.roles || []).join(', ') || '—');
    if (d.tipo === 'emails') return 'Correos: ' + ((d.emails || []).slice(0, 3).join(', ') || '—') + (((d.emails || []).length > 3) ? '…' : '');
    return 'Todos los usuarios';
  }
  // "Dirigido a" del modal -> destino del servidor.
  function destinoParaServidor(para) {
    var p = String(para || 'TODOS').toUpperCase();
    if (p === 'TODOS') return { tipo: 'todos' };
    if (p === 'STAFF') return { tipo: 'roles', roles: ['ADMIN', 'SUPERADMIN', 'PRODUCTOS_ELECTRONICOS', 'PROYECTOS_ESPECIALES'] };
    return { tipo: 'roles', roles: [p] };
  }
  function coincide(a, u) {
    var r = String(u && u.rol ? u.rol : '').toUpperCase();
    if (a.para === 'TODOS') return true;
    if (a.para === 'STAFF') return STAFF_ROLES.indexOf(r) >= 0;
    if (a.para === 'CLIENTE') return !r || r === 'CLIENTE';
    return a.para === r;
  }
  function css() {
    if (document.getElementById('unAv-css')) return;
    var st = document.createElement('style');
    st.id = 'unAv-css';
    st.textContent =
      '.unAv-modal{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,.62);padding:16px;overflow:auto}' +
      '.unAv-modal.hidden{display:none}' +
      '.unAv-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 24px 60px -12px rgba(15,23,42,.35);width:100%;max-width:520px;max-height:92vh;overflow-y:auto}' +
      '.unAv-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 22px;border-bottom:1px solid #f1f5f9}' +
      '.unAv-head b{font-size:17px;color:#0f172a;font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.unAv-x{width:32px;height:32px;border:1px solid #e2e8f0;border-radius:9px;background:#fff;color:#64748b;cursor:pointer;font-size:16px;line-height:1;padding:0;flex-shrink:0}' +
      '.unAv-x:hover{border-color:#d91b1b;color:#d91b1b}' +
      '.unAv-body{padding:20px 22px;display:flex;flex-direction:column;gap:14px}' +
      '.unAv-lab{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#475569;display:block;margin-bottom:6px}' +
      '.unAv-body input[type=text],.unAv-body select,.unAv-body textarea{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;font-size:14px;color:#0f172a;background:#fff;box-sizing:border-box;font-family:Inter,system-ui,sans-serif}' +
      '.unAv-body input:focus,.unAv-body select:focus,.unAv-body textarea:focus{outline:none;border-color:#d91b1b}' +
      '.unAv-body textarea{min-height:110px;resize:vertical}' +
      '.unAv-foot{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid #f1f5f9;flex-wrap:wrap}' +
      '.unAv-ghost{display:inline-flex;align-items:center;gap:8px;background:#fff;color:#334155;font-size:12px;font-weight:700;padding:10px 14px;border-radius:10px;border:1px solid #e2e8f0;cursor:pointer;font-family:Inter,system-ui,sans-serif}' +
      '.unAv-ghost:hover{border-color:#d91b1b;color:#d91b1b}' +
      '.unAv-red{display:inline-flex;align-items:center;gap:8px;background:#d91b1b;color:#fff;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:11px 18px;border-radius:10px;border:0;cursor:pointer;font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.unAv-red:hover{background:#b0000b}' +
      '.unAv-imgbox{border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;padding:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}' +
      '.unAv-imgbox img{width:88px;height:88px;object-fit:cover;border-radius:10px;border:1px solid #e2e8f0;background:#fff}' +
      '.unAv-lista{display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto}' +
      '.unAv-item{display:flex;align-items:center;gap:10px;border:1px solid #e2e8f0;border-radius:10px;padding:9px 11px}' +
      '.unAv-item img{width:38px;height:38px;object-fit:cover;border-radius:7px;flex-shrink:0}' +
      '.unAv-item div{flex:1;min-width:0}' +
      '.unAv-item b{display:block;font-size:13px;color:#0f172a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.unAv-item small{font-size:11px;color:#64748b}' +
      '.unAv-vacio{font-size:13px;color:#94a3b8;text-align:center;padding:14px 0}' +
      '.unAv-ver-body{padding:20px 22px;display:flex;flex-direction:column;gap:12px}' +
      '.unAv-ver-body img{width:100%;max-height:320px;object-fit:contain;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}' +
      '.unAv-ver-body p{font-size:14px;line-height:1.6;color:#334155;white-space:pre-wrap;margin:0}' +
      '.unAv-ver-meta{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#b0000b}' +
      'html.dark-mode .unAv-card,html.dark .unAv-card{background:#0f172a;border-color:#334155}' +
      'html.dark-mode .unAv-head,html.dark .unAv-head{border-color:#1e293b}' +
      'html.dark-mode .unAv-head b,html.dark .unAv-head b{color:#f1f5f9}' +
      'html.dark-mode .unAv-x,html.dark .unAv-x{background:#1e293b;border-color:#334155;color:#cbd5e1}' +
      'html.dark-mode .unAv-foot,html.dark .unAv-foot{border-color:#1e293b}' +
      'html.dark-mode .unAv-ghost,html.dark .unAv-ghost{background:#1e293b;border-color:#334155;color:#e2e8f0}' +
      'html.dark-mode .unAv-lab,html.dark .unAv-lab{color:#cbd5e1}' +
      'html.dark-mode .unAv-body input[type=text],html.dark-mode .unAv-body select,html.dark-mode .unAv-body textarea,html.dark .unAv-body input[type=text],html.dark .unAv-body select,html.dark .unAv-body textarea{background:#1e293b;border-color:#334155;color:#f1f5f9}' +
      'html.dark-mode .unAv-imgbox,html.dark .unAv-imgbox{background:#1e293b;border-color:#334155}' +
      'html.dark-mode .unAv-item,html.dark .unAv-item{border-color:#334155}' +
      'html.dark-mode .unAv-item b,html.dark .unAv-item b{color:#f1f5f9}' +
      'html.dark-mode .unAv-item small,html.dark .unAv-item small{color:#94a3b8}' +
      'html.dark-mode .unAv-ver-body p,html.dark .unAv-ver-body p{color:#e2e8f0}' +
      'html.dark-mode .unAv-vacio,html.dark .unAv-vacio{color:#64748b}';
    document.head.appendChild(st);
  }
  function achicar(file, cb) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) { cb(null); return; }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      try {
        var lado = Math.max(img.width, img.height) || 1;
        var s = Math.min(1, 1000 / lado);
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * s));
        c.height = Math.max(1, Math.round(img.height * s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        cb(c.toDataURL('image/jpeg', 0.85));
      } catch (e) { URL.revokeObjectURL(url); cb(null); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  function montar() {
    if (document.getElementById('unAv-crear')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="unAv-modal hidden" id="unAv-crear"><div class="unAv-card">' +
      '<div class="unAv-head"><b>Nuevo aviso</b><button type="button" class="unAv-x" data-cerrar>&times;</button></div>' +
      '<div class="unAv-body">' +
      '<div><label class="unAv-lab" for="unAv-tit">Titulo</label>' +
      '<input type="text" id="unAv-tit" maxlength="90" placeholder="Ej. Mantenimiento programado sabado"></div>' +
      '<div><label class="unAv-lab" for="unAv-txt">Contenido</label>' +
      '<textarea id="unAv-txt" maxlength="1200" placeholder="Escribe el mensaje que veran los destinatarios"></textarea></div>' +
      '<div><label class="unAv-lab" for="unAv-para">Dirigido a</label>' +
      '<select id="unAv-para">' + ROLES.map(function (r) { return '<option value="' + r[0] + '">' + esc(r[1]) + '</option>'; }).join('') + '</select></div>' +
      '<div><label class="unAv-lab">Imagen (opcional)</label>' +
      '<div class="unAv-imgbox"><img id="unAv-prev" alt="Vista previa" style="display:none">' +
      '<input type="file" id="unAv-file" accept="image/*" style="display:none">' +
      '<button type="button" class="unAv-ghost" id="unAv-imgbtn">Elegir imagen</button>' +
      '<button type="button" class="unAv-ghost" id="unAv-imgrm" style="display:none">Quitar</button></div></div>' +
      '<div><label class="unAv-lab">Avisos creados</label><div class="unAv-lista" id="unAv-lista"></div></div>' +
      '</div>' +
      '<div class="unAv-foot"><button type="button" class="unAv-ghost" data-cerrar>Cancelar</button>' +
      '<button type="button" class="unAv-red" id="unAv-enviar">Publicar aviso</button></div></div></div>' +
      '<div class="unAv-modal hidden" id="unAv-ver"><div class="unAv-card">' +
      '<div class="unAv-head"><b id="unAv-ver-tit">Aviso</b><button type="button" class="unAv-x" data-cerrar-ver>&times;</button></div>' +
      '<div class="unAv-ver-body"><span class="unAv-ver-meta" id="unAv-ver-meta"></span>' +
      '<img id="unAv-ver-img" alt="Imagen del aviso" style="display:none">' +
      '<p id="unAv-ver-txt"></p></div>' +
      '<div class="unAv-foot"><button type="button" class="unAv-ghost" data-cerrar-ver>Entendido</button></div></div></div>';
    var tmp = document.createElement('div');
    tmp.innerHTML = wrap.innerHTML;
    while (tmp.firstChild) document.body.appendChild(tmp.firstChild);
    var imgActual = '';
    var file = document.getElementById('unAv-file');
    var prev = document.getElementById('unAv-prev');
    var rm = document.getElementById('unAv-imgrm');
    document.getElementById('unAv-imgbtn').addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      achicar(f, function (url) {
        if (!url) { try { if (window.aviso) aviso('No se pudo leer esa imagen. Prueba con JPG o PNG.', 'error'); } catch (e) {} return; }
        imgActual = url;
        prev.src = url;
        prev.style.display = 'block';
        rm.style.display = '';
      });
    });
    rm.addEventListener('click', function () {
      imgActual = '';
      file.value = '';
      prev.removeAttribute('src');
      prev.style.display = 'none';
      rm.style.display = 'none';
    });
    Array.prototype.slice.call(document.querySelectorAll('#unAv-crear [data-cerrar]')).forEach(function (b) {
      b.addEventListener('click', function () { document.getElementById('unAv-crear').classList.add('hidden'); });
    });
    Array.prototype.slice.call(document.querySelectorAll('#unAv-ver [data-cerrar-ver]')).forEach(function (b) {
      b.addEventListener('click', function () { document.getElementById('unAv-ver').classList.add('hidden'); });
    });
    document.getElementById('unAv-enviar').addEventListener('click', function () { publicar(); });
    pintarLista();
    function publicar() {
      var tit = (document.getElementById('unAv-tit').value || '').trim();
      var txt = (document.getElementById('unAv-txt').value || '').trim();
      var para = document.getElementById('unAv-para').value;
      if (!tit) { try { aviso('Escribe un titulo para el aviso.', 'error'); } catch (e) {} return; }
      if (!txt) { try { aviso('Escribe el contenido del aviso.', 'error'); } catch (e) {} return; }
      // El aviso vive en el SERVIDOR para que llegue a cualquier PC o celular.
      // Antes se guardaba solo en localStorage de este navegador y nadie más
      // lo veía: ese era el fallo.
      var btn = document.getElementById('unAv-enviar');
      if (btn) btn.disabled = true;
      UN.api('/api/avisos', {
        method: 'POST',
        body: {
          titulo: tit, mensaje: txt, imagen: imgActual || undefined,
          destino: destinoParaServidor(para),
        },
      }).then(function () {
        document.getElementById('unAv-tit').value = '';
        document.getElementById('unAv-txt').value = '';
        imgActual = '';
        file.value = '';
        prev.removeAttribute('src');
        prev.style.display = 'none';
        rm.style.display = 'none';
        pintarLista();
        try { aviso('Aviso publicado. Llegará a la campana en unos segundos.', 'ok'); } catch (e) {}
        try { if (UN.checkCatalog) UN.checkCatalog(); } catch (e2) {}
      }).catch(function (err) {
        try { aviso('No se pudo publicar: ' + ((err && err.message) || 'error de red'), 'error'); } catch (e) {}
      }).then(function () {
        if (btn) btn.disabled = false;
      });
    }
    // La lista del modal sale del servidor (lo que YO publiqué); si el
    // servidor no responde, se muestra el historial local anterior.
    function pintarLista() {
      var box = document.getElementById('unAv-lista');
      if (!box) return;
      var yo = yoEmail();
      function pinta(arr, titulo) {
        if (!arr.length) { box.innerHTML = '<div class="unAv-vacio">Todavia no has creado avisos.</div>'; return; }
        box.innerHTML = (titulo ? '<div class="unAv-vacio">' + esc(titulo) + '</div>' : '') + arr.map(function (a) {
          var f = '';
          try { f = new Date(a.fecha || a.creada).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) {}
          var img = a.img || a.imagen;
          var dest = a.destino ? etiquetaDestinoServidor(a) : etiquetaRol(a.para);
          return '<div class="unAv-item">' + (img ? '<img src="' + esc(img) + '" alt="">' : '') +
            '<div><b>' + esc(a.titulo) + '</b><small>' + esc(dest) + ' &middot; ' + esc(f) + '</small></div>' +
            '<button type="button" class="unAv-ghost" data-borrar="' + esc(a.id) + '">Borrar</button></div>';
        }).join('');
        Array.prototype.slice.call(box.querySelectorAll('[data-borrar]')).forEach(function (b) {
          b.addEventListener('click', function () {
            var id = b.getAttribute('data-borrar');
            UN.api('/api/avisos/' + encodeURIComponent(id), { method: 'DELETE' }).then(function () {
              pintarLista();
            }).catch(function () {
              // No estaba en el servidor (aviso viejo solo-local): se quita local.
              guardar(leer().filter(function (x) { return x.id !== id; }));
              pintarLista();
            });
          });
        });
      }
      UN.api('/api/avisos').then(function (data) {
        var arr = Array.isArray(data) ? data : [];
        var mios = arr.filter(function (a) {
          var em = a.creadaPor && a.creadaPor.email;
          return em && yo && String(em).toLowerCase() === yo;
        });
        pinta(mios);
      }).catch(function () {
        pinta(leer());
      });
    }
  }
  function abrirCrear() {
    if (!esCreador()) return;
    montar();
    document.getElementById('unAv-crear').classList.remove('hidden');
  }
  function abrirVer(id) {
    var a = null;
    var l = leer();
    for (var i = 0; i < l.length; i++) { if (l[i].id === id) { a = l[i]; break; } }
    // Si no está en local, viene del servidor (campana en otra PC): se busca
    // en el caché del último polling y se adapta a la ventanita.
    if (!a) {
      try {
        var srv = window.__avisosSrv || [];
        for (var j = 0; j < srv.length; j++) {
          if (String(srv[j].id) === String(id)) {
            var s = srv[j];
            a = {
              id: s.id, titulo: s.titulo, texto: s.mensaje || s.texto,
              img: s.imagen || s.img, fecha: s.creada || s.fecha,
              para: null, destino: s.destino, remoto: true,
            };
            break;
          }
        }
      } catch (eSrv) {}
    }
    if (!a) return;
    montar();
    document.getElementById('unAv-ver-tit').textContent = a.titulo || 'Aviso';
    var meta = a.destino ? etiquetaDestinoServidor(a) : etiquetaRol(a.para);
    var f = '';
    try { f = new Date(a.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
    document.getElementById('unAv-ver-meta').textContent = (meta + (f ? ' · ' + f : ''));
    var img = document.getElementById('unAv-ver-img');
    if (a.img) { img.src = a.img; img.style.display = 'block'; } else { img.removeAttribute('src'); img.style.display = 'none'; }
    document.getElementById('unAv-ver-txt').textContent = a.texto || '';
    document.getElementById('unAv-ver').classList.remove('hidden');
    var em = yoEmail();
    if (em && (a.leidoPor || []).indexOf(em) < 0) {
      a.leidoPor = (a.leidoPor || []).concat([em]);
      guardar(l);
    }
  }
  css();
  window.AVISOS = {
    abrirCrear: abrirCrear,
    abrirVer: abrirVer,
    para: function (u) {
      var user = u || UN.getUser() || {};
      return leer().filter(function (a) { return coincide(a, user); }).map(function (a) {
        var em = String(user.email || '').toLowerCase();
        return {
          id: a.id, titulo: a.titulo, texto: a.texto, img: a.img, fecha: a.fecha,
          leida: (a.leidoPor || []).indexOf(em) >= 0
        };
      });
    },
    marcarLeido: function (id) { abrirVer(id); }
  };
  // Sin sincronización destructiva: la lista local es el historial del modal y
  // la campana lee del servidor vía pollAvisos (unidos.js). Sobrescribir local
  // con lo del servidor corrompía ambos formatos.
  try {
    if (window.UN && UN.ensureMenuRol) { /* el header lo pinta unidos.js */ }
  } catch (e) {}
})();
