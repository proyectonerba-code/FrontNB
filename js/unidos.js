/* Grupo NERBA HIDALGO - Conector con el backend real (Node.js :8080).
   No altera los disenos: solo reescribe enlaces, sesion y datos. */
(function () {
  // Orden: 1) window.__NERBA_API (deploy separado: Netlify -> Railway),
  // 2) localStorage 'unidos_api' (override manual), 3) mismo origen (dev local).
  var API = window.__NERBA_API || localStorage.getItem('unidos_api') || (location.origin && location.origin !== 'null' ? location.origin : 'http://localhost:8080');
  var BRAND_NAME = 'Grupo NERBA HIDALGO';
  var BRAND_SUBTITLE = 'Grupo empresarial Nerba s.a de c.v';
  var BRAND_ALT = BRAND_NAME + ' Logo';
  function normalizeText(value) {
    var text = String(value == null ? '' : value);
    try { text = text.normalize('NFKD'); } catch (e) {}
    return text
      .replace(/ß/g, 'ss')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }
  function compactText(value) { return normalizeText(value).replace(/\s+/g, ''); }
  function searchableText(value) {
    if (Array.isArray(value)) return value.map(searchableText).join(' ');
    if (value && typeof value === 'object') return Object.keys(value).map(function (key) { return searchableText(value[key]); }).join(' ');
    return normalizeText(value);
  }
  function matchesText(value, query) {
    var needle = normalizeText(query);
    if (!needle) return true;
    var hay = searchableText(value);
    var compactHay = hay.replace(/\s+/g, '');
    if (hay.indexOf(needle) >= 0 || compactHay.indexOf(compactText(needle)) >= 0) return true;
    return needle.split(/\s+/).filter(Boolean).every(function (token) {
      return hay.indexOf(token) >= 0 || compactHay.indexOf(compactText(token)) >= 0;
    });
  }
  var BRAND_REPLACEMENTS = [
    'UNIDOS NERBA S.A. de C.V.',
    'UNIDOS NERBA S.A.C.',
    'UNIDOS NERBA INGENIERÍA',
    'Unidos Nerba Seguridad Integral S.A. de C.V.',
    'Unidos Nerba S.A. de C.V.',
    'Unidos Nerba S.A.C.',
    'UNIDOS NERBA',
    'Unidos Nerba',
    'Grupo Nerba',
    'Grupo nerba',
    'Nerba Smart Space & Hardware Control',
    'Nerba Logo',
    'SuperAdmin Nerba',
    'Admin Nerba',
  ];
  var BRAND_SUBTITLES = {
    'Seguridad Integral': BRAND_SUBTITLE,
    'seguridad Integral': BRAND_SUBTITLE,
    'seguridad INTEGRAL': BRAND_SUBTITLE,
    'COMPONENTES & HARDWARE': BRAND_SUBTITLE,
    'Componentes & Hardware': BRAND_SUBTITLE,
    'Ingeniería & Seguridad Integral': BRAND_SUBTITLE,
    'Ingenieria & Seguridad Integral': BRAND_SUBTITLE,
    'INGENIERÍA & SEGURIDAD INTEGRAL': BRAND_SUBTITLE,
    'Seguridad Integral & Videovigilancia': BRAND_SUBTITLE,
    'Seguridad Integral para Infraestructuras Estratégicas': BRAND_SUBTITLE,
    'una extension de Grupo nerba': BRAND_SUBTITLE,
  };
  var TEXT_REPAIRS = [
    ['L�deres', 'Líderes'], ['ingenier�a', 'ingeniería'], ['electr�nica', 'electrónica'], ['electr�nicos', 'electrónicos'], ['tecnolog�a', 'tecnología'],
    ['CERTIFICACI�N', 'CERTIFICACIÓN'], ['Informaci�n', 'Información'], ['informaci�n', 'información'], ['Configuraci�n', 'Configuración'], ['configuraci�n', 'configuración'],
    ['navegaci�n', 'navegación'], ['validaci�n', 'validación'], ['supervisi�n', 'supervisión'], ['Edici�n', 'Edición'], ['edici�n', 'edición'], ['Descripci�n', 'Descripción'],
    ['Publicaci�n', 'Publicación'], ['Sesi�n', 'Sesión'], ['sesi�n', 'sesión'], ['Contrase�a', 'Contraseña'], ['contrase�a', 'contraseña'], ['contrasena', 'contraseña'], ['Contrasena', 'Contraseña'], ['M�ximo', 'Máximo'], ['m�ximo', 'máximo'], ['M�nimo', 'Mínimo'], ['m�nimo', 'mínimo'],
    ['Fotograf�a', 'Fotografía'], ['fotograf�a', 'fotografía'], ['Funci�n', 'Función'], ['bot�n', 'botón'], ['Est�ndar', 'Estándar'], ['Visi�n', 'Visión'], ['ergon�micos', 'ergonómicos'], ['crom�tico', 'cromático'], ['Dise�o', 'Diseño'], ['dise�o', 'diseño'],
    ['t�cnico', 'técnico'], ['t�cnica', 'técnica'], ['T�cnico', 'Técnico'], ['T�cnica', 'Técnica'], ['operaci�n', 'operación'], ['Operaci�n', 'Operación'], ['p�blico', 'público'], ['P�blico', 'Público'],
    ['Protanop�a', 'Protanopía'], ['Deuteranop�a', 'Deuteranopía'], ['Tritanop�a', 'Tritanopía'], ['d�ficit', 'déficit'], ['Din�micas', 'Dinámicas'], ['criptogr�fica', 'criptográfica'], ['criptogr�fico', 'criptográfico'], ['Administraci�n', 'Administración'], ['atenci�n', 'atención'], ['protecci�n', 'protección'], ['autenticaci�n', 'autenticación'], ['identificaci�n', 'identificación'], ['selecci�n', 'selección'],
    ['par�metros', 'parámetros'], ['seg�n', 'según'], ['recepci�n', 'recepción'], ['Tama�o', 'Tamaño'], ['tama�o', 'tamaño'], ['iluminaci�n', 'iluminación'], ['m�vil', 'móvil'], ['Raz�n', 'Razón'], ['Tel�fono', 'Teléfono'], ['Electr�nico', 'Electrónico'], ['animaci�n', 'animación'], ['Tipogr�fica', 'Tipográfica'], ['n�meros', 'números'], ['matr�cula', 'matrícula'], ['Peque�o', 'Pequeño'], ['PREVISUALIZACI�N', 'PREVISUALIZACIÓN'], ['Previsualizaci�n', 'Previsualización'], ['leer�n', 'leerán'], ['bit�coras', 'bitácoras'], ['detecci�n', 'detección'], ['el�ctrico', 'eléctrico'], ['El�ctrico', 'Eléctrico'], ['Crom�tica', 'Cromática'], ['cr�ticas', 'críticas'], ['r�pida', 'rápida'], ['discriminaci�n', 'discriminación'], ['D�ficit', 'Déficit'], ['Navegaci�n', 'Navegación'], ['cin�ticas', 'cinéticas'], ['acci�n', 'acción'], ['Sincronizaci�n', 'Sincronización'], ['autom�tica', 'automática'], ['D�AS', 'DÍAS'], ['Biom�trico', 'Biométrico'], ['Automatizaci�n', 'Automatización'], ['Telemetr�a', 'Telemetría'], ['Qui�nes', 'Quiénes'], ['L�NEA', 'LÍNEA'], ['Ju�rez', 'Juárez'], ['M�xico', 'México'], ['M�xi', 'Méxi'], ['AI � Zona', 'AI · Zona'], ['� 2025', '© 2025'], ['� 2026', '© 2026'], ['�Desea', '¿Desea'], ['�rea', 'Área'], ['As�', 'Así'], ['�mbar', 'Ámbar'], ['�ndice', 'Índice'], ['Cat�logo', 'Catálogo'], ['cat�logo', 'catálogo'], ['L�deres', 'Líderes'], ['administraci�n', 'administración'], ['Administraci�n', 'Administración'], ['emisi�n', 'emisión'], ['sincronizaci�n', 'sincronización'], ['auditor�a', 'auditoría'], ['Auditor�a', 'Auditoría'], ['Per�', 'Perú'], ['visualizar�n', 'visualizarán'], ['instalaci�n', 'instalación'], ['cr�tica', 'crítica'], ['comunicaci�n', 'comunicación'], ['generaci�n', 'generación'], ['gesti�n', 'gestión'], ['l�nea', 'línea'], ['L�nea', 'Línea'], ['recepci�n', 'recepción'], ['protecci�n', 'protección'], ['supervisi�n', 'supervisión'], ['SUPERVISI�N', 'SUPERVISIÓN'], ['tecnolog�a', 'tecnología'], ['el�ctrica', 'eléctrica'], ['El�ctrica', 'Eléctrica']
  ];
  function repairText(value) {
    var text = String(value == null ? '' : value);
    TEXT_REPAIRS.forEach(function (item) { text = text.split(item[0]).join(item[1]); });
    return text;
  }
  function wrapTextApis() {
    ['alert', 'confirm', 'prompt'].forEach(function (name) {
      if (typeof window[name] !== 'function') return;
      var original = window[name];
      window[name] = function () {
        var args = Array.prototype.slice.call(arguments).map(repairText);
        return original.apply(window, args);
      };
    });
    if (typeof window.showToast === 'function') {
      var originalToast = window.showToast;
      window.showToast = function (message, title) { return originalToast.call(this, repairText(message), repairText(title)); };
    }
  }
  function brandText(value) {
    var text = repairText(value);
    text = text.replace(/\bGRUPO NERBA\b(?! HIDALGO)/gi, BRAND_NAME);
    BRAND_REPLACEMENTS.forEach(function (item) {
      text = text.split(item).join(BRAND_NAME);
    });
    return text;
  }
  function applyBrand() {
    if (!document.body) return;
    (function walk(node) {
      var child = node.firstChild;
      while (child) {
        var next = child.nextSibling;
        if (child.nodeType === 3) {
          var value = child.nodeValue;
          var normalized = value.replace(/\s+/g, ' ').trim();
          var replacement = BRAND_SUBTITLES[normalized];
          if (normalized === 'NERBA' || normalized === 'Nerba') value = BRAND_NAME;
          else if (replacement) value = value.replace(normalized, replacement);
          var branded = brandText(value);
          if (branded !== value) child.nodeValue = branded;
        } else if (child.nodeType === 1 && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE' && child.tagName !== 'NOSCRIPT') {
          ['alt', 'aria-label', 'title', 'placeholder'].forEach(function (attribute) {
            if (!child.hasAttribute(attribute)) return;
            var current = child.getAttribute(attribute);
            var nextValue = brandText(current);
            if (nextValue !== current) child.setAttribute(attribute, nextValue);
          });
          walk(child);
        }
        child = next;
      }
    })(document.body);
    document.title = 'GRUPO NERBA HIDALGO';
    ['alt', 'aria-label', 'title', 'placeholder'].forEach(function (attribute) {
      var el = document.querySelector('[' + attribute + ']');
      if (el) el.setAttribute(attribute, brandText(el.getAttribute(attribute)));
    });
  }
  function watchBrand() {
    if (window.__unBrandObserver || !window.MutationObserver || !document.body) return;
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; applyBrand(); }, 0);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.__unBrandObserver = observer;
  }

  async function api(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    var t = localStorage.getItem('unidos_token');
    if (t) headers['Authorization'] = 'Bearer ' + t;
    var res = await fetch(API + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    var data = {};
    try { data = await res.json(); } catch (e) { data = {}; }
    if (!res.ok) {
      var err = new Error(data.error || ('Error ' + res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function getUser() {
    try {
      var user = JSON.parse(localStorage.getItem('unidos_user') || 'null');
      if (user && user.lastLogin) {
        user.lastLogin = { fecha: user.lastLogin.fecha || '', hora: user.lastLogin.hora || '' };
      }
      return user;
    } catch (e) { return null; }
  }
  function setSession(token, u) {
    if (token) localStorage.setItem('unidos_token', token);
    if (u) localStorage.setItem('unidos_user', JSON.stringify(u));
    // Hereda el tema de LA CUENTA desde el servidor: solo en login fresco
    // o si aun no hay preferencia local. Nunca pisa un toggle reciente
    // con un dato viejo del servidor.
    try {
      if (u && (u.tema === 'dark' || u.tema === 'light') && window.UN_TEMA) {
        var fresh = false;
        try {
          fresh = sessionStorage.getItem('un_fresh_login') === '1';
          sessionStorage.removeItem('un_fresh_login');
        } catch (e0) {}
        var has = false;
        try { has = !!localStorage.getItem(UN_TEMA.key()); } catch (e1) {}
        if (fresh || !has) UN_TEMA.set(u.tema);
      }
    } catch (e) {}
  }
  function profilePhotoKey(user) {
    var u = user || getUser() || {};
    return u && u.email ? 'nerba_profile_photo::' + String(u.email).toLowerCase() : '';
  }
  function profileInitials(user) {
    return String((user && user.nombre) || 'UN').trim().split(/\s+/).slice(0, 2).map(function (word) { return word.charAt(0); }).join('').toUpperCase() || 'UN';
  }
  function paintProfileAvatars() {
    var u = getUser() || {};
    var key = profilePhotoKey(u);
    var photo = '';
    try { photo = key ? (localStorage.getItem(key) || '') : ''; } catch (e) {}
    var fallback = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileInitials(u)) + '&background=b0000b&color=fff&bold=true';
    Array.prototype.slice.call(document.querySelectorAll('#unZh-avatar, #profile-photo')).forEach(function (img) {
      img.src = photo || fallback;
      img.alt = u.nombre || 'Usuario';
    });
  }
  function getProfilePhoto() {
    var key = profilePhotoKey();
    if (!key) return '';
    try { return localStorage.getItem(key) || ''; } catch (e) { return ''; }
  }
  function setProfilePhoto(value) {
    var key = profilePhotoKey();
    if (!key || typeof value !== 'string' || value.indexOf('data:image/') !== 0) return false;
    try { localStorage.setItem(key, value); } catch (e) { return false; }
    paintProfileAvatars();
    return true;
  }
  function clearProfilePhoto() {
    var key = profilePhotoKey();
    if (key) { try { localStorage.removeItem(key); } catch (e) {} }
    paintProfileAvatars();
  }
  // Achica la foto a 256px JPEG antes de guardarla: la foto original de celular
  // (varios MB) no cabe en el localStorage (tope ~5MB por origen) y mucho menos
  // viaja bien al servidor. A 256px pesa 15-40KB y se ve igual en un avatar.
  function prepareProfilePhoto(file) {
    return new Promise(function (res) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) return res(null);
      if (file.size > 5 * 1024 * 1024) return res(null);
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var lado = Math.max(img.width, img.height) || 1;
          var s = Math.min(1, 256 / lado);
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * s));
          c.height = Math.max(1, Math.round(img.height * s));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          res(c.toDataURL('image/jpeg', 0.82));
        } catch (e) { try { URL.revokeObjectURL(url); } catch (e2) {} res(null); }
      };
      img.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) {} res(null); };
      img.src = url;
    });
  }
  // Guarda la foto en este navegador Y en el servidor, para que se vea igual
  // en todas las computadoras. El servidor manda (no bloquea la pantalla).
  function saveProfilePhoto(dataUrl) {
    if (!setProfilePhoto(dataUrl)) return Promise.resolve(false);
    try {
      return api('/api/me', { method: 'PUT', body: { foto: dataUrl } }).then(function () { return true; })
        .catch(function () { return true; });
    } catch (e) { return Promise.resolve(true); }
  }
  function deleteProfilePhoto() {
    clearProfilePhoto();
    try {
      return api('/api/me', { method: 'PUT', body: { foto: '' } }).catch(function () {});
    } catch (e) {}
    return Promise.resolve(true);
  }
  // Baja la foto del servidor si es distinta a la de este navegador. El
  // servidor manda: si se borró en otra computadora, aquí también se borra.
  function syncProfilePhoto(serverUser) {
    try {
      var srv = (serverUser && typeof serverUser.foto === 'string') ? serverUser.foto : null;
      if (srv === null) return;
      var key = profilePhotoKey();
      var local = '';
      try { local = key ? (localStorage.getItem(key) || '') : ''; } catch (e) {}
      if (srv !== local) {
        if (srv) { try { localStorage.setItem(key, srv); } catch (e) {} }
        else if (key) { try { localStorage.removeItem(key); } catch (e) {} }
        paintProfileAvatars();
        var img = document.getElementById('profile-photo');
        if (img) {
          var u = getUser() || {};
          img.src = srv || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(profileInitials(u)) + '&background=b0000b&color=fff&bold=true');
        }
      }
    } catch (e) {}
  }
  function clearLocalSession() {
    try {
      localStorage.removeItem('unidos_token');
      localStorage.removeItem('unidos_user');
      sessionStorage.removeItem('un_fresh_login');
    } catch (e) {}
    try {
      document.documentElement.classList.remove('dark', 'dark-mode');
      if (document.body) document.body.classList.remove('dark-mode');
    } catch (e) {}
  }
  var loggingOut = false;
  var logoutModalOpen = false;
  function confirmLogout() {
    if (logoutModalOpen) return Promise.resolve(false);
    logoutModalOpen = true;
    return new Promise(function (resolve) {
      var opener = document.activeElement;
      var dark = document.documentElement.classList.contains('dark');
      var oldOverflow = document.body ? document.body.style.overflow : '';
      var overlay = document.createElement('div');
      overlay.id = 'un-logout-modal';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'un-logout-title');
      overlay.setAttribute('aria-describedby', 'un-logout-description');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;background:rgba(8,15,28,.62);backdrop-filter:blur(5px);opacity:1;transition:opacity .16s ease';
      var dialog = document.createElement('div');
      dialog.setAttribute('tabindex', '-1');
      dialog.style.cssText = 'width:min(100%,420px);padding:24px;border:1px solid ' + (dark ? '#334155' : '#e2e8f0') + ';border-radius:18px;background:' + (dark ? '#111827' : '#ffffff') + ';color:' + (dark ? '#f8fafc' : '#0f172a') + ';box-shadow:0 24px 70px rgba(2,6,23,.32);transition:transform .16s ease,opacity .16s ease';
      dialog.innerHTML = '<div style="display:flex;align-items:flex-start;gap:14px">' +
        '<img src="/assets/logo.png" width="46" height="46" alt="NERBA" style="display:block;width:46px;height:46px;object-fit:contain;border-radius:13px;background:#fff;flex-shrink:0">' +
        '<div style="flex:1;min-width:0"><div style="display:inline-flex;align-items:center;padding:3px 7px;border-radius:5px;background:#fef2f2;color:#b91c1c;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Sesión segura</div>' +
        '<h2 id="un-logout-title" style="margin:0;font-size:20px;line-height:1.2;font-weight:800;letter-spacing:-.02em">¿Cerrar sesión?</h2>' +
        '<p id="un-logout-description" style="margin:7px 0 0;font-size:13px;line-height:1.5;color:' + (dark ? '#cbd5e1' : '#64748b') + '">Se cerrará tu sesión actual de forma segura en este dispositivo.</p></div>' +
        '<button type="button" id="un-logout-x" aria-label="Cerrar" style="width:32px;height:32px;border:0;border-radius:9px;background:' + (dark ? '#1e293b' : '#f1f5f9') + ';color:' + (dark ? '#cbd5e1' : '#64748b') + ';font-size:20px;line-height:1;cursor:pointer;flex-shrink:0">×</button></div>' +
        '<div style="display:flex;flex-direction:column;gap:9px;margin-top:22px">' +
        '<button type="button" id="un-logout-cancel" style="width:100%;padding:11px 14px;border:1px solid ' + (dark ? '#334155' : '#cbd5e1') + ';border-radius:10px;background:' + (dark ? '#0b1220' : '#f8fafc') + ';color:' + (dark ? '#e2e8f0' : '#334155') + ';font:800 12px Inter,system-ui,sans-serif;cursor:pointer">Cancelar</button>' +
        '<button type="button" id="un-logout-confirm" style="width:100%;padding:11px 14px;border:0;border-radius:10px;background:#b0000b;color:#fff;font:800 12px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 14px rgba(176,0,11,.2)">Cerrar sesión</button></div>';
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      var cancel = document.getElementById('un-logout-cancel');
      var accept = document.getElementById('un-logout-confirm');
      var close = function (result) {
        if (!overlay.parentNode) return;
        overlay.style.opacity = '0';
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = oldOverflow;
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 160);
        logoutModalOpen = false;
        resolve(!!result);
        if (result && opener && opener.focus) opener.focus();
      };
      var onKey = function (event) { if (event.key === 'Escape') close(false); };
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      cancel.addEventListener('click', function () { close(false); });
      accept.addEventListener('click', function () { close(true); });
      overlay.addEventListener('click', function (event) { if (event.target === overlay) close(false); });
      window.setTimeout(function () { accept.focus(); }, 30);
    });
  }
  async function logout(skipConfirm) {
    if (loggingOut) return;
    if (!skipConfirm) {
      var confirmed = await confirmLogout();
      if (!confirmed) return;
    }
    loggingOut = true;
    var token = localStorage.getItem('unidos_token');
    clearLocalSession();
    if (token) {
      try {
        var controller = typeof AbortController === 'function' ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { controller.abort(); }, 2500) : null;
        await fetch(API + '/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: '{}', keepalive: true, signal: controller ? controller.signal : undefined });
        if (timer) clearTimeout(timer);
      } catch (e) {}
    }
    location.replace('/index.html');
  }
  function requestLogout(event) {
    if (loggingOut) return;
    var control = event && event.currentTarget;
    confirmLogout().then(function (confirmed) {
      if (!confirmed) return;
      if (control) {
        control.disabled = true;
        control.setAttribute('aria-busy', 'true');
      }
      logout(true);
    });
  }
  function requireAuth(next) {
    if (!localStorage.getItem('unidos_token')) {
      location.href = '/login.html' + (next ? '?next=' + encodeURIComponent(next) : '');
      return false;
    }
    return true;
  }
  function requireStaff(next) {
    var u = getUser();
    if (!localStorage.getItem('unidos_token')) {
      location.href = '/login.html' + (next ? '?next=' + encodeURIComponent(next) : '');
      return false;
    }
    if (!u || (u.rol !== 'ADMIN' && u.rol !== 'SUPERADMIN')) {
      location.href = '/index.html';
      return false;
    }
    return true;
  }
  // Zona de SuperAdmin: rol aparte con interfaces propias (bitacora, usuarios...).
  // Comparte login; el cierre de sesion siempre vuelve al index.
  function requireSuperAdmin(next) {
    var u = getUser();
    if (!localStorage.getItem('unidos_token')) {
      location.href = '/login.html' + (next ? '?next=' + encodeURIComponent(next) : '');
      return false;
    }
    if (!u || u.rol !== 'SUPERADMIN') {
      var back = '/index.html';
      if (u && u.rol === 'ADMIN') back = '/admin/catalogo.html';
      else if (u && u.rol === 'PROYECTOS_ESPECIALES') back = '/especiales/gestion.html';
      location.href = back;
      return false;
    }
    return true;
  }
  // Zona de Proyectos Especiales: rol aparte del admin y del cliente.
  // El login es compartido; el cierre de sesion siempre vuelve al index.
  function requireEspeciales(next) {
    var u = getUser();
    if (!localStorage.getItem('unidos_token')) {
      location.href = '/login.html' + (next ? '?next=' + encodeURIComponent(next) : '');
      return false;
    }
    if (!u || (u.rol !== 'PROYECTOS_ESPECIALES' && u.rol !== 'SUPERADMIN')) {
      location.href = (u && u.rol === 'ADMIN') ? '/admin/catalogo.html' : ((u && u.rol === 'SUPERADMIN') ? '/superadmin/catalogo.html' : '/index.html');
      return false;
    }
    return true;
  }
  // Zona de Productos Electrónicos: espejo del admin, pero su bandeja trae
  // únicamente cotizaciones de productos electrónicos. Login compartido.
  function requireElec(next) {
    var u = getUser();
    if (!localStorage.getItem('unidos_token')) {
      location.href = '/login.html' + (next ? '?next=' + encodeURIComponent(next) : '');
      return false;
    }
    if (!u || (u.rol !== 'PRODUCTOS_ELECTRONICOS' && u.rol !== 'SUPERADMIN')) {
      location.href = (u && u.rol === 'ADMIN') ? '/admin/catalogo.html' : ((u && u.rol === 'PROYECTOS_ESPECIALES') ? '/especiales/gestion.html' : '/index.html');
      return false;
    }
    return true;
  }
  function money(n) {
    return Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Descarga real del presupuesto como documento imprimible (se puede guardar como PDF desde el navegador)
  // El documento de cotizacion se abre como blob:, y dentro de un blob una ruta
  // como /assets/logo.png no existe: sale la imagen rota. Por eso se resuelve a
  // una direccion completa contra el sitio actual.
  var UN_LOGO = new URL('/assets/logo.png', location.href).href;
  function fechaDoc(iso) {
    var p = String(iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(iso || '—');
  }
  // Al imprimir desde la pagina (no desde el PDF) solo sale el documento:
  // sin menus, sin footer, sin chatbot y sin repetir el fondo. Solo aplica
  // cuando hay un visor de cotizacion abierto (si no, la pagina imprime normal).
  function installPrintGuard() {
    if (document.getElementById('un-print-guard')) return;
    // [selector del visor, selector de "esta abierto"]
    var visores = [
      ['#un-quote-viewer', '#un-quote-viewer'],
      ['#pdfModal', '#pdfModal:not(.pointer-events-none)'],
      ['#modal-pdf-oficial', '#modal-pdf-oficial:not(.hidden)'],
      ['#modal-pdf', '#modal-pdf:not(.hidden)'],
      ['#un-print-area', '#un-print-area'],
    ];
    var plano = 'display:block!important;position:static!important;inset:auto!important;padding:0!important;' +
      'margin:0!important;background:#fff!important;backdrop-filter:none!important;box-shadow:none!important;' +
      'max-height:none!important;height:auto!important;overflow:visible!important;width:100%!important;border:0!important';
    var css = '@media print{html,body{background:#fff!important}';
    visores.forEach(function (v) {
      css += 'body:has(' + v[1] + ')>*:not(' + v[0] + '){display:none!important}' +
        'body:has(' + v[1] + ') ' + v[0] + '{' + plano + '}' +
        'body:has(' + v[1] + ') ' + v[0] + ' button,body:has(' + v[1] + ') ' + v[0] + ' [data-x],' +
        'body:has(' + v[1] + ') ' + v[0] + ' [data-dl],body:has(' + v[1] + ') ' + v[0] + ' [data-print]{display:none!important}';
    });
    css += '}';
    var st = document.createElement('style');
    st.id = 'un-print-guard';
    st.textContent = css;
    document.head.appendChild(st);
  }
  // Documento oficial con formato profesional (el que ven todos los PDF).
  // Hoja A4 real: cabe en 1-2 páginas, sin elementos de la web (chat, menús).
  function quoteDoc(c) {
    var f = fechaDoc(c.fecha);
    var items = Array.isArray(c.items) && c.items.length ? c.items : [];
    var totalU = items.reduce(function (n, i) { return n + (parseInt(i && i.qty, 10) || 1); }, 0);
    var detalle = String(c.descripcion || '').trim();
    // Si los productos ya van en tabla, la primera linea se repite en el texto.
    var filas = items.map(function (it, i) {
      var q = parseInt(it && it.qty, 10) || 1;
      var nom = String((it && it.title) || 'Componente').trim();
      var desc = String((it && it.desc) || '').trim();
      return '<tr><td class="c-n">' + (i + 1) + '</td><td><b>' + esc(nom) + '</b>' +
        (desc ? '<span class="c-d">' + esc(desc) + '</span>' : '') + '</td>' +
        '<td class="c-q">' + q + '</td><td class="c-q">' + (q === 1 ? 'unid.' : 'unid.') + '</td></tr>';
    }).join('');
    var tabla = filas
      ? '<table class="tb"><thead><tr><th class="c-n">#</th><th>Componente / producto solicitado</th><th class="c-q">Cant.</th><th class="c-u">Unidad</th></tr></thead><tbody>' + filas + '</tbody></table>' +
        '<div class="tfoot">Total de artículos: <b>' + items.length + '</b> · Total de unidades: <b>' + totalU + '</b></div>'
      : '<div class="box">' + esc(detalle || '—') + '</div>';
    var soloTexto = '';
    if (items.length) {
      var nt = String(c.notas || '').trim();
      if (nt) soloTexto = '<div class="sec"><h3>4. Notas y observaciones</h3><div class="box">' + esc(nt) + '</div></div>';
    }
    // Fotografías que adjuntó el cliente. Van en tira y con alto fijo: se ven
    // ordenadas en el documento y no se comen una hoja entera cada una.
    var fotos = Array.isArray(c.fotos) ? c.fotos.filter(function (s) {
      return typeof s === 'string' && s.indexOf('data:image/') === 0;
    }) : [];
    var bloqueFotos = fotos.length
      ? '<div class="sec"><h3>' + (items.length ? '5' : '4') + '. Fotografías del inmueble (' + fotos.length + ')</h3>' +
        '<div class="fotos">' + fotos.map(function (s, i) {
          return '<figure><img src="' + esc(s) + '" alt="Fotografía ' + (i + 1) + ' del inmueble">' +
            '<figcaption>Foto ' + (i + 1) + ' de ' + fotos.length + '</figcaption></figure>';
        }).join('') + '</div></div>'
      : '';
    return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>' + esc(c.folio) + ' - ' + esc(BRAND_NAME) + '</title>' +
      '<style>' +
      '@page{size:A4;margin:13mm 12mm}' +
      '*{box-sizing:border-box}' +
      'html,body{margin:0;padding:0;background:#fff;color:#0f172a}' +
      'body{font-family:"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.sheet{width:100%;max-width:186mm;margin:0 auto}' +
      '.head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}' +
      '.brand{display:flex;align-items:center;gap:9px}' +
      '.brand img{height:34px;width:auto;object-fit:contain}' +
      '.brand b{display:block;font-size:14px;color:#0b1c30;letter-spacing:.3px;line-height:1.15}' +
      '.brand small{display:block;font-size:8px;color:#b0000b;letter-spacing:1.6px;font-weight:700;text-transform:uppercase}' +
      '.req{text-align:right;flex-shrink:0}' +
      '.pill{display:inline-block;border:1px solid #f0c4bf;background:#fef4f3;color:#b0000b;border-radius:5px;padding:3px 10px;font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase}' +
      '.folio{font-size:15px;font-weight:800;color:#0b1c30;margin-top:5px;letter-spacing:.3px}' +
      '.fem{font-size:9.5px;color:#64748b;margin-top:2px}' +
      '.rule{border:none;border-top:2px solid #b0000b;margin:9px 0 12px}' +
      '.cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;break-inside:avoid}' +
      '.card{border:1px solid #e2e8f0;border-radius:7px;padding:9px 11px;background:#fbfcfe}' +
      '.card h4{margin:0 0 7px;font-size:9px;letter-spacing:1.1px;color:#b0000b;font-weight:800;text-transform:uppercase}' +
      '.kv{display:flex;justify-content:space-between;gap:8px;font-size:10.5px;padding:2.5px 0;border-bottom:1px dotted #e2e8f0}' +
      '.kv:last-child{border-bottom:0}' +
      '.kv i{font-style:normal;color:#64748b;flex-shrink:0}' +
      '.kv b{color:#0b1c30;font-weight:700;text-align:right;word-break:break-word}' +
      '.sec{margin:0 0 12px;break-inside:avoid}' +
      '.sec h3{font-size:9.5px;margin:0 0 7px;padding:5px 9px;background:#f1f5f9;border-left:3px solid #b0000b;border-radius:0 5px 5px 0;letter-spacing:.9px;text-transform:uppercase;color:#0b1c30}' +
      '.box{border:1px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:10.5px;line-height:1.6;white-space:pre-line;background:#f8fafc}' +
      '.tb{width:100%;border-collapse:collapse;font-size:10.5px}' +
      '.tb th{background:#0f172a;color:#fff;font-size:8.5px;letter-spacing:.8px;text-transform:uppercase;padding:6px 8px;text-align:left}' +
      '.tb th.c-n{width:8mm}.tb th.c-q{width:16mm}.tb th.c-u{width:16mm}' +
      '.tb td{padding:6px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}' +
      '.tb tbody tr:nth-child(even) td{background:#f8fafc}' +
      '.tb td.c-n,.tb td.c-q{text-align:center;color:#64748b}' +
      '.c-d{display:block;font-size:9px;color:#64748b;margin-top:1px}' +
      '.tfoot{text-align:right;font-size:9.5px;color:#64748b;margin-top:5px;padding-right:2px}' +
      '.fotos{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}' +
      '.fotos img{width:100%;height:30mm;object-fit:cover;border:1px solid #e2e8f0;border-radius:6px;display:block}' +
      '.fotos figure{margin:0;break-inside:avoid}' +
      '.fotos figcaption{font-size:7.5px;color:#94a3b8;text-align:center;padding-top:1.5mm}' +
      '.foot{margin-top:14px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:12px;font-size:8.5px;color:#94a3b8;break-inside:avoid}' +
      '@media print{body{font-size:10.5px}.sheet{max-width:none}}' +
      '</style></head><body><div class="sheet">' +
      '<div class="head"><div class="brand"><img src="' + UN_LOGO + '" alt="' + esc(BRAND_ALT) + '">' +
      '<div><b>' + esc(BRAND_NAME) + '</b><small>' + esc(BRAND_SUBTITLE) + '</small></div></div>' +
      '<div class="req"><span class="pill">Solicitud de cotización</span>' +
      '<div class="folio">' + esc(c.folio) + '</div>' +
      '<div class="fem">Fecha de emisión: <b>' + esc(f) + '</b>' + (c.validez ? ' · Válida hasta ' + esc(fechaDoc(c.validez)) : '') + '</div></div></div>' +
      '<hr class="rule">' +
      '<div class="cards">' +
      '<div class="card"><h4>Datos del solicitante</h4>' +
      '<div class="kv"><i>Titular</i><b>' + esc(c.nombre || '—') + '</b></div>' +
      '<div class="kv"><i>Teléfono</i><b>' + esc(c.telefono || '—') + '</b></div>' +
      '<div class="kv"><i>Correo</i><b>' + esc(c.email || '—') + '</b></div>' +
      (c.telefonoSec ? '<div class="kv"><i>Teléfono alt.</i><b>' + esc(c.telefonoSec) + '</b></div>' : '') +
      '</div>' +
      '<div class="card"><h4>Ubicación del inmueble</h4>' +
      '<div class="kv"><i>Tipo</i><b>' + esc(c.tipoInmueble || '—') + '</b></div>' +
      '<div class="kv"><i>Distrito / Ciudad</i><b>' + esc(c.distrito || '—') + '</b></div>' +
      '<div class="kv"><i>Dirección</i><b>' + esc(c.direccion || '—') + '</b></div>' +
      '<div class="kv"><i>Referencia</i><b>' + esc(c.referencia || '—') + '</b></div>' +
      '</div></div>' +
      '<div class="sec"><h3>' + (items.length ? '3. Artículos y componentes cotizados' : '3. Especificación técnica solicitada') + '</h3>' + tabla + '</div>' +
      soloTexto +
      bloqueFotos +
      '<div class="foot"><span>Documento generado por ' + esc(BRAND_NAME) + '. No válido para situación fiscal.</span>' +
      '<span>' + esc(c.folio) + ' · ' + esc(f) + '</span></div>' +
      '</div><script>window.onload=function(){setTimeout(function(){window.print()},120)}<\/script></body></html>';
  }
  // Ficha de mantenimiento: PDF REAL del servidor (misma plantilla y logo).
  // Si el servidor no trae el generador, cae a la vista de impresion de abajo.
  function downloadMant(m, viewOnly) {
    var id = m && (m.id || m.folio);
    if (!id) { aviso('Sin folio no se puede descargar el documento.'); return; }
    var token = '';
    try { token = localStorage.getItem('unidos_token') || ''; } catch (e) {}
    fetch(API + '/api/mantenimiento/' + encodeURIComponent(id) + '/pdf', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
    }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.blob();
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = String(id).replace(/[^A-Za-z0-9._-]+/g, '_') + '.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 800);
    }).catch(function () {
      var listo = (m && Array.isArray(m.fotos)) ? Promise.resolve(m) : pideCompleta('/api/mantenimiento/' + encodeURIComponent(id));
      listo.then(function (completa) { printMant(completa || m); })
        .catch(function () { printMant(m); });
    });
  }
  function printMant(m) {
    var fotos = Array.isArray(m.fotos) ? m.fotos.filter(function (s) {
      return typeof s === 'string' && s.indexOf('data:image/') === 0;
    }) : [];
    var bloqueFotos = fotos.length
      ? '<div class="sec"><h3>4. Fotografías del inmueble (' + fotos.length + ')</h3>' +
        '<div class="fotos">' + fotos.map(function (s, i) {
          return '<figure><img src="' + esc(s) + '" alt="Fotografía ' + (i + 1) + ' del inmueble">' +
            '<figcaption>Foto ' + (i + 1) + ' de ' + fotos.length + '</figcaption></figure>';
        }).join('') + '</div></div>'
      : '';
    var html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>' + esc(m.id) + ' - ' + esc(BRAND_NAME) + '</title>' +
      '<style>' +
      '@page{size:A4;margin:13mm 12mm}' +
      'body{font-family:Arial,Helvetica,sans-serif;color:#0b1c30;font-size:10.5px}' +
      '.head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}' +
      '.brand{display:flex;align-items:center;gap:9px}' +
      '.brand img{height:34px;width:auto;object-fit:contain}' +
      '.brand b{display:block;font-size:14px;color:#0b1c30;letter-spacing:.3px;line-height:1.15}' +
      '.brand small{display:block;font-size:8px;color:#b0000b;letter-spacing:1.6px;font-weight:700;text-transform:uppercase}' +
      '.req{text-align:right;flex-shrink:0}' +
      '.pill{display:inline-block;border:1px solid #f0c4bf;background:#fef4f3;color:#b0000b;border-radius:5px;padding:3px 10px;font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase}' +
      '.folio{font-size:15px;font-weight:800;color:#0b1c30;margin-top:5px;letter-spacing:.3px}' +
      '.fem{font-size:9.5px;color:#64748b;margin-top:2px}' +
      '.rule{border:none;border-top:2px solid #b0000b;margin:9px 0 12px}' +
      '.cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;break-inside:avoid}' +
      '.card{border:1px solid #e2e8f0;border-radius:7px;padding:9px 11px;background:#fbfcfe}' +
      '.card h4{margin:0 0 7px;font-size:9px;letter-spacing:1.1px;color:#b0000b;font-weight:800;text-transform:uppercase}' +
      '.kv{display:flex;justify-content:space-between;gap:8px;font-size:10.5px;padding:2.5px 0;border-bottom:1px dotted #e2e8f0}' +
      '.kv:last-child{border-bottom:0}' +
      '.kv i{font-style:normal;color:#64748b;flex-shrink:0}' +
      '.kv b{color:#0b1c30;font-weight:700;text-align:right;word-break:break-word}' +
      '.sec{margin:0 0 12px;break-inside:avoid}' +
      '.sec h3{font-size:9.5px;margin:0 0 7px;padding:5px 9px;background:#f1f5f9;border-left:3px solid #b0000b;border-radius:0 5px 5px 0;letter-spacing:.9px;text-transform:uppercase;color:#0b1c30}' +
      '.box{border:1px solid #e2e8f0;border-radius:7px;padding:9px 11px;font-size:10.5px;line-height:1.6;white-space:pre-line;background:#f8fafc}' +
      '.fotos{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}' +
      '.fotos img{width:100%;height:30mm;object-fit:cover;border:1px solid #e2e8f0;border-radius:6px;display:block}' +
      '.fotos figure{margin:0;break-inside:avoid}' +
      '.fotos figcaption{font-size:7.5px;color:#94a3b8;text-align:center;padding-top:1.5mm}' +
      '.foot{margin-top:14px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:12px;font-size:8.5px;color:#94a3b8;break-inside:avoid}' +
      '</style></head><body>' +
      '<div class="head"><div class="brand"><img src="' + UN_LOGO + '" alt="' + esc(BRAND_ALT) + '">' +
      '<div><b>' + esc(BRAND_NAME) + '</b><small>' + esc(BRAND_SUBTITLE) + '</small></div></div>' +
      '<div class="req"><span class="pill">Ficha de mantenimiento</span>' +
      '<div class="folio">' + esc(m.id) + '</div>' +
      '<div class="fem">Fecha de emisión: <b>' + esc(m.fecha || '—') + '</b>' +
      (m.folio ? ' · Cotización de origen: <b>' + esc(m.folio) + '</b>' : '') + '</div></div></div>' +
      '<hr class="rule">' +
      '<div class="cards">' +
      '<div class="card"><h4>Datos del solicitante</h4>' +
      '<div class="kv"><i>Titular</i><b>' + esc(m.nombre || '—') + '</b></div>' +
      '<div class="kv"><i>Correo</i><b>' + esc(m.email || '—') + '</b></div>' +
      '<div class="kv"><i>Teléfono</i><b>' + esc(m.telefono || '—') + '</b></div>' +
      '</div>' +
      '<div class="card"><h4>Datos de la instalación</h4>' +
      '<div class="kv"><i>Estado</i><b>' + esc(m.estado || '—') + '</b></div>' +
      '<div class="kv"><i>Fecha</i><b>' + esc(m.fecha || '—') + '</b></div>' +
      '<div class="kv"><i>Ubicación</i><b>' + esc(m.direccion || '—') + '</b></div>' +
      '</div></div>' +
      '<div class="sec"><h3>3. Motivo de la solicitud</h3>' +
      '<div class="box">' + esc(m.descripcion || '—') + '</div></div>' +
      bloqueFotos +
      '<div class="foot"><span>Documento generado por ' + esc(BRAND_NAME) + '. No válido para situación fiscal.</span>' +
      '<span>' + esc(m.id) + ' · ' + esc(m.fecha || '') + '</span></div>' +
      '<script>window.onload=function(){setTimeout(function(){window.print()},150)}<\/script></body></html>';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    // Siempre vista de impresion: el PDF real se obtiene con "Guardar como PDF".
    window.open(url, '_blank');
  }
  // Modal de confirmacion antes de crear una cotizacion. Se usa en el
  // cotizador general y en el pedido de electronica/refacciones: el cliente
  // ve el resumen y confirma, para no crear folios por accidente.
  // Devuelve Promise<boolean>. Sin UN no hay promesas: usa confirm().
  function confirmarEnvio(o) {
    o = o || {};
    var lineas = Array.isArray(o.lineas) ? o.lineas : [];
    return new Promise(function (resolver) {
      closeQuoteViewer();
      var m = document.createElement('div');
      m.className = 'fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.innerHTML =
        '<div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">' +
        '<div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">' +
        '<span class="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></span>' +
        '<div class="min-w-0"><p class="font-extrabold text-slate-900 text-sm leading-snug">' + esc(o.titulo || 'Confirmar solicitud') + '</p>' +
        '<p class="text-xs text-slate-500">Revisa antes de enviar. Se genera un folio oficial.</p></div></div>' +
        '<div class="px-5 py-4 max-h-[40vh] overflow-y-auto">' +
        (lineas.length
          ? '<ul class="space-y-1.5 text-[13px] text-slate-700">' + lineas.map(function (l) {
              return '<li class="flex gap-2"><span class="text-red-600 font-bold">•</span><span>' + esc(l) + '</span></li>';
            }).join('') + '</ul>'
          : '<p class="text-[13px] text-slate-600">' + esc(o.texto || '¿Enviar la solicitud de cotización?') + '</p>') +
        '</div>' +
        '<div class="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2.5">' +
        '<button type="button" data-no class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-white transition">Revisar</button>' +
        '<button type="button" data-si class="flex-[1.4] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition shadow">' + esc(o.boton || 'Confirmar y enviar') + '</button>' +
        '</div></div>';
      document.body.appendChild(m);
      document.body.style.overflow = 'hidden';
      function cerrar(v) {
        document.body.style.overflow = '';
        if (m.parentNode) m.parentNode.removeChild(m);
        resolver(!!v);
      }
      m.addEventListener('click', function (e) { if (e.target === m) cerrar(false); });
      m.querySelector('[data-no]').addEventListener('click', function () { cerrar(false); });
      m.querySelector('[data-si]').addEventListener('click', function () { cerrar(true); });
      function tecla(e) { if (e.key === 'Escape') { cerrar(false); document.removeEventListener('keydown', tecla); } }
      document.addEventListener('keydown', tecla);
    });
  }
  // Trae el PDF REAL del servidor como blob URL para mostrarlo en un iframe.
  // Asi la vista previa es identica al archivo que se descarga. Si falla,
  // llama a `alternativa()` (vista HTML) o avisa.
  function pdfParaVer(folio, alternativa) {
    var token = '';
    try { token = localStorage.getItem('unidos_token') || ''; } catch (e) {}
    return fetch(API + '/api/cotizaciones/' + encodeURIComponent(folio) + '/pdf', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
    }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.blob();
    }).then(function (blob) {
      return URL.createObjectURL(blob);
    }).catch(function (e) {
      if (typeof alternativa === 'function') return alternativa();
      throw e;
    });
  }
  // Descarga el PDF REAL del servidor (una sola plantilla para todas las areas).
  // Antes abria la vista de impresion y el usuario tenia que adivinar el
  // "Guardar como PDF". Si el servidor no trae el generador, cae a printQuote.
  function downloadQuote(c, viewOnly) {
    var folio = c && (c.folio || c.id);
    if (!folio) { aviso('Sin folio no se puede descargar el documento.'); return; }
    var token = '';
    try { token = localStorage.getItem('unidos_token') || ''; } catch (e) {}
    fetch(API + '/api/cotizaciones/' + encodeURIComponent(folio) + '/pdf', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
    }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.blob();
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = String(folio).replace(/[^A-Za-z0-9._-]+/g, '_') + '.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 800);
    }).catch(function () {
      // El respaldo lo arma el navegador con los datos que tiene a la mano. Si la
      // cotizacion vino de una lista (que ya no trae fotos), se piden antes de
      // imprimir para que el documento salga con las fotografias.
      var listo = (c && Array.isArray(c.fotos)) ? Promise.resolve(c) : pideCompleta('/api/cotizaciones/' + encodeURIComponent(folio));
      listo.then(function (completa) { printQuote(completa || c); })
        .catch(function () { printQuote(c); });
    });
  }
  // Trae un registro completo (con fotos) desde el servidor.
  function pideCompleta(ruta) {
    var token = '';
    try { token = localStorage.getItem('unidos_token') || ''; } catch (e) {}
    return fetch(API + ruta, { headers: token ? { 'Authorization': 'Bearer ' + token } : {} })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
  }

  function printQuote(c) {
    var blob = new Blob([quoteDoc(c)], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    // Vista de impresion: el PDF real se obtiene con "Guardar como PDF".
    window.open(url, '_blank');
  }
  // Visor oficial dentro de la pagina (el de la imagen de referencia).
  // Al abrir cierra cualquier otro modal de expediente para que nunca se apilen.
  function closeQuoteViewer() {
    var x = document.getElementById('un-quote-viewer');
    if (x) x.parentNode.removeChild(x);
    document.querySelectorAll('[id^="modal-cot-"], #pdfModal, #modal-pdf-oficial').forEach(function (el) {
      el.classList.add('hidden');
      el.classList.remove('flex');
    });
    document.body.style.overflow = '';
  }
  function viewQuote(c) {
    if (!c) return;
    closeQuoteViewer();
    document.body.style.overflow = 'hidden';
    var m = document.createElement('div');
    m.id = 'un-quote-viewer';
    m.className = 'fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6';
    m.innerHTML =
      '<div class="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">' +
      '<div class="bg-slate-900 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 flex-shrink-0">' +
      '<div class="flex items-center gap-2.5 min-w-0"><span class="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-1 rounded-md shrink-0">PDF</span>' +
      '<div class="min-w-0"><p class="text-white text-sm font-bold truncate">' + esc(c.folio) + '.pdf <span class="ml-1 align-middle text-[10px] font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded">Documento Oficial</span></p>' +
      '<p class="text-[11px] text-slate-400 truncate">Vista previa del archivo que se descarga</p></div></div>' +
      '<div class="flex items-center gap-2 shrink-0">' +
      '<button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition" data-dl>Descargar PDF</button>' +
      '<button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition" data-print>Imprimir</button>' +
      '<button class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition" data-x>✕</button>' +
      '</div></div>' +
      '<div class="bg-slate-200/70 p-4 sm:p-6 flex justify-center" style="min-height:320px">' +
      '<p data-cargando class="text-sm text-slate-500 self-center">Cargando documento…</p>' +
      '<iframe data-marco title="Vista previa del PDF" style="display:none;width:100%;max-width:700px;height:62vh;border:0;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.15)"></iframe>' +
      '</div>' +
      '<div class="px-4 sm:px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">' +
      '<p class="text-[11px] text-slate-400 flex items-center gap-1.5">Documento no válido para situación fiscal.</p>' +
      '<div class="flex items-center gap-2 shrink-0">' +
      '<button class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold transition" data-x>Cerrar Visor</button>' +
      '<button class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow" data-dl>Descargar PDF Ahora</button>' +
      '</div></div></div>';
    document.body.appendChild(m);
    window.__lastViewQuote = c;
    var marco = m.querySelector('[data-marco]');
    var aviso = m.querySelector('[data-cargando]');
    var urlPdf = null;
    // La vista previa ES el PDF real del servidor: lo que ves es lo que bajas.
    pdfParaVer(c.folio, function () {
      if (aviso) aviso.textContent = 'No se pudo cargar la vista previa. Usa Descargar PDF.';
    }).then(function (url) {
      if (typeof url !== 'string') return;
      urlPdf = url;
      if (aviso) aviso.style.display = 'none';
      marco.style.display = 'block';
      marco.src = url;
    });
    function shut() {
      if (urlPdf) { try { URL.revokeObjectURL(urlPdf); } catch (e) {} urlPdf = null; }
      closeQuoteViewer();
    }
    m.addEventListener('click', function (e) { if (e.target === m) shut(); });
    m.querySelectorAll('[data-x]').forEach(function (b) { b.addEventListener('click', shut); });
    m.querySelectorAll('[data-dl]').forEach(function (b) { b.addEventListener('click', function () { downloadQuote(window.__lastViewQuote); }); });
    m.querySelectorAll('[data-print]').forEach(function (b) {
      b.addEventListener('click', function () {
        try {
          var w = marco.contentWindow;
          if (urlPdf && w) { w.focus(); w.print(); return; }
        } catch (e) {}
        printQuote(window.__lastViewQuote);
      });
    });
    document.addEventListener('keydown', function esc2(e) {
      if (e.key === 'Escape') { shut(); document.removeEventListener('keydown', esc2); }
    });
  }

  // Sincroniza el catalogo visible con lo publicado por el admin.
  // Clona tarjetas exactas del diseno; si no hay red, el diseno queda intacto.
  async function syncCatalog(preloaded) {
    if (typeof PRODUCTS_DATA === 'undefined') return;
    var grid = document.getElementById('catalog-grid');
    if (!grid) return;
    var list;
    try { list = preloaded || await api('/api/productos'); } catch (e) { return; }
    // Sin respuesta no se toca nada (el diseno queda intacto); con respuesta
    // (aunque venga vacia) el visible debe ser espejo exacto del admin.
    if (!list) return;
    Object.keys(PRODUCTS_DATA).forEach(function (k) { delete PRODUCTS_DATA[k]; });
    list.forEach(function (p) { PRODUCTS_DATA[p.id] = p; });
    __catSig = catSignature(list);
    function norm(s) { return normalizeText(s); }
    var cards = Array.prototype.slice.call(grid.children).filter(function (el) {
      return el.querySelector && el.querySelector('h3');
    });
    var used = {};
    cards.forEach(function (card) {
      if (card.getAttribute('data-id')) { used[card.getAttribute('data-id')] = card; return; }
      var t = card.querySelector('h3') ? norm(card.querySelector('h3').textContent) : '';
      var hit = null;
      list.forEach(function (p) { if (!hit && norm(p.title) === t) hit = p; });
      if (hit && !used[hit.id]) { card.setAttribute('data-id', hit.id); used[hit.id] = card; }
    });
    var byId = {};
    list.forEach(function (p) { byId[p.id] = p; });
    // Filtro activo actual (para no regresarlo a "todos" en cada actualizacion)
    var keepCat = 'todos';
    if (typeof filterCatalog === 'function') {
      var fbtns = document.querySelectorAll('.catalog-filter-btn');
      for (var fi = 0; fi < fbtns.length; fi++) {
        if (fbtns[fi].classList && fbtns[fi].classList.contains('bg-primary')) {
          var mo = String(fbtns[fi].getAttribute('onclick') || '').match(/filterCatalog\('([^']+)'/);
          if (mo) keepCat = mo[1];
          break;
        }
      }
    }
    // Se retira todo lo que el admin quito: con data-id huerfano, sin match
    // por titulo, o duplicado del mismo producto (el primero gana).
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      if (id) { if (!byId[id]) grid.removeChild(card); return; }
      var t = card.querySelector('h3') ? norm(card.querySelector('h3').textContent) : '';
      var hit = null;
      list.forEach(function (p) { if (!hit && norm(p.title) === t) hit = p; });
      if (!hit || (used[hit.id] && used[hit.id] !== card)) grid.removeChild(card);
    });
    var tpl = grid.querySelector('[data-id]') || cards[0];
    list.forEach(function (p) {
      var card = grid.querySelector('[data-id="' + p.id + '"]');
      if (card) { paintCard(card, p); return; }
      if (!tpl) return;
      var el = tpl.cloneNode(true);
      paintCard(el, p);
      el.removeAttribute('style');
      grid.appendChild(el);
    });
    // Se reaplica el filtro que tenia el usuario (o todos si su categoria ya no existe)
    if (typeof filterCatalog === 'function') {
      var kbtn = document.querySelector('.catalog-filter-btn[onclick*="\'' + keepCat + '\'"]');
      if (kbtn) filterCatalog(keepCat, kbtn);
      else {
        var tbtn = document.querySelector('button[onclick*="\'todos\'"]');
        if (tbtn) filterCatalog('todos', tbtn);
      }
    }
    function paintCard(card, p) {
      card.setAttribute('data-id', p.id);
      if (p.categoryCode) card.setAttribute('data-category', p.categoryCode);
      var img = card.querySelector('img');
      if (img) {
        if (p.images && p.images[0]) img.src = p.images[0];
        img.alt = p.title;
        img.setAttribute('data-alt', p.title);
      }
      var cat = card.querySelector('span.text-label-caps');
      if (cat) cat.textContent = p.category;
      var h3 = card.querySelector('h3');
      if (h3) { h3.textContent = p.title; h3.setAttribute('onclick', "openProductModal('" + p.id + "')"); }
      var desc = card.querySelector('p.font-body-sm');
      if (desc) desc.textContent = p.description;
      var box = card.querySelector('div.space-y-2\\.5');
      if (box) {
        var row = box.querySelector('div.flex.items-start');
        box.innerHTML = '';
        (p.idealFor && p.idealFor.length ? p.idealFor : ['Consultar disponibilidad y cobertura.']).forEach(function (t) {
          var r = row ? row.cloneNode(true) : document.createElement('div');
          var spans = r.querySelectorAll('span');
          var last = spans[spans.length - 1];
          if (last) last.textContent = t;
          else r.textContent = t;
          box.appendChild(r);
        });
      }
      card.querySelectorAll('[onclick]').forEach(function (el2) {
        var o = el2.getAttribute('onclick') || '';
        if (o.indexOf('openProductModal(') === 0) el2.setAttribute('onclick', "openProductModal('" + p.id + "')");
      });
    }
  }

  // Actualizacion automatica del catalogo: cuando el admin publica, edita o
  // quita algo, index/catalogo se actualizan solas sin recargar la pagina.
  // - Aviso instantaneo entre pestanas de la misma maquina.
  // - Poll cada 15s como red de seguridad (otras maquinas).
  // Nunca interrumpe: respeta pestana oculta, modales abiertos y filtro activo.
  var __catSig = null, __catWatch = false, __catBC = null, __catPoll = null, __catNotifyBC = null;
  // La firma tiene que cubrir productos, marcas Y categorias. Antes solo miraba
  // campos del producto, asi que borrar una marca que no dejaba productos
  // huerfanos no cambiaba la firma y la pagina se quedaba sin refrescar.
  function catSignature(list, marcas, cats) {
    var p = (list || []).map(function (x) {
      return [x.id, x.title, x.description, x.category, x.categoryCode].join('|');
    }).join('~');
    var m = (marcas || []).map(function (x) { return [x.code, x.label, x.image].join('|'); }).join('~');
    var c = (cats || []).map(function (x) { return [x.code, x.label].join('|'); }).join('~');
    return p + '##' + m + '##' + c;
  }
  async function checkCatalog() {
    if (typeof PRODUCTS_DATA === 'undefined' && !window.__unReloadCatalog) return;
    if (document.hidden) return;
    if (document.querySelector('.modal-visible')) return;
    var res;
    try {
      res = await Promise.all([
        api('/api/productos').catch(function () { return null; }),
        api('/api/marcas').catch(function () { return []; }),
        api('/api/categorias').catch(function () { return []; }),
      ]);
    } catch (e) { return; }
    if (!res[0]) return;
    var sig = catSignature(res[0], res[1], res[2]);
    // La primera pasada solo deja anotada la linea base. La pagina acaba de
    // cargar y ya pinto con estos datos, asi que recargarla aqui seria un
    // segundo fetch inutil en cada visita.
    if (__catSig === null) { __catSig = sig; return; }
    if (sig === __catSig) return;
    __catSig = sig;
    // El grid legacy (catalogo.html) se repinta con syncCatalog; el catalogo
    // moderno (index y los index por rol) se recarga con su propia funcion.
    if (typeof window.__unReloadCatalog === 'function') {
      try { await window.__unReloadCatalog(); } catch (e) {}
      return;
    }
    if (typeof PRODUCTS_DATA !== 'undefined' && document.getElementById('catalog-grid')) {
      await syncCatalog(res[0]);
    }
  }
  function watchCatalog() {
    if (typeof PRODUCTS_DATA === 'undefined' && !window.__unReloadCatalog) return;
    if (__catWatch) return;
    __catWatch = true;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        __catBC = new BroadcastChannel('unidos-catalogo');
        __catBC.onmessage = function () { checkCatalog(); };
      }
    } catch (e) { __catBC = null; }
    window.addEventListener('storage', function (e) {
      if (e && e.key === 'unidos_catalog_ping') checkCatalog();
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) checkCatalog();
    });
    if (__catPoll) clearInterval(__catPoll);
    __catPoll = setInterval(checkCatalog, 30000);
  }
  // Lo llama el admin tras crear/editar/eliminar para avisar a las demas pestanas.
  // Reutiliza un unico canal: antes creaba uno nuevo en cada llamada y lo
  // abandonaba sin cerrar, dejando canales huerfanos acumulados en la pestana.
  function notifyCatalog() {
    try { localStorage.setItem('unidos_catalog_ping', String(Date.now())); } catch (e) {}
    try {
      if (typeof BroadcastChannel === 'undefined') return;
      if (!__catNotifyBC) {
        try { __catNotifyBC = new BroadcastChannel('unidos-catalogo'); } catch (e) { __catNotifyBC = null; }
      }
      if (__catNotifyBC) __catNotifyBC.postMessage({ t: Date.now() });
    } catch (e) {}
  }


  // Reescribe los enlaces del simulador (data-path / #) a las paginas reales.
  // Rutas absolutas: zona cliente en raiz, zona admin en /admin/ (independientes, solo datos).
  function rewriteLinks() {
    var logged = !!localStorage.getItem('unidos_token');
    var u0 = getUser();
    var staff = !!(u0 && (u0.rol === 'ADMIN' || u0.rol === 'SUPERADMIN'));
    var pe = !!(u0 && u0.rol === 'PROYECTOS_ESPECIALES');
    var home = !logged ? '/index.html' : (u0 && u0.rol === 'SUPERADMIN' ? '/superadmin/catalogo.html' : (staff ? '/admin/catalogo.html' : (pe ? '/especiales/gestion.html' : ((u0 && u0.rol === 'PRODUCTOS_ELECTRONICOS') ? '/electronica/catalogo.html' : '/index.html'))));
    // En zona admin todo se queda en zona admin. La zona de Proyectos
    // Especiales es aparte: tambien se queda en su zona. Igual SuperAdmin.
    var isAdminPage = /^\/admin\//.test(location.pathname);
    var isEspecialesPage = /^\/especiales\//.test(location.pathname);
    var isSuperPage = /^\/superadmin\//.test(location.pathname);
    var isElecPage = /^\/electronica\//.test(location.pathname);
    // Contacto/Nosotros bajan a la sección DE LA PAGINA ACTUAL (nunca te sacan de tu sesion).
    // Si la pagina no trae esa seccion, Nosotros va a su página; Contacto al pie del index.
    var contactoHref = document.getElementById('contacto') ? '#contacto' : '/index.html#contacto';
    var nosotrosHref = document.getElementById('nosotros') ? '#nosotros' : '/nosotros.html';
    // El catalogo respeta zona y rol: el cliente va al catálogo del index
    // nuevo; cada staff se queda en su zona. Sin sesión, a la presentación.
    var catalogoHref = (!logged || (u0 && u0.rol === 'CLIENTE')) ? '/index.html#seccion-catalogo'
      : (u0 && u0.rol === 'SUPERADMIN' ? '/superadmin/catalogo.html'
      : (u0 && u0.rol === 'ADMIN' ? '/admin/catalogo.html'
      : (u0 && u0.rol === 'PRODUCTOS_ELECTRONICOS' ? '/electronica/catalogo.html'
      : (pe ? '/especiales/gestion.html' : '/index.html#seccion-catalogo'))));
    var MAP = {
      'mis-cotizaciones': '/mis-cotizaciones.html',
      'perfil': '/perfil.html',
      'iniciar-sesion': '/login.html',
      'catalogo-de-servicios': catalogoHref,
      'catalogo-y-soluciones': catalogoHref,
      'catalogo': catalogoHref,
      'contacto': contactoHref,
      'nosotros': nosotrosHref,
      'planes-y-paquetes': catalogoHref,
      'registro-cuenta': '/registro.html',
      'registrarse-ahora': '/registro.html',
      'admin-panel': '/admin/mantenimiento.html',
      'admin-catalogo': '/admin/catalogo.html',
      'admin-cotizaciones': '/admin/cotizaciones.html',
      'admin-perfil': '/admin/perfil.html',
      'proyectos-especiales': '/especiales/gestion.html',
      'proyectos-recibidos': '/especiales/solicitudes.html',
      'historial-de-proyectos': '/especiales/historial.html',
    };
    document.querySelectorAll('[data-path]').forEach(function (a) {
      var dp = a.getAttribute('data-path');
      if (dp === 'cotizador-online' || dp === 'cotizador' || dp === 'productos-electronicos') return; // se maneja abajo
      if (dp === 'catalogo') {
        // El index nuevo trae su propio catálogo en la página: se respeta el
        // scroll interno en vez de sacarte a otra página.
        var href0 = a.getAttribute('href') || '';
        if (href0.charAt(0) === '#' && href0.length > 1) {
          try { if (document.querySelector(href0)) return; } catch (e) {}
        }
      }
      if (a._unRenamed) return; // un renombrado manual tiene prioridad y no se pisa
      var t = MAP[dp];
      if (t) a.setAttribute('href', t);
    });
    // Cotizador y Productos Electrónicos: la decision se toma AL CLIC, no al
    // cargar (asi un token vencido jamas te deja sin la ventana emergente).
    // CON sesion entra directo; SIN sesion abre el aviso original del diseno.
    var GATED = {
      'cotizador-online': '/cotizador.html',
      'cotizador': '/cotizador.html',
      'productos-electronicos': '/productos-electronicos.html',
    };
    Object.keys(GATED).forEach(function (dp) {
      document.querySelectorAll('[data-path="' + dp + '"]').forEach(function (a) {
        if (a._unCot) return;
        a._unCot = true;
        a.removeAttribute('onclick');
        a.setAttribute('href', 'javascript:void(0)');
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var uu = getUser();
          var installCta = (a.textContent || '').indexOf('COTIZAR INSTALACIÓN') === 0;
          if (installCta) {
            if (uu && (uu.rol === 'PRODUCTOS_ELECTRONICOS' || uu.rol === 'PROYECTOS_ESPECIALES')) {
              a.style.display = 'none';
              a.setAttribute('aria-disabled', 'true');
              return;
            }
            if (localStorage.getItem('unidos_token')) { location.href = '/cotizador.html'; return; }
            location.href = '/login.html?next=/cotizador.html';
            return;
          }
          if (uu && (uu.rol === 'PRODUCTOS_ELECTRONICOS' || uu.rol === 'PROYECTOS_ESPECIALES')) {
            a.style.display = 'none';
            a.setAttribute('aria-disabled', 'true');
            return;
          }
          if (isElecPage || isEspecialesPage) {
            a.style.display = 'none';
            a.setAttribute('aria-disabled', 'true');
            return;
          }
          var target = GATED[dp];
          if (isAdminPage) { location.href = '/admin/cotizaciones.html'; return; }
          if (isSuperPage) { location.href = '/superadmin/catalogo.html'; return; }
          if (uu && uu.rol === 'SUPERADMIN') { location.href = '/superadmin/catalogo.html'; return; }
          if (uu && uu.rol === 'ADMIN') { location.href = '/admin/cotizaciones.html'; return; }
          if (localStorage.getItem('unidos_token')) { location.href = target; return; }
          if (typeof openAuthPromptModal === 'function') { openAuthPromptModal(); return; }
          location.href = '/login.html?next=' + target;
        });
      });
    });
    // "Inicio" lleva al inicio segun sesion: catalogo (con sesion) o presentacion (sin sesion)
    document.querySelectorAll('[data-path="inicio"]').forEach(function (a) { a.setAttribute('href', home); });
    // Sin sesion el boton "Contacto" del nav se llama "Nosotros" y abre la pagina
    // Nosotros. Solo el del nav (no el "Soporte Tecnico" del footer). Con sesion
    // se queda como ancla de contacto (comportamiento anterior).
    if (!logged && !isAdminPage) {
      document.querySelectorAll('a.nav-link-item[data-path="contacto"]').forEach(function (a) {
        if ((a.textContent || '').trim() !== 'Contacto') return;
        (function walk(n) {
          if (n.nodeType === 3) {
            if (n.nodeValue.indexOf('Contacto') >= 0) { n.nodeValue = n.nodeValue.replace('Contacto', 'Nosotros'); }
            return;
          }
          var c = n.firstChild;
          while (c) { var nx = c.nextSibling; walk(c); c = nx; }
        })(a);
        a._unRenamed = true;
        a.setAttribute('href', '/nosotros.html');
      });
    }
    // El boton "Nosotros" ahora se llama "Catálogo" y regresa directo al catálogo.
    // En admin se llama "Mantenimientos" y va a sus solicitudes. A prueba de
    // repeticiones y tolerante a iconos pegados al texto.
    // Solo reconoce el ya renombrado si trae data-path="nosotros" (no toca otros "Catálogo").
    (function () {
      // Las zonas con nav propio no se tocan.
      if (/^\/(especiales|superadmin)\//.test(location.pathname)) return;
      // La IA nueva (index, cotizador, productos) SÍ tiene página Nosotros:
      // sus links data-path="nosotros" no se renombran a Catálogo.
      var isNewIA = /^\/(index\.html)?$/.test(location.pathname) || /^\/(cotizador|productos-electronicos|nosotros)\.html$/.test(location.pathname);
      var isAdmin = /^\/admin\//.test(location.pathname);
      var isAdminZone = isAdmin || isElecPage;
      function baseText(a) { return ((a.textContent || '').trim().replace(/^[a-z_]+/, '').trim()); }
      function retitle(a, label) {
        (function walk(n) {
          if (n.nodeType === 3) {
            if (n.nodeValue.indexOf('Nosotros') >= 0) { n.nodeValue = n.nodeValue.replace('Nosotros', label); }
            return;
          }
          var c = n.firstChild;
          while (c) { var nx = c.nextSibling; walk(c); c = nx; }
        })(a);
      }
      document.querySelectorAll('a').forEach(function (a) {
        if (a._unRenamed) return; // renombrado manual (ej. Contacto->Nosotros sin sesion)
        if (a.getAttribute('data-path') === 'contacto') return; // el Contacto del nav lo maneja su propio bloque
        if (a.getAttribute('data-path') === 'nosotros' && isNewIA) return; // IA nueva: Nosotros existe
        if (a.getAttribute('aria-current') === 'page') return; // marcador de pagina actual (ej. Nosotros en nosotros.html)
        var dpn = a.getAttribute('data-path') === 'nosotros';
        var t = baseText(a);
        var esNos = t === 'Nosotros' || (dpn && (t === 'Catálogo' || t === 'Panel' || t === 'Mantenimientos'));
        if (!esNos) return;
        retitle(a, isAdminZone ? 'Mantenimientos' : 'Catálogo');
        // retitula tambien un posible texto ya renombrado antes
        (function walk2(n) {
          if (n.nodeType === 3) {
            if (n.nodeValue.indexOf('Panel') >= 0 && isAdminZone) { n.nodeValue = n.nodeValue.replace('Panel', 'Mantenimientos'); }
            return;
          }
          var c = n.firstChild;
          while (c) { var nx = c.nextSibling; walk2(c); c = nx; }
        })(a);
        a._unRenamed = true;
        a.setAttribute('href', isAdminZone ? ((isElecPage ? '/electronica/historial.html' : '/admin/mantenimiento.html')) : catalogoHref);
      });
    })();
    document.querySelectorAll('a[href="#registro"]').forEach(function (a) { a.href = '/registro.html'; });
    document.querySelectorAll('a[href="#iniciar-sesion"]').forEach(function (a) { a.href = '/login.html'; });
    // Anclas del catalogo: van al catálogo que corresponde a tu zona/rol
    // (el nuevo index para cliente) y no recargan si ya estas en la pagina.
    (function () {
      var isIndex = /index\.html$|\/$/.test(location.pathname);
      var isCatalogo = /catalogo\.html$/.test(location.pathname);
      var hasNewCat = !!document.getElementById('seccion-catalogo');
      var target = !logged ? (hasNewCat ? '#seccion-catalogo' : '/index.html#seccion-catalogo')
        : (isCatalogo ? '#catalogo-servicios'
        : (isSuperPage ? '/superadmin/catalogo.html'
        : (isAdminPage ? '/admin/catalogo.html'
        : (isEspecialesPage ? '/especiales/gestion.html' : (hasNewCat ? '#seccion-catalogo' : '/index.html#seccion-catalogo')))));
      ['#catalogo', '#catalogo-servicios', '#catalogo-de-servicios'].forEach(function (h) {
        document.querySelectorAll('a[href="' + h + '"]').forEach(function (a) { a.href = target; });
      });
    })();
    // Solo etiquetas exactas conocidas (nada de adivinanzas por palabras sueltas).
    // En zona admin todo se queda en zona admin.
    document.querySelectorAll('a[href="#"]').forEach(function (a) {
      var t = (a.textContent || '').trim().toLowerCase();
      if (t.indexOf('iniciar ses') >= 0) a.href = '/login.html';
      else if (t.indexOf('crear cuenta') >= 0 || t === 'registrarse' || t === 'registrarse en nerba') a.href = '/registro.html';
      else if (t.indexOf('volver al cat') >= 0) a.href = isAdminPage ? '/admin/catalogo.html' : (isElecPage ? '/electronica/catalogo.html' : (logged ? '/index.html#seccion-catalogo' : '/index.html'));
      else if (t.indexOf('mis cotizaciones') >= 0) a.href = isAdminPage ? '/admin/cotizaciones.html' : (isElecPage ? '/electronica/cotizaciones.html' : '/mis-cotizaciones.html');
      else if (t === 'cotizador online') {
        if (isElecPage || isEspecialesPage) {
          a.removeAttribute('href');
          a.setAttribute('aria-disabled', 'true');
        } else a.href = isAdminPage ? '/admin/cotizaciones.html' : '/cotizador.html';
      }
      else if (t === 'mi perfil' || t === 'mi cuenta') a.href = isAdminPage ? '/admin/perfil.html' : (isEspecialesPage ? '/especiales/perfil.html' : (isElecPage ? '/electronica/perfil.html' : '/perfil.html'));
      else if (t === '' && a.querySelector('img')) a.href = home; // logo sin texto: al inicio
      else if (t === 'inicio') a.href = home;
      else if (t === 'portal de clientes') a.href = (u0 && u0.rol === 'ADMIN') ? '/admin/catalogo.html' : ((u0 && u0.rol === 'SUPERADMIN') ? '/superadmin/catalogo.html' : ((u0 && u0.rol === 'PRODUCTOS_ELECTRONICOS') ? '/electronica/catalogo.html' : '/index.html'));
      else if (t === 'términos de servicio' || t === 'términos del servicio' || t.indexOf('términos de garant') >= 0 || t === 'términos') a.href = '/terminos.html';
      else if (t === 'política de privacidad' || t === 'políticas de privacidad' || t === 'privacidad' || t.indexOf('aviso de privacidad') >= 0 || t.indexOf('privacidad') === 0) a.href = '/privacidad.html';
      else if (t === 'libro de reclamaciones') a.href = '/terminos.html#libro';
      else if (t.indexOf('cumplimiento normativo') >= 0 || t === 'cumplimiento') a.href = '/terminos.html';
      else if (t === 'portal de proveedores') a.href = catalogoHref;
    });
    // Antes aqui se agregaba a mano una entrada "Mantenimientos" para
    // ADMIN/SUPERADMIN fuera de /admin/, porque las paginas publicas ponian la
    // barra de cliente y ahi no estaba. Ahora la barra se arma por rol
    // (ensureMenuRol -> zhHTML), asi que esta entrada sobra: al admin le
    // duplicaba el enlace y al superadmin lo mandaba a /admin/, que no es su
    // zona y lo rebotaba al login.
  // "Olvidaste tu contrasena": pide el correo y el backend manda el enlace.
  // Antes era un alert con el telefono de la empresa. Guarda de idempotencia
  // porque rewriteLinks() se llama mas de una vez por pagina.
  document.querySelectorAll('a[href="#recuperar"]').forEach(function (a) {
    if (a._unRecuperar) return;
    a._unRecuperar = true;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openRecuperar();
    });
  });
  }

  /* Recuperacion de contrasena: el modal.
     Decisiones que_importan:
     - Tras enviar NO se cierra solo. El backend responde 200 siempre, exista o
       no la cuenta, para no filtrar que correos estan registrados. Por eso el
       modal no puede afirmar "te enviamos el correo": dice "si esta registrado".
     - Se ofrece Reenviar, aviso de spam y salida por WhatsApp, porque si el
       correo no llega el usuario no debe quedarse sin salida.
     - Respeta el limite del servidor (5 por minuto) con una cuenta regresiva.
     - Escape cierra y el foco queda atrapado dentro del dialogo. */
  var __recModal = null;
  var REC_ESPERA_REENVIO = 45000;
  function openRecuperar(correoSugerido) {
    var w = __recModal;
    if (w && document.body.contains(w)) {
      w.style.display = 'flex';
      var mb = w.querySelector('#__recMail');
      if (mb && correoSugerido) mb.value = correoSugerido;
      try { (w.querySelector('#__recMail') || w).focus(); } catch (e) {}
      return;
    }
    var anterior = document.activeElement;
    w = document.createElement('div');
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-modal', 'true');
    w.setAttribute('aria-labelledby', '__recTitulo');
    w.setAttribute('aria-describedby', '__recDesc');
    w.style.cssText = 'position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(11,28,48,.55)';
    w.innerHTML =
      '<div style="background:#ffffff;border-radius:16px;max-width:440px;width:100%;padding:26px;box-shadow:0 24px 60px rgba(11,28,48,.28);font-family:Inter,system-ui,sans-serif">' +
      '<div style="display:flex;align-items:center;gap:10px;margin:0 0 10px">' +
      '<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:#eff4ff;color:#b0000b;flex:none">' +
      '<span class="material-symbols-outlined" style="font-size:22px">lock_reset</span></span>' +
      '<h3 id="__recTitulo" style="font-family:\'Plus Jakarta Sans\',Inter,sans-serif;font-weight:800;font-size:20px;margin:0;color:#0b1c30">Recuperar contraseña</h3></div>' +

      // ---- paso 1: pedir el correo ----
      '<div id="__recPaso1">' +
      '<p id="__recDesc" style="font-size:14px;line-height:1.6;color:#575e70;margin:0 0 16px">Escribe el correo con el que te registraste y te enviamos un enlace para cambiar tu contraseña.</p>' +
      '<input id="__recMail" type="email" required placeholder="usuario@ejemplo.com" autocomplete="email" spellcheck="false" ' +
      'style="width:100%;height:46px;padding:0 14px;border:1px solid #d3e4fe;border-radius:8px;background:#f8f9ff;font-size:14px;color:#0b1c30;margin-bottom:12px;box-sizing:border-box">' +
      '<p id="__recMsg" role="status" aria-live="polite" style="display:none;font-size:13px;line-height:1.5;border-radius:8px;padding:10px 12px;margin:0 0 12px"></p>' +
      '<div style="display:flex;gap:10px">' +
      '<button id="__recCancel" type="button" style="flex:1;height:46px;border-radius:8px;border:1px solid #d3e4fe;background:#eff4ff;color:#0b1c30;font-weight:600;font-size:14px;cursor:pointer">Cancelar</button>' +
      '<button id="__recGo" type="button" style="flex:1.4;height:46px;border-radius:8px;border:0;background:#b0000b;color:#ffffff;font-weight:700;font-size:14px;cursor:pointer">Enviame el enlace</button>' +
      '</div></div>' +

      // ---- paso 2: enviado. No se cierra solo ----
      '<div id="__recPaso2" style="display:none">' +
      '<div style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:#dcfce7;color:#15803d;margin:0 auto 12px">' +
      '<span class="material-symbols-outlined" style="font-size:28px">mark_email_read</span></div>' +
      '<p style="font-size:15px;font-weight:700;color:#0b1c30;text-align:center;margin:0 0 6px">Revisa tu correo</p>' +
      '<p style="font-size:14px;line-height:1.6;color:#575e70;text-align:center;margin:0 0 16px">' +
      'Si <strong id="__recMailEcho"></strong> está registrado, ya te enviamos un enlace para cambiar tu contraseña.</p>' +
      '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;margin:0 0 14px">' +
      '<p style="font-size:13px;line-height:1.6;color:#78350f;margin:0 0 6px"><strong>No te llega?</strong></p>' +
      '<ul style="font-size:13px;line-height:1.7;color:#78350f;margin:0;padding-left:18px">' +
      '<li>Revisa la carpeta de <strong>spam</strong> o correo no deseado.</li>' +
      '<li>Asegúrate de usar el mismo correo con el que te registraste.</li>' +
      '<li>El enlace vence a los 30 minutos y solo sirve una vez.</li>' +
      '</ul></div>' +
      '<div style="display:flex;gap:10px;margin:0 0 12px">' +
      '<button id="__recOtro" type="button" style="flex:1;height:44px;border-radius:8px;border:1px solid #d3e4fe;background:#eff4ff;color:#0b1c30;font-weight:600;font-size:14px;cursor:pointer">Usar otro correo</button>' +
      '<button id="__recReenviar" type="button" style="flex:1.3;height:44px;border-radius:8px;border:0;background:#b0000b;color:#ffffff;font-weight:700;font-size:14px;cursor:pointer">Reenviar enlace</button>' +
      '</div>' +
      '<p id="__recWa" style="font-size:13px;line-height:1.6;color:#575e70;text-align:center;margin:0;padding-top:12px;border-top:1px solid #eef2f7">' +
      '¿Necesitas ayuda? <a href="https://wa.me/527751300335" target="_blank" rel="noopener" style="color:#b0000b;font-weight:700">Escríbenos por WhatsApp</a> · 775 130 0335</p>' +
      '</div></div>';
    document.body.appendChild(w);
    __recModal = w;

    var mail = w.querySelector('#__recMail');
    var msg = w.querySelector('#__recMsg');
    var go = w.querySelector('#__recGo');
    var paso1 = w.querySelector('#__recPaso1');
    var paso2 = w.querySelector('#__recPaso2');
    var reenviar = w.querySelector('#__recReenviar');
    var otro = w.querySelector('#__recOtro');
    var ultimoFoco = null;
    var reloj = null;
    var hasta = 0;
    if (correoSugerido) mail.value = correoSugerido;

    function cerrar() {
      if (reloj) { clearInterval(reloj); reloj = null; }
      w.style.display = 'none';
      paso1.style.display = 'block';
      paso2.style.display = 'none';
      msg.style.display = 'none';
      go.disabled = false; go.textContent = 'Enviame el enlace';
      try { if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus(); } catch (e) {}
    }
    function avisar(txt, tono) {
      msg.textContent = txt;
      msg.style.cssText = 'display:block;font-size:13px;line-height:1.5;border-radius:8px;padding:10px 12px;margin:0 0 12px;background:' +
        (tono === 'ok' ? '#eff4ff;color:#0b1c30' : tono === 'espera' ? '#fef3c7;color:#78350f' : '#ffdad6;color:#93000a');
    }

    function ticking() {
      var falta = Math.ceil((hasta - Date.now()) / 1000);
      if (falta <= 0) {
        reenviar.disabled = false;
        reenviar.textContent = 'Reenviar enlace';
        if (reloj) { clearInterval(reloj); reloj = null; }
        return;
      }
      reenviar.disabled = true;
      reenviar.textContent = 'Reenviar en ' + falta + 's';
    }

    function enviado(destino) {
      w.querySelector('#__recMailEcho').textContent = destino;
      paso1.style.display = 'none';
      paso2.style.display = 'block';
      hasta = Date.now() + REC_ESPERA_REENVIO;
      if (reloj) clearInterval(reloj);
      reloj = setInterval(ticking, 500);
      ticking();
      try { reenviar.focus(); } catch (e) {}
    }

    function pedir(boton) {
      var v = String(mail.value || '').trim();
      if (!v || v.indexOf('@') < 1 || v.charAt(v.length - 1) === '@') {
        avisar('Escribe un correo válido, por ejemplo nombre@dominio.com', 'mal');
        mail.focus();
        return;
      }
      var previo = boton.textContent;
      boton.disabled = true; boton.textContent = 'Enviando...';
      avisar('Enviando...', 'espera');
      // api() lanza excepcion si la respuesta no es 2xx: el 503 "no
      // disponible" y el 429 de limite llegan por el catch.
      api('/api/recuperar', { method: 'POST', body: { email: v } }).then(function (r) {
        msg.style.display = 'none';
        boton.disabled = false; boton.textContent = previo;
        enviado(v);
      }).catch(function (e) {
        var texto = (e && e.message) || 'No pudimos enviar el correo.';
        // 429: el servidor corta a los 5 intentos por minuto.
        if (e && e.status === 429) {
          avisar('Demasiados intentos seguidos. Espera un momento y vuelve a intentar.', 'espera');
          boton.disabled = true;
          setTimeout(function () { boton.disabled = false; boton.textContent = previo; }, 20000);
          return;
        }
        avisar(texto, 'mal');
        boton.disabled = false; boton.textContent = previo;
      });
    }

    go.addEventListener('click', function () { pedir(go); });
    reenviar.addEventListener('click', function () { pedir(reenviar); });
    otro.addEventListener('click', function () {
      paso2.style.display = 'none';
      paso1.style.display = 'block';
      try { mail.focus(); } catch (e) {}
    });
    w.querySelector('#__recCancel').addEventListener('click', cerrar);
    mail.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); pedir(go); } });
    w.addEventListener('click', function (e) { if (e.target === w) cerrar(); });

    // Escape cierra y Tab no se sale del dialogo.
    w.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
      if (e.key !== 'Tab') return;
      var f = w.querySelectorAll('button:not([disabled]), input, a[href]');
      if (!f.length) return;
      var primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    });

    ultimoFoco = anterior;
    try { mail.focus(); } catch (e) {}
  }

  // El enlace de restablecer.html lleva a login.html#recuperar. Antes solo se
  // abria el modal con un clic, asi que ese enlace aterrizaba en el login sin
  // abrir nada. Con esto se abre solo al llegar con ese hash.
  if (location.hash === '#recuperar') {
    setTimeout(function () { openRecuperar(); }, 300);
  }
  window.addEventListener('hashchange', function () {
    if (location.hash === '#recuperar') openRecuperar();
  });

  // Mini-menu del perfil: "Mi perfil y configuracion" + "Cerrar sesion".
  // Mismo componente en todas las interfaces (sin iconos externos para que jale en todas).
  function profileMenu(anchor, perfilHref) {
    if (!anchor || anchor._unMenu) return;
    anchor._unMenu = true;
    anchor.style.cursor = 'pointer';
    var user = getUser() || {};
    var menu = document.createElement('div');
    menu.className = 'hidden fixed z-[60] w-60 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden un-profile-menu';
    menu.innerHTML =
      '<div class="px-4 py-3 border-b border-slate-100 bg-slate-50/70 un-pm-head">' +
      '<p class="text-sm font-bold text-slate-900 truncate un-pm-name">' + esc(user.nombre || '') + '</p>' +
      '<p class="text-xs text-slate-500 truncate un-pm-mail">' + esc(user.email || '') + '</p></div>' +
      '<a href="' + (perfilHref || '/perfil.html') + '" class="un-pm-link block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Mi perfil y configuración</a>' +
      '<button type="button" class="un-logout-btn un-pm-out un-secure-logout w-full text-left px-4 py-2.5 text-sm font-bold text-[#b0000b] hover:bg-red-50 border-t border-slate-100" aria-label="Cerrar sesión de forma segura">' + secureLogoutMarkup() + '</button>';
    document.body.appendChild(menu);
    menu.querySelector('.un-logout-btn').addEventListener('click', function (e) {
      requestLogout(e);
    });
    function close() { menu.classList.add('hidden'); }
    anchor.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menu.classList.contains('hidden')) {
        var r = anchor.getBoundingClientRect();
        menu.style.top = (r.bottom + 8) + 'px';
        menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
        menu.classList.remove('hidden');
      } else close();
    });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function preferenceKey(name) {
    var u = getUser();
    return (u && u.email) ? name + '::' + String(u.email).toLowerCase() : name;
  }
  function preferenceGet(name, fallback) {
    try {
      var value = localStorage.getItem(preferenceKey(name));
      if (value !== null) return value;
      if (getUser() && getUser().email) return fallback;
      value = localStorage.getItem(name);
      return value === null ? fallback : value;
    } catch (e) { return fallback; }
  }
  function preferenceSet(name, value) {
    try {
      var u = getUser();
      localStorage.setItem(preferenceKey(name), value);
      if (u && u.email) localStorage.removeItem(name);
    } catch (e) {}
  }
  function migrateAccountPreferences() {
    var u = getUser();
    if (!u || !u.email) return;
    ['nerba_font_scale', 'nerba_color_filter', 'nerba_reduce_motion', 'nerba_highlight_links'].forEach(function (name) {
      var key = preferenceKey(name);
      try {
        if (localStorage.getItem(key) === null && localStorage.getItem(name) !== null) localStorage.setItem(key, localStorage.getItem(name));
        if (localStorage.getItem(name) !== null) localStorage.removeItem(name);
      } catch (e) {}
    });
  }
  // Tema oscuro global "Razer NOC" + accesibilidad en TODAS las interfaces.
  // El interruptor vive en el Perfil (nerba_theme dark/light) y se propaga
  // a index, catálogo, cotizador, nosotros, login, admin, superadmin,
  // especiales y electrónica. Por defecto todo queda claro.
  function applyA11yLogged() {
    // Normaliza el dialecto de escala al de la pagina actual ANTES de que corran
    // los controles nativos (perfil usa 14/16/18/20, cotizador/historial sm/md/lg/xl).
    (function () {
      var raw = preferenceGet('nerba_font_scale', null);
      if (raw == null) return;
      var toNum = { sm: '14', md: '16', lg: '18', xl: '20' };
      var toNamed = { '14': 'sm', '16': 'md', '18': 'lg', '20': 'xl' };
      var want = /\/perfil\.html$/.test(location.pathname) ? toNum[String(raw)] : toNamed[String(raw)];
      if (want && want !== String(raw)) preferenceSet('nerba_font_scale', want);
    })();
    var root = document.documentElement, body = document.body;
    var dark = themeGet() === 'dark';
    root.classList.toggle('dark', dark);
    root.classList.toggle('dark-mode', dark);
    try { root.style.colorScheme = dark ? 'dark' : 'light'; } catch (e) {}
    if (body) body.classList.toggle('dark-mode', dark);
    // Adaptador oscuro heredado (catálogo claro) + bandera global Razer
    if (dark && /\/catalogo\.html$/.test(location.pathname)) root.setAttribute('data-un-dark', '');
    else root.removeAttribute('data-un-dark');
    if (dark) root.setAttribute('data-un-dark-razor', '');
    else root.removeAttribute('data-un-dark-razor');
    // Escala: unifica sistema numerico (perfil) y nombrado (cotizador/historial)
    var raw = null;
    try { raw = preferenceGet('nerba_font_scale', '16'); } catch (e) { raw = '16'; }
    var lvl = ({ '14': 'sm', '16': 'md', '18': 'lg', '20': 'xl', sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' })[String(raw)] || 'md';
    ['font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl',
     'font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl'].forEach(function (c) {
      if (body) body.classList.remove(c); root.classList.remove(c);
    });
    if (body) body.classList.add('font-size-' + lvl, 'font-scale-' + lvl);
    root.classList.add('font-scale-' + lvl);
    root.style.fontSize = ({ sm: 14, md: 16, lg: 18, xl: 20 })[lvl] + 'px';
    // Daltonismo/contraste con las clases de cada diseno
    var f = 'none';
    try {
      f = preferenceGet('nerba_color_filter', 'none');
      if (String(f).toLowerCase() === 'normal' || String(f).toLowerCase() === 'none') f = 'none';
    } catch (e) {}
    ['filter-protanopia', 'filter-deuteranopia', 'filter-tritanopia', 'filter-achromatopsia',
     'color-filter-protanopia', 'color-filter-deuteranopia', 'color-filter-tritanopia',
     'color-filter-high-contrast'].forEach(function (c) { if (body) body.classList.remove(c); });
    if (['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'].indexOf(f) >= 0) {
      if (body) body.classList.add('filter-' + f);
      if (f !== 'achromatopsia' && body) body.classList.add('color-filter-' + f);
    }
    if ((f === 'high-contrast' || f === 'contraste') && body) body.classList.add('color-filter-high-contrast');
    try {
      var highlight = preferenceGet('nerba_highlight_links', null);
      if (highlight !== null && body) body.classList.toggle('highlight-links-enabled', highlight !== 'false');
      var reduce = preferenceGet('nerba_reduce_motion', null);
      if (reduce !== null && body) body.classList.toggle('reduce-motion-enabled', reduce === 'true');
      var filterValue = String(preferenceGet('nerba_color_filter', 'none') || 'none').toLowerCase();
      if (filterValue === 'normal') filterValue = 'none';
      Array.prototype.slice.call(document.querySelectorAll('.filter-card')).forEach(function (card) {
        var active = card.getAttribute('data-filter') === filterValue || (filterValue === 'none' && (card.getAttribute('data-filter') || '').toLowerCase() === 'normal');
        card.classList.toggle('ring-2', active);
        card.classList.toggle('ring-primary', active);
        card.classList.toggle('shadow-sm', active);
        card.classList.toggle('bg-surface-container', active);
        card.classList.toggle('bg-surface-container-low', !active);
        var dot = card.querySelector('.filter-dot');
        if (dot) dot.classList.toggle('hidden', !active);
      });
      var themeValue = themeGet();
      Array.prototype.slice.call(document.querySelectorAll('.theme-option')).forEach(function (card) {
        var active = card.getAttribute('data-theme') === themeValue;
        card.classList.toggle('ring-2', active);
        card.classList.toggle('ring-primary', active);
        card.classList.toggle('shadow-sm', active);
        var badge = card.querySelector('.theme-badge');
        if (badge) badge.classList.toggle('hidden', !active);
      });
      var reduceInput = document.getElementById('toggle-reduce-motion');
      if (reduceInput) reduceInput.checked = reduce === 'true';
      var highlightInput = document.getElementById('toggle-highlight-links');
      if (highlightInput) highlightInput.checked = highlight !== 'false';
      var scaleValue = String(preferenceGet('nerba_font_scale', '16'));
      Array.prototype.slice.call(document.querySelectorAll('.font-btn')).forEach(function (button) {
        var value = button.getAttribute('data-font') || button.getAttribute('data-scale') || '';
        if (value) button.classList.toggle('active', value === scaleValue || value === ({ sm: '14', md: '16', lg: '18', xl: '20' })[scaleValue]);
      });
    } catch (e) {}
  }
  function resetA11yFilter() {
    var classes = ['color-filter-protanopia', 'color-filter-deuteranopia', 'color-filter-tritanopia', 'color-filter-high-contrast', 'filter-protanopia', 'filter-deuteranopia', 'filter-tritanopia', 'filter-achromatopsia'];
    classes.forEach(function (name) { document.body.classList.remove(name); });
    var preview = document.getElementById('live-preview-box');
    if (preview) classes.forEach(function (name) { preview.classList.remove(name); });
    try {
      preferenceSet('nerba_color_filter', 'none');
      preferenceSet('nerba_font_scale', '16');
      preferenceSet('nerba_reduce_motion', 'false');
      preferenceSet('nerba_highlight_links', 'true');
    } catch (e) {}
    applyA11yLogged();
  }
  try {
    installPrintGuard();
  } catch (e) {}
  try {
    var resetButton = document.getElementById('btn-reset-accessibility');
    if (resetButton && !resetButton._unResetBound) {
      resetButton._unResetBound = true;
      resetButton.addEventListener('click', function () { setTimeout(resetA11yFilter, 50); });
    }
  } catch (e) {}
  document.addEventListener('click', function (e) {
    var reset = e.target && e.target.closest ? e.target.closest('#btn-reset-accessibility') : null;
    if (reset) setTimeout(resetA11yFilter, 0);
    var filterCard = e.target && e.target.closest ? e.target.closest('.filter-card') : null;
    if (filterCard) {
      var value = filterCard.getAttribute('data-filter') || 'none';
      if (String(value).toLowerCase() === 'normal') value = 'none';
      try { preferenceSet('nerba_color_filter', value); } catch (err) {}
    }
    var fontButton = e.target && e.target.closest ? e.target.closest('.font-btn, #btn-font-inc, #btn-font-dec') : null;
    if (fontButton) {
      var fontValue = localStorage.getItem('nerba_font_scale');
      if (fontValue !== null) preferenceSet('nerba_font_scale', fontValue);
    }
  });
  document.addEventListener('change', function (e) {
    if (!e.target) return;
    if (e.target.id === 'toggle-reduce-motion') preferenceSet('nerba_reduce_motion', e.target.checked ? 'true' : 'false');
    if (e.target.id === 'toggle-highlight-links') preferenceSet('nerba_highlight_links', e.target.checked ? 'true' : 'false');
  });
  // Tema por CUENTA: lectura con clave por email (ver UN_TEMA).
  // Si el loader temprano no esta, resuelve igual sin romper nada.
  function themeGet() {
    try { if (window.UN_TEMA) return UN_TEMA.get(); } catch (e) {}
    try {
      var u = getUser();
      var k = (u && u.email) ? 'nerba_theme::' + String(u.email).toLowerCase() : 'nerba_theme';
      var v = localStorage.getItem(k);
      if (v === 'dark' || v === 'light') return v;
    } catch (e) {}
    return 'light';
  }
  // Setter del tema (lo usa el Perfil y cualquier toggle futuro).
  // Guarda en la cuenta, pinta al instante, avisa a las demas pestanas
  // y lo sube al servidor para que viaje con la cuenta a otros equipos.
  function themeSet(mode, opts) {
    mode = mode === 'dark' ? 'dark' : 'light';
    opts = opts || {};
    try {
      if (window.UN_TEMA) UN_TEMA.set(mode);
      else {
        var u = getUser();
        var k = (u && u.email) ? 'nerba_theme::' + String(u.email).toLowerCase() : 'nerba_theme';
        localStorage.setItem(k, mode);
        if (!u || !u.email) localStorage.setItem('nerba_theme', mode);
        localStorage.setItem('unidos_theme_ping', String(Date.now()));
      }
    } catch (e) {}
    applyA11yLogged();
    if (!opts.nosync) {
      try {
        if (localStorage.getItem('unidos_token')) {
          api('/api/me', { method: 'PUT', body: { tema: mode } }).then(function (me) {
            try { setSession(localStorage.getItem('unidos_token'), me); } catch (e2) {}
          }).catch(function () {});
        }
      } catch (e) {}
    }
    return mode;
  }
  function setThemeMode(mode) { return themeSet(mode); }
  // Sincronización en vivo: si cambias el tema en Perfil, las demás
  // pestañas/ventanas lo aplican sin recargar.
  function watchTheme() {
    window.addEventListener('storage', function (e) {
      if (!e) return;
      var u = getUser();
      var key = (u && u.email) ? 'nerba_theme::' + String(u.email).toLowerCase() : 'nerba_theme';
      if (e.key === 'nerba_theme' && key !== 'nerba_theme') return;
      if (e.key && e.key.indexOf('nerba_theme::') === 0 && e.key !== key) return;
      if (e.key === 'nerba_theme' || e.key === 'unidos_theme_ping' || e.key === key) applyA11yLogged();
    });
  }
  // Inyecta la hoja Razer global si la página aún no la trae (todas las zonas).
  function injectRazerCSS() {
    try {
      if (document.querySelector('link[data-razor-dark]')) return;
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.setAttribute('data-razor-dark', '1');
      l.href = /^\/(admin|superadmin|especiales|electronica)\//.test(location.pathname)
        ? '/css/tema-oscuro-razor.css?v=3.0' : 'css/tema-oscuro-razor.css?v=3.0';
      l.onerror = function () {
        if (l.getAttribute('href').charAt(0) !== '/') l.href = '/css/tema-oscuro-razor.css?v=3.0';
      };
      document.head.appendChild(l);
    } catch (e) {}
  }
  // Activos de accesibilidad para paginas cuyo diseno no los trae (catalogo).
  // Copia exacta de las reglas de los disenos con accesibilidad; solo actuan
  // cuando el usuario las activa (zona con sesion).
  function injectA11yAssets() {
    if (!document.getElementById('filter-protanopia')) {
      var svg = document.createElement('div');
      svg.innerHTML = '<svg style="position:absolute;height:0;width:0;overflow:hidden" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs>' +
        '<filter id="filter-protanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0"/></filter>' +
        '<filter id="filter-deuteranopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0"/></filter>' +
        '<filter id="filter-tritanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0"/></filter>' +
        '</defs></svg>';
      document.body.appendChild(svg);
    }
    if (document.getElementById('un-a11y-css')) return;
    var st = document.createElement('style');
    st.id = 'un-a11y-css';
    st.textContent =
      "body.filter-protanopia{filter:url('#filter-protanopia') !important}" +
      "body.filter-deuteranopia{filter:url('#filter-deuteranopia') !important}" +
      "body.filter-tritanopia{filter:url('#filter-tritanopia') !important}" +
      "body.filter-achromatopsia{filter:grayscale(100%) contrast(110%) !important}" +
      "body.highlight-links-enabled a:not(.no-highlight),body.highlight-links-enabled button:not(.no-highlight){outline:2px dashed #b0000b !important;outline-offset:2px !important}" +
      "body.reduce-motion-enabled *,body.reduce-motion-enabled *::before,body.reduce-motion-enabled *::after{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.001ms !important}";
    document.head.appendChild(st);
  }
  function injectCatalogoDark() {
    if (document.getElementById('un-dark-adapter')) return;
    var st = document.createElement('style');
    st.id = 'un-dark-adapter';
    // Tema oscuro real con la paleta del sistema (los rojos de marca NO se tocan)
    st.textContent =
      'html[data-un-dark] body{background:#0b1120;color:#eaf1ff}' +
      'html[data-un-dark] .bg-surface{background:#0b1120}' +
      'html[data-un-dark] .bg-surface\\/80{background:rgba(11,17,32,.88)}' +
      'html[data-un-dark] .bg-surface-container-lowest{background:#161e2e}' +
      'html[data-un-dark] .bg-surface-container-lowest\\/90{background:rgba(22,30,46,.94)}' +
      'html[data-un-dark] .bg-surface-container-low{background:#0f172a}' +
      'html[data-un-dark] .bg-surface-container{background:#1e293b}' +
      'html[data-un-dark] .border-surface-container{border-color:#2d3748}' +
      'html[data-un-dark] .border-surface-container-high{border-color:#2d3748}' +
      'html[data-un-dark] .text-on-surface{color:#eaf1ff}' +
      'html[data-un-dark] .text-on-surface-variant{color:#c3cede}' +
      'html[data-un-dark] .text-secondary{color:#9fb0c9}' +
      'html[data-un-dark] .un-profile-menu{background:#161e2e;border-color:#2d3748}' +
      'html[data-un-dark] .un-profile-menu .un-pm-head{background:#0f172a;border-color:#2d3748}' +
      'html[data-un-dark] .un-profile-menu .un-pm-name{color:#eaf1ff}' +
      'html[data-un-dark] .un-profile-menu .un-pm-mail{color:#9fb0c9}' +
      'html[data-un-dark] .un-profile-menu .un-pm-link{color:#eaf1ff}' +
      'html[data-un-dark] .un-profile-menu .un-pm-link:hover{background:#0f172a}' +
      'html[data-un-dark] .un-profile-menu .un-pm-out{color:#ff7b7b}' +
      'html[data-un-dark] .un-profile-menu .un-pm-out:hover{background:rgba(217,27,27,.12)}';
    document.head.appendChild(st);
  }

  // Barra de desplazamiento de la pagina, SIEMPRE visible.
  //
  // El sitio traia una regla global '::-webkit-scrollbar{display:none}' en
  // varias paginas: la barra no aparecia y no habia forma de bajar rapido
  // arrastrando. Quitarla no alcanza en todos los equipos: cuando Windows o el
  // navegador usan barras flotantes (overlay), la barra solo sale mientras te
  // mueves y luego se desaparece. Al definirla aqui a mano se vuelve una barra
  // fija que se ve siempre, en cualquier computadora y en cualquier modo.
  function injectScrollbarCSS() {
    if (document.getElementById('un-scrollbar')) return;
    var st = document.createElement('style');
    st.id = 'un-scrollbar';
    st.textContent =
      'html{scrollbar-width:thin;scrollbar-color:#cbd5e1 #f1f5f9;}' +
      'html::-webkit-scrollbar{width:14px;height:14px;}' +
      'html::-webkit-scrollbar-track{background:#f1f5f9;border-left:1px solid #e5e7eb;}' +
      'html::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:8px;' +
        'border:3px solid #f1f5f9;background-clip:padding-box;}' +
      'html::-webkit-scrollbar-thumb:hover{background:#d91b1b;background-clip:padding-box;}' +
      'html.dark,html[data-theme="dark"]{scrollbar-color:#475569 #0f172a;}' +
      'html.dark::-webkit-scrollbar-track,html[data-theme="dark"]::-webkit-scrollbar-track' +
        '{background:#0f172a;border-left-color:#1e293b;}' +
      'html.dark::-webkit-scrollbar-thumb,html[data-theme="dark"]::-webkit-scrollbar-thumb' +
        '{background:#475569;border-color:#0f172a;background-clip:padding-box;}' +
      'html.dark::-webkit-scrollbar-thumb:hover,html[data-theme="dark"]::-webkit-scrollbar-thumb:hover' +
        '{background:#d91b1b;background-clip:padding-box;}';
    document.head.appendChild(st);
  }

  // CSS del header único de zonas staff (admin / proyectos especiales).
  // Solo pinta header.unZh (inyectado por zona); al resto no lo toca.
  function injectZoneHeadCSS() {
    if (document.getElementById('un-zh-css')) return;
    var st = document.createElement('style');
    st.id = 'un-zh-css';
    st.textContent =
      'html,body{overflow-x:hidden;overscroll-behavior:auto !important}' +
      'header.unZh{position:sticky;top:0;z-index:40;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 1px 6px rgba(2,6,23,.06)}' +
      '.unZh-in{max-width:80rem;margin:0 auto;padding:0 16px;height:68px;display:flex;align-items:center;gap:14px}' +
      '.unZh-brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}' +
      '.unZh-brand img{height:34px;width:auto;object-fit:contain}' +
      '.unZh-brand b{display:block;font-size:14px;font-weight:800;letter-spacing:.01em;color:#0b1c30;line-height:1.1;white-space:nowrap;text-transform:uppercase;font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.unZh-brand small{display:block;font-size:8px;font-weight:800;letter-spacing:.08em;color:#b0000b;white-space:nowrap}' +
      '.unZh-nav{display:flex;align-items:center;gap:6px;margin:0 auto;overflow-x:auto;scrollbar-width:none}' +
      '.unZh-nav::-webkit-scrollbar{display:none}' +
      '.unZh-nav a{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:10px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#475569;text-decoration:none;white-space:nowrap;border:1px solid transparent;font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.unZh-nav a svg{width:16px;height:16px;flex-shrink:0}' +
      '.unZh-nav a:hover{background:rgba(176,0,11,.08);color:#b0000b}' +
      '.unZh-nav a:active{transform:scale(.97)}' +
      '.unZh-nav a[aria-current=page]{background:rgba(176,0,11,.1);border-color:rgba(176,0,11,.3);color:#b0000b;font-weight:800}' +
      '.unZh-count{background:#b0000b;color:#fff;border-radius:9999px;font-size:11px;font-weight:800;padding:1px 7px;line-height:1.5}' +
      '.unZh-chip{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:5px 10px 5px 5px;cursor:pointer;flex-shrink:0}' +
      '.unZh-chip:hover{background:#f8fafc}' +
      '.unZh-av{position:relative;width:34px;height:34px;flex-shrink:0}' +
      '.unZh-av img{width:34px;height:34px;border-radius:50%;object-fit:cover;display:block}' +
      '.unZh-dot{position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#10b981;border:2px solid #fff}' +
      '.unZh-who{display:flex;flex-direction:column;align-items:flex-start;line-height:1.25}' +
      '.unZh-who b{font-size:13px;color:#0b1c30;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.unZh-role{font-size:9px;font-weight:800;letter-spacing:.08em;background:#b0000b;color:#fff;border-radius:5px;padding:2px 6px;margin-top:2px}' +
      '.unZh-chev{width:16px;height:16px;color:#94a3b8;flex-shrink:0}' +
      '.unZh-chipwrap{position:relative;flex-shrink:0}' +
      '.unZh-drop{position:absolute;right:0;top:calc(100% + 8px);width:232px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 12px 32px rgba(2,6,23,.14);padding:6px;z-index:60}' +
      '.unZh-drop.hidden{display:none}' +
      '.unZh-drop a,.unZh-drop button{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:8px;font-size:13px;font-weight:600;color:#334155;text-decoration:none;background:none;border:0;cursor:pointer;text-align:left;font-family:Inter,system-ui,sans-serif}' +
      '.unZh-drop a:hover,.unZh-drop button:hover{background:#f1f5f9;color:#0b1c30}' +
      '.unZh-drop a svg,.unZh-drop button svg{width:16px;height:16px;color:#64748b;flex-shrink:0}' +
      '.un-secure-logout{display:flex!important;align-items:center;gap:10px;width:100%;padding:10px 11px!important;margin:6px 2px 2px;border:1px solid #fecaca!important;border-radius:10px!important;background:#fff7f7!important;color:#b0000b!important;box-shadow:0 4px 10px rgba(176,0,11,.06);font:800 12px/1.2 Inter,system-ui,sans-serif!important;text-align:left;cursor:pointer;transition:background .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease}' +
      '.un-secure-logout:hover{background:#fee2e2!important;border-color:#fca5a5!important;transform:translateY(-1px);box-shadow:0 7px 16px rgba(176,0,11,.12)}' +
      '.un-secure-logout:active{transform:translateY(0) scale(.98)}' +
      '.un-secure-logout:focus-visible{outline:3px solid rgba(217,27,27,.28)!important;outline-offset:2px}' +
      '.un-secure-logout-icon{display:grid;place-items:center;width:30px;height:30px;flex:0 0 30px;border-radius:9px;background:#fee2e2;color:#b0000b}' +
      '.un-secure-logout-icon svg{width:17px;height:17px;stroke-width:2.2}' +
      '.un-secure-logout-copy{display:flex;flex-direction:column;gap:3px;min-width:0}' +
      '.un-secure-logout-copy strong{font-size:12px;line-height:1.1;font-weight:800}' +
      '.un-secure-logout-copy small{font-size:9px;line-height:1.1;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#9f1239}' +
      'html.dark-mode .un-secure-logout,html.dark .un-secure-logout{background:#2a1418!important;border-color:#7f1d1d!important;color:#ffb4ab!important}' +
      'html.dark-mode .un-secure-logout:hover,html.dark .un-secure-logout:hover{background:#451a21!important;border-color:#ef4444!important}' +
      'html.dark-mode .un-secure-logout-icon,html.dark .un-secure-logout-icon{background:#4c1d24!important;color:#ffb4ab!important}' +
      'html.dark-mode .un-secure-logout-copy small,html.dark .un-secure-logout-copy small{color:#fca5a5!important}' +
      '.unZh-drop hr{border:0;border-top:1px solid #e5e7eb;margin:6px 4px}' +
      '.unZh-auth{display:flex;align-items:center;gap:10px;flex-shrink:0}' +
      '.unZh-login{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#475569;text-decoration:none;padding:9px 6px;font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.unZh-login:hover{color:#b0000b}' +
      '.unZh-reg{background:#d91b1b;color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;padding:10px 18px;border-radius:8px;font-family:\'Plus Jakarta Sans\',Inter,system-ui,sans-serif}' +
      '.unZh-reg:hover{background:#b0000b}' +
      '@media(max-width:900px){.unZh-who{display:none}.unZh-in{gap:10px}}' +
      '@media(max-width:720px){.unZh-in{flex-wrap:wrap;height:auto;padding:10px 12px;row-gap:8px}.unZh-nav{order:3;flex-basis:100%;margin:0}.unZh-chip{margin-left:auto}}' +
      // Campana de notificaciones: va aquí (y no solo en css/menu-unico.css)
      // porque unidos.js se carga en TODAS las páginas; menu-unico.js no.
      '.unZh-bellwrap{position:relative;display:flex;align-items:center;flex-shrink:0}' +
      '.unZh-bell{position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:1px solid #e5e7eb;border-radius:10px;background:#fff;color:#6b7280;cursor:pointer;transition:background .18s ease,color .18s ease,border-color .18s ease}' +
      '.unZh-bell:hover{background:#f9fafb;color:#b0000b;border-color:rgba(176,0,11,.25)}' +
      '.unZh-bell:active{transform:scale(.96)}' +
      '.unZh-bellsvg{width:18px;height:18px;flex-shrink:0}' +
      '.unZh-belldot{display:none;position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:50%;background:#d91b1b;border:2px solid #fff;box-shadow:0 0 0 1px rgba(217,27,27,.25)}' +
      '.unZh-belldrop{position:absolute;top:calc(100% + 8px);right:0;width:340px;max-width:calc(100vw - 24px);max-height:430px;overflow-y:auto;overscroll-behavior:contain;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.14);z-index:9999;text-align:left}' +
      '.unZh-belldrop.hidden{display:none}' +
      // Encabezado fijo de la campana: título + "Marcar leídas". No cambia el
      // diseño de los renglones, solo agrega la barra superior.
      '.unZh-bellhead{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;background:#fff;border-bottom:1px solid #e5e7eb;z-index:2}' +
      '.unZh-bellhead b{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#111827}' +
      '.unZh-bellhead button{border:0;background:none;color:#d91b1b;font-size:12px;font-weight:700;cursor:pointer;padding:2px 4px;white-space:nowrap}' +
      '.unZh-bellhead button:hover{text-decoration:underline}' +
      // ✕ para eliminar de MI campana. Sutil: solo se nota al pasar el mouse
      // (en táctil siempre se ve un poco).
      '.unZh-bellx{flex-shrink:0;width:22px;height:22px;margin-top:1px;border:0;border-radius:6px;background:transparent;color:#cbd5e1;font-size:15px;line-height:1;cursor:pointer;opacity:0;transition:opacity .15s ease;padding:0}' +
      '.unZh-bellitem:hover .unZh-bellx{opacity:1}' +
      '.unZh-bellx:hover{background:#fee2e2;color:#b91c1c}' +
      '@media(hover:none){.unZh-bellx{opacity:.6}}' +
      '.unZh-bellempty{padding:24px 16px;text-align:center;font-size:13px;color:#9ca3af}' +
      '.unZh-bellitem{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;text-decoration:none;border-bottom:1px solid #f3f4f6;transition:background .15s ease}' +
      '.unZh-bellitem:last-child{border-bottom:0}' +
      '.unZh-bellitem:hover{background:#f9fafb}' +
      '.unZh-bellitem.unZh-bellunread{background:#fef2f2}' +
      '.unZh-bellitem.unZh-bellunread:hover{background:#fee2e2}' +
      '.unZh-belltxt{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}' +
      '.unZh-belltxt b{font-size:13px;font-weight:700;color:#111827;line-height:1.3;font-family:Inter,system-ui,sans-serif}' +
      '.unZh-belltxt small{font-size:12px;color:#6b7280;line-height:1.35;font-family:Inter,system-ui,sans-serif}' +
      '.unZh-belltime{font-size:11px;color:#9ca3af;white-space:nowrap;flex-shrink:0;margin-top:2px}' +
      'html.dark-mode .unZh-bell,html.dark .unZh-bell{background:#1e293b;border-color:#334155;color:#cbd5e1}' +
      'html.dark-mode .unZh-bell:hover,html.dark .unZh-bell:hover{background:#334155;color:#fff}' +
      'html.dark-mode .unZh-belldrop,html.dark .unZh-belldrop{background:#0f172a;border-color:#334155}' +
      'html.dark-mode .unZh-belltxt b,html.dark .unZh-belltxt b{color:#f1f5f9}' +
      'html.dark-mode .unZh-belltxt small,html.dark .unZh-belltxt small{color:#94a3b8}' +
      'html.dark-mode .unZh-bellhead,html.dark .unZh-bellhead{background:#0f172a;border-color:#334155}' +
      'html.dark-mode .unZh-bellhead b,html.dark .unZh-bellhead b{color:#f1f5f9}' +
      '@media(max-width:640px){.unZh-belldrop{width:calc(100vw - 24px);right:-8px}.unZh-bell{width:36px;height:36px}}';
    document.head.appendChild(st);
  }
  // Header único para TODAS las zonas y roles (mismo estilo del index nuevo:
  // barra blanca, botones píldora en mayúsculas, chip de perfil con dropdown).
  // Cada zona conserva SUS links; solo se unifica el look. Sin "Preferencias".
  function zhIcon(p) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  var ZH_DOC = '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>';
  var ZH_GRID = '<path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>';
  var ZH_USERS = '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>';
  var ZH_CLIP = '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M9 12h6"/><path d="M9 16h6"/>';
  var ZH_GEAR = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>';
  var ZH_LAYERS = '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>';
  var ZH_INBOX = '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>';
  var ZH_CLOCK = '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
  var ZH_CHEV = '<path d="M19 9l-7 7-7-7"/>';
  var ZH_PERSON = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
  var ZH_FILE = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>';
  var ZH_OUT = '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>';
  var ZH_BELL = '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>';
  function secureLogoutMarkup() {
    return '<span class="un-secure-logout-icon">' + zhIcon(ZH_OUT) + '</span><span class="un-secure-logout-copy"><strong>Cerrar sesión</strong><small>Sesión segura</small></span>';
  }
  function zhNavLink(href, icon, label, extra) {
    return '<a href="' + href + '"' + (extra || '') + '>' + zhIcon(icon) + '<span>' + label + '</span></a>';
  }
  // Que barra va en la pagina depende del ROL, no de la pagina.
  //
  // Antes las paginas publicas (inicio, cotizador, nosotros, electronica) fijaban
  // la zona 'cliente' a fuerza y el cableado compartido hacia lo mismo. Un admin
  // que abria el inicio veia "Mis Cotizaciones" y sus herramientas nada mas: las
  // interfaces de todos los roles quedaban mezcladas. Cada rol entra con lo suyo.
  function zonaDeRol(rol) {
    switch (String(rol || '').toUpperCase()) {
      case 'ADMIN': return 'admin';
      case 'SUPERADMIN': return 'superadmin';
      case 'PRODUCTOS_ELECTRONICOS': return 'electronica';
      case 'PROYECTOS_ESPECIALES': return 'especiales';
      default: return 'cliente';
    }
  }
  // Barra que corresponde a quien esta conectado en esta pagina. Sin sesion,
  // la de visitante.
  function ensureMenuRol() {
    var u = getUser() || {};
    var conSesion = false;
    try { conSesion = !!localStorage.getItem('unidos_token'); } catch (e) {}
    ensureMenu(conSesion && u.nombre ? zonaDeRol(u.rol) : 'out');
  }
  function zhHTML(zone) {
    var brandHome = zone === 'admin' ? '/admin/catalogo.html'
      : (zone === 'superadmin' ? '/superadmin/catalogo.html'
      : (zone === 'especiales' ? '/especiales/gestion.html'
      : (zone === 'electronica' ? '/electronica/catalogo.html' : '/index.html')));
    var nav = '';
    if (zone === 'out') {
      nav = zhNavLink('/index.html#seccion-catalogo', ZH_GRID, 'Catálogo', ' data-path="catalogo"')
        + zhNavLink('/cotizador.html', ZH_DOC, 'Cotizador', ' data-path="cotizador"')
        + zhNavLink('/nosotros.html', ZH_USERS, 'Nosotros', ' data-path="nosotros"');
    } else if (zone === 'cliente') {
      nav = zhNavLink('/index.html#seccion-catalogo', ZH_GRID, 'Catálogo', ' data-path="catalogo"')
        + zhNavLink('/productos-electronicos.html', ZH_GRID, 'Electrónica y refacciones', ' data-path="productos-electronicos"')
        + zhNavLink('/cotizador.html', ZH_DOC, 'Cotizador', ' data-path="cotizador"')
        + zhNavLink('/mis-cotizaciones.html', ZH_FILE, 'Mis Cotizaciones');
    } else if (zone === 'admin') {
      nav = zhNavLink('/admin/cotizaciones.html', ZH_DOC, 'Cotizaciones Recibidas')
        + zhNavLink('/admin/historial.html', ZH_CLOCK, 'Historial general')
        + zhNavLink('/admin/catalogo.html', ZH_GRID, 'Catálogo')
        + zhNavLink('/admin/mantenimiento.html', ZH_GEAR, 'Mantenimientos')
        + zhNavLink('/avisos.html', ZH_BELL, 'Avisos');
    } else if (zone === 'electronica') {
      nav = zhNavLink('/electronica/cotizaciones.html', ZH_DOC, 'Cotizaciones Recibidas')
        + zhNavLink('/electronica/catalogo.html', ZH_GRID, 'Catálogo')
        + zhNavLink('/electronica/historial.html', ZH_CLOCK, 'Historial')
        + zhNavLink('/avisos.html', ZH_BELL, 'Avisos');
    } else if (zone === 'superadmin') {
      nav = zhNavLink('/superadmin/cotizaciones.html', ZH_DOC, 'Cotizaciones Recibidas')
        + zhNavLink('/superadmin/catalogo.html', ZH_GRID, 'Catálogo')
        + zhNavLink('/superadmin/usuarios.html', ZH_USERS, 'Usuarios')
        + zhNavLink('/superadmin/bitacora.html', ZH_CLIP, 'Bitácora')
        + zhNavLink('/avisos.html', ZH_BELL, 'Avisos');
    } else if (zone === 'especiales') {
      nav = zhNavLink('/especiales/gestion.html', ZH_LAYERS, 'Proyectos Especiales')
        + zhNavLink('/especiales/solicitudes.html', ZH_INBOX, 'Proyectos Recibidos')
        + zhNavLink('/especiales/historial.html', ZH_CLOCK, 'Historial')
        + zhNavLink('/avisos.html', ZH_BELL, 'Avisos');
    }
    var right = '';
    if (zone === 'out') {
      right = '<div class="unZh-auth"><a class="unZh-login" href="/login.html">Iniciar Sesión</a>' +
        '<a class="unZh-reg" href="/registro.html">Registrarse</a></div>';
    } else {
      right = '<div class="unZh-bellwrap"><button type="button" class="unZh-bell" id="unZh-bell" aria-label="Notificaciones">' +
        zhIcon(ZH_BELL).replace('<svg', '<svg class="unZh-bellsvg"') +
        '<i class="unZh-belldot" id="unZh-belldot"></i></button>' +
        '<div class="unZh-belldrop hidden" id="unZh-belldrop"></div></div>' +
        '<div class="unZh-chipwrap"><button type="button" class="unZh-chip" id="unZh-chip">' +
        '<span class="unZh-av"><img id="unZh-avatar" src="https://ui-avatars.com/api/?name=UN&background=b0000b&color=fff&bold=true" alt="perfil"><i class="unZh-dot"></i></span>' +
        '<span class="unZh-who"><b id="unZh-name">Usuario</b><span class="unZh-role" id="unZh-role">ROL</span></span>' +
        zhIcon(ZH_CHEV).replace('<svg', '<svg class="unZh-chev"') +
        '</button><div class="unZh-drop hidden" id="unZh-drop"></div></div>';
    }
    return '<div class="unZh-in">' +
      '<a class="unZh-brand" href="' + brandHome + '">' +
      '<img src="/assets/logo.png" alt="' + esc(BRAND_ALT) + '" onerror="this.style.display=\'none\'">' +
      '<span><b>' + esc(BRAND_NAME) + '</b><small>' + esc(BRAND_SUBTITLE) + '</small></span></a>' +
      '<nav class="unZh-nav">' + nav + '</nav>' + right + '</div>';
  }
  function zhPaint(header) {
    var u = getUser() || {};
    try {
      var nm = header.querySelector('#unZh-name');
      if (nm && u.nombre) nm.textContent = u.nombre;
      var rl = header.querySelector('#unZh-role');
      if (rl) rl.textContent = String(u.rol || '').replace(/_/g, ' ') || 'USUARIO';
      paintProfileAvatars();
    } catch (e) { /* decorativo */ }
  }
  function zhDrop(header, zone) {
    var chip = header.querySelector('#unZh-chip');
    var drop = header.querySelector('#unZh-drop');
    if (!chip || !drop) return;
    var perfil = zone === 'admin' ? '/admin/perfil.html'
      : (zone === 'superadmin' ? '/superadmin/perfil.html'
      : (zone === 'especiales' ? '/especiales/perfil.html'
      : (zone === 'electronica' ? '/electronica/perfil.html' : '/perfil.html')));
    var items = '<a href="' + perfil + '">' + zhIcon(ZH_PERSON) + '<span>Mi Perfil</span></a>';
    items += '<hr><button type="button" class="un-secure-logout unZh-out" data-logout aria-label="Cerrar sesión de forma segura">' + secureLogoutMarkup() + '</button>';
    drop.innerHTML = items;
    var out = drop.querySelector('[data-logout]');
    if (out) out.addEventListener('click', function (e) {
      drop.classList.add('hidden');
      requestLogout(e);
    });
    if (chip._unZh) return;
    chip._unZh = true;
    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      drop.classList.toggle('hidden');
    });
  document.addEventListener('click', function (e) {
      if (!drop.classList.contains('hidden') && !chip.contains(e.target)) drop.classList.add('hidden');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') drop.classList.add('hidden');
    });
  }
  function zhBell(header) {
    var bell = header.querySelector('#unZh-bell');
    var belldrop = header.querySelector('#unZh-belldrop');
    var belldot = header.querySelector('#unZh-belldot');
    if (!bell || !belldrop) return;
    // Clave NUEVA: las versiones viejas guardaban "visto" con otro formato y
    // marcaban todo como leido, por eso no salia nada. Se empieza de cero.
    // Además es POR USUARIO: en una PC compartida lo que vio una cuenta no se
    // lo esconde a la siguiente.
    var SEEN_KEY = 'nerba_notis_vistas_v1';
    try {
      var ku0 = getUser() || {};
      if (ku0.email) SEEN_KEY += '::' + String(ku0.email).toLowerCase();
    } catch (e0) {}
    var notis = [];
    var seen = {};
    var fallo = false;
    var pollTimer = null;
    try {
      var saved = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
      if (saved && typeof saved === 'object') seen = saved;
    } catch (e) {}
    function saveSeen() {
      try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch (e) {}
    }
    // Avisos descartados con la ✕ de la campana: solo se esconden en ESTA
    // cuenta (no se borran del servidor). Por usuario y con tope para que la
    // lista no crezca sin fin.
    var DISMISS_KEY = 'nerba_notis_descartadas_v1';
    try {
      var ku1 = getUser() || {};
      if (ku1.email) DISMISS_KEY += '::' + String(ku1.email).toLowerCase();
    } catch (e1) {}
    var dismissed = {};
    try {
      var dSaved = JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
      if (dSaved && typeof dSaved === 'object') dismissed = dSaved;
    } catch (e2) {}
    function saveDismissed() {
      try {
        var ks = Object.keys(dismissed);
        if (ks.length > 200) {
          var rec = {};
          ks.slice(-200).forEach(function (k) { rec[k] = dismissed[k]; });
          dismissed = rec;
        }
        localStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed));
      } catch (e3) {}
    }
    function renderNotis() {
      var unread = notis.filter(function (n) { return !n.leida; }).length;
      if (belldot) belldot.style.display = unread > 0 ? 'block' : 'none';
      if (!notis.length) {
        belldrop.innerHTML = '<div class="unZh-bellempty">' + (fallo ? 'No se pudieron cargar las notificaciones' : 'Sin notificaciones') + '</div>';
        return;
      }
      belldrop.innerHTML = '<div class="unZh-bellhead"><b>Notificaciones' + (unread ? ' (' + unread + ')' : '') + '</b>' +
        (unread ? '<button type="button" data-leer-todas>Marcar leídas</button>' : '') + '</div>' +
        notis.map(function (n) {
        var time = n.fecha ? new Date(n.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
        return '<a class="unZh-bellitem' + (n.leida ? '' : ' unZh-bellunread') + '" href="' + (n.link || '#') + '" data-id="' + n.id + '"' + (n.avisoId ? ' data-aviso="' + esc(n.avisoId) + '"' : '') + '>' +
          '<span class="unZh-belltxt"><b>' + esc(n.titulo || 'Notificación') + '</b><small>' + esc(n.mensaje || '') + '</small></span>' +
          '<span class="unZh-belltime">' + time + '</span>' +
          '<button type="button" class="unZh-bellx" data-x="' + n.id + '" title="Eliminar" aria-label="Eliminar notificación">×</button></a>';
      }).join('');
    }
    function addNoti(n) {
      var key = n.tipo + '|' + n.ref;
      // Descartada con la ✕: no vuelve a entrar aunque el servidor la siga
      // mandando. Si cambia de estado (pendiente→aprobada) la clave cambia y
      // esa sí aparece como nueva.
      if (dismissed[key]) return;
      if (typeof n.leida !== 'boolean') n.leida = !!seen[key];
      n.key = key;
      var existe = null;
      for (var i = 0; i < notis.length; i++) { if (notis[i].key === key) { existe = i; break; } }
      if (existe !== null) notis[existe] = n; else notis.unshift(n);
      if (notis.length > 30) notis = notis.slice(0, 30);
      renderNotis();
    }
    function marcarLeida(key) {
      if (!key || seen[key]) return;
      seen[key] = true;
      saveSeen();
      notis.forEach(function (n) { if (n.key === key) n.leida = true; });
      renderNotis();
    }
    // "Marcar leídas" del encabezado: todas las visibles de un jalón.
    function marcarTodas() {
      notis.forEach(function (n) {
        n.leida = true;
        if (n.key && !seen[n.key]) seen[n.key] = true;
      });
      saveSeen();
      renderNotis();
    }
    // ✕ de cada aviso: lo saca de MI campana (el servidor lo conserva para
    // los demás; el staff lo borra para todos desde /avisos.html).
    function descartarNoti(id) {
      for (var i = 0; i < notis.length; i++) {
        if (notis[i].id === id) {
          if (notis[i].key) { dismissed[notis[i].key] = true; saveDismissed(); }
          notis.splice(i, 1);
          break;
        }
      }
      renderNotis();
    }
    function tomarLista(data) {
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object') {
        return data.cotizaciones || data.items || data.data || data.rows || data.lista || data.results || [];
      }
      return [];
    }
    async function pollQuotes() {
      try {
        var u = getUser() || {};
        var rol = String(u.rol || '').toUpperCase();
        var isStaff = ['ADMIN', 'SUPERADMIN', 'PRODUCTOS_ELECTRONICOS', 'PROYECTOS_ESPECIALES'].indexOf(rol) >= 0;
        var data = await api('/api/cotizaciones');
        var list = tomarLista(data);
        var zone = header._unZhZone || '';
        fallo = false;
        list.forEach(function (c) {
          if (!c) return;
          var folio = c.folio || c.id;
          if (!folio) return;
          var estado = String(c.estado || 'PENDIENTE').toUpperCase();
          var cliente = (c.cliente && (c.cliente.nombre || c.cliente.email)) || c.clienteNombre || c.usuario || c.nombre || 'Cliente';
          var linkStaff = zone === 'admin' ? '/admin/cotizaciones.html'
            : zone === 'superadmin' ? '/superadmin/cotizaciones.html'
            : zone === 'electronica' ? '/electronica/cotizaciones.html'
            : zone === 'especiales' ? '/especiales/solicitudes.html'
            : '/mis-cotizaciones.html';
          if (isStaff) {
            if (estado === 'PENDIENTE') {
              addNoti({ id: 'pend-' + folio, tipo: 'cotizacion', ref: folio, titulo: 'Cotización recibida', mensaje: folio + ' de ' + cliente, fecha: c.fecha || c.createdAt || c.creado || new Date().toISOString(), link: linkStaff, leida: false });
            }
          } else {
            var userId = u.id || u._id || u.email || '';
            var cotCliente = c.clienteId || c.cliente_id || c.usuarioId || c.usuario_id || (c.cliente && (c.cliente.id || c.cliente._id || c.cliente.email)) || '';
            if (userId && cotCliente && String(userId) !== String(cotCliente)) return;
            if (estado === 'APROBADA' || estado === 'APROBADO') {
              addNoti({ id: 'aprob-' + folio, tipo: 'aprobada', ref: folio, titulo: 'Cotización aprobada', mensaje: folio + ' ha sido aprobada', fecha: c.fecha || c.createdAt || new Date().toISOString(), link: '/mis-cotizaciones.html', leida: false });
            } else if (estado === 'RECHAZADA' || estado === 'RECHAZADO') {
              addNoti({ id: 'rech-' + folio, tipo: 'rechazada', ref: folio, titulo: 'Cotización rechazada', mensaje: folio + ' ha sido rechazada', fecha: c.fecha || c.createdAt || new Date().toISOString(), link: '/mis-cotizaciones.html', leida: false });
            }
          }
        });
        try {
          if (window.AVISOS && window.AVISOS.para) {
            window.AVISOS.para(u).forEach(function (a) {
              addNoti({
                id: 'aviso-' + a.id, tipo: 'aviso', ref: a.id,
                titulo: 'Aviso: ' + (a.titulo || ''), mensaje: a.texto || '',
                fecha: a.fecha || new Date().toISOString(), link: '#',
                leida: !!a.leida, avisoId: a.id
              });
            });
          }
        } catch (eAv) {}
      } catch (e) {
        fallo = true;
        renderNotis();
      }
    }
    // Avisos personalizados del staff: viven en el servidor (/api/avisos), así
    // que llegan a cualquier PC o celular. Se mezclan con las de cotizaciones.
    // Se cachean para que la ventanita (AVISOS.abrirVer) los abra sin pedirlos
    // de nuevo; el clic de la campana los abre por avisoId.
    async function pollAvisos() {
      try {
        var data = await api('/api/avisos');
        var list = Array.isArray(data) ? data : (data.avisos || data.items || []);
        var ahora = new Date().toISOString();
        try { window.__avisosSrv = list; } catch (eCache) {}
        list.forEach(function (a) {
          if (!a || !a.id) return;
          // En la campana solo vigentes: los vencidos o desactivados se
          // gestionan en /avisos.html, aquí no estorban.
          if (a.activa === false) return;
          if (a.expira && String(a.expira) < ahora) return;
          addNoti({ id: 'aviso-' + a.id, tipo: 'aviso', ref: String(a.id), titulo: a.titulo || 'Aviso', mensaje: a.mensaje || a.texto || '', fecha: a.creada || a.fecha || ahora, link: a.link || '#', leida: false, avisoId: String(a.id) });
        });
      } catch (e) {}
    }
    bell.addEventListener('click', function (e) {
      e.stopPropagation();
      belldrop.classList.toggle('hidden');
      if (!belldrop.classList.contains('hidden')) { pollQuotes(); pollAvisos(); }
    });
    document.addEventListener('click', function (e) {
      if (!belldrop.classList.contains('hidden') && !bell.contains(e.target)) belldrop.classList.add('hidden');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') belldrop.classList.add('hidden');
    });
    belldrop.addEventListener('click', function (e) {
      // La ✕ va DENTRO del renglón: se atiende primero para no disparar el
      // clic del aviso (ni navegar ni abrir la ventanita).
      var x = e.target.closest('[data-x]');
      if (x) {
        e.preventDefault();
        e.stopPropagation();
        descartarNoti(x.getAttribute('data-x'));
        return;
      }
      var todas = e.target.closest('[data-leer-todas]');
      if (todas) {
        e.preventDefault();
        e.stopPropagation();
        marcarTodas();
        return;
      }
      var item = e.target.closest('.unZh-bellitem');
      if (!item) return;
      if (item.hasAttribute('data-aviso')) {
        e.preventDefault();
        e.stopPropagation();
        var aid = item.getAttribute('data-aviso');
        notis.forEach(function (n) { if (n.avisoId === aid) marcarLeida(n.key); });
        try { if (window.AVISOS && window.AVISOS.abrirVer) window.AVISOS.abrirVer(aid); } catch (e2) {}
        belldrop.classList.add('hidden');
        return;
      }
      var id = item.getAttribute('data-id');
      notis.forEach(function (n) {
        if (n.id === id) marcarLeida(n.key);
      });
    });
    pollQuotes();
    pollAvisos();
    pollTimer = setInterval(function () { pollQuotes(); pollAvisos(); }, 30000);
    header._zhBellCleanup = function () { if (pollTimer) clearInterval(pollTimer); };
  }
  function zhActive(header) {
    try {
      var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      Array.prototype.slice.call(header.querySelectorAll('nav a')).forEach(function (a) {
        var h = (a.getAttribute('href') || '').toLowerCase().split(/[?#]/)[0];
        var f = h.split('/').pop();
        if (f && f === page) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    } catch (e) {}
  }
  function syncMobileNavVisibility() {
    var fab = document.getElementById('un-mnav-fab');
    if (!fab) return;
    var mobile = window.innerWidth <= 767;
    var unified = !!document.querySelector('header.unZh');
    fab.style.display = unified || !mobile ? 'none' : 'flex';
    document.body.classList.toggle('un-mobile-nav-active', !unified && mobile);
    if (!window.__unMnavResize) {
      window.__unMnavResize = true;
      window.addEventListener('resize', syncMobileNavVisibility);
    }
  }
  function ensureMenu(zone) {
    zone = zone || 'out';
    var header = document.querySelector('header');
    if (!header) return false;
    if (header._unZh && header._unZhZone === zone) {
      try { zhPaint(header); } catch (e) {}
      return true;
    }
    var wasFixed = false;
    try { wasFixed = getComputedStyle(header).position === 'fixed'; } catch (e) {}
    header._unZh = true;
    header._unZhZone = zone;
    header.className = 'unZh';
    header.innerHTML = zhHTML(zone);
    syncMobileNavVisibility();
    zhPaint(header);
    zhDrop(header, zone);
    zhBell(header);
    zhActive(header);
    if (wasFixed) {
      var m = document.querySelector('main');
      if (m) {
        try {
          var pt = parseFloat(getComputedStyle(m).paddingTop) || 0;
          if (pt >= 64) m.style.paddingTop = Math.max(0, pt - 68) + 'px';
        } catch (e) {}
      }
    }
    try { rewriteLinks(); } catch (e) {}
    return true;
  }
  // Sidebar movil compartido: en telefonos el nav de los disenos se oculta,
  // asi que se inyecta hamburguesa + drawer con los enlaces de cada rol/zona.
  // Solo CSS propio (cero dependencias) y solo visible bajo 768px.
  function injectMobileNav() {
    if (document.getElementById('un-mnav-fab')) return;
    var logged = !!localStorage.getItem('unidos_token');
    var u = getUser() || {};
    var rol = u.rol || '';
    var path = location.pathname;
    function isStaffR() { return rol === 'ADMIN' || rol === 'SUPERADMIN'; }
    var L;
    if (!logged) {
      L = [
        ['Inicio', '/index.html'], ['Catálogo', '/index.html#seccion-catalogo'],
        ['Cotizador', '/cotizador.html'], ['Electrónica y refacciones', '/productos-electronicos.html'],
        ['Nosotros', '/nosotros.html'],
        ['Contacto', '/index.html#contacto'], ['Iniciar Sesión', '/login.html'],
        ['Registrarse', '/registro.html'],
      ];
    } else if (rol === 'SUPERADMIN') {
      L = [
        ['Cotizaciones', '/superadmin/cotizaciones.html'], ['Catálogo', '/superadmin/catalogo.html'],
        ['Usuarios', '/superadmin/usuarios.html'], ['Bitácora', '/superadmin/bitacora.html'],
        ['Avisos', '/avisos.html'], ['Mi Perfil', '/superadmin/perfil.html'],
      ];
    } else if (isStaffR()) {
      L = [
        ['Catálogo', '/admin/catalogo.html'], ['Cotizaciones', '/admin/cotizaciones.html'],
        ['Mantenimientos', '/admin/mantenimiento.html'], ['Avisos', '/avisos.html'], ['Mi Perfil', '/admin/perfil.html'],
      ];
      if (rol === 'ADMIN') L.splice(2, 0, ['Historial general', '/admin/historial.html']);
    } else if (rol === 'PROYECTOS_ESPECIALES') {
      L = [
        ['Solicitudes', '/especiales/solicitudes.html'], ['Gestión', '/especiales/gestion.html'],
        ['Historial', '/especiales/historial.html'], ['Avisos', '/avisos.html'], ['Mi Perfil', '/especiales/perfil.html'],
      ];
    } else if (rol === 'PRODUCTOS_ELECTRONICOS') {
      L = [
        ['Cotizaciones', '/electronica/cotizaciones.html'], ['Catálogo', '/electronica/catalogo.html'],
        ['Historial', '/electronica/historial.html'], ['Avisos', '/avisos.html'], ['Mi Perfil', '/electronica/perfil.html'],
      ];
    } else {
      L = [
        ['Catálogo', '/index.html#seccion-catalogo'], ['Cotizador', '/cotizador.html'],
        ['Electrónica y refacciones', '/productos-electronicos.html'],
        ['Mis Cotizaciones', '/mis-cotizaciones.html'], ['Mi Perfil', '/perfil.html'],
      ];
    }
    var css = '@media(max-width:767px){body.un-mobile-nav-active{padding-bottom:76px}}' +
      '#un-mnav-fab{position:fixed;right:16px;bottom:16px;width:56px;height:56px;border-radius:50%;' +
      'background:#b0000b;color:#fff;border:none;box-shadow:0 8px 20px rgba(0,0,0,.3);z-index:65;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;padding:0}' +
      '#un-mnav-fab span{display:block;width:22px;height:2.5px;background:#fff;border-radius:2px}' +
      '@media(min-width:768px){#un-mnav-fab{display:none}}' +
      '#un-mnav-ovl{position:fixed;inset:0;background:rgba(2,6,23,.6);z-index:74;opacity:0;pointer-events:none;transition:opacity .25s}' +
      '#un-mnav-ovl.open{opacity:1;pointer-events:auto}' +
      '#un-mnav-panel{position:fixed;top:0;right:0;height:100vh;height:100dvh;width:min(300px,84vw);background:#fff;z-index:75;' +
      'transform:translateX(105%);transition:transform .28s ease;display:flex;flex-direction:column;box-shadow:-8px 0 24px rgba(0,0,0,.18)}' +
      '#un-mnav-panel.open{transform:none}' +
      '@media(min-width:768px){#un-mnav-ovl,#un-mnav-panel{display:none}}' +
      '#un-mnav-panel .hd{background:#b0000b;color:#fff;padding:18px 16px}' +
      '#un-mnav-panel .hd b{display:block;font-size:15px;letter-spacing:.5px;text-transform:uppercase}' +
      '#un-mnav-panel .hd small{display:block;font-size:11px;opacity:.85;margin-top:2px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '#un-mnav-panel nav{flex:1;overflow-y:auto;padding:10px}' +
      '#un-mnav-panel nav a{display:flex;align-items:center;gap:10px;padding:12px 12px;border-radius:10px;' +
      'color:#0b1c30;text-decoration:none;font-size:14px;font-weight:600;border-left:4px solid transparent}' +
      '#un-mnav-panel nav a.on{background:#fef2f2;border-left-color:#b0000b;color:#b0000b}' +
      '#un-mnav-panel nav a:active{background:#f1f5f9}' +
      '#un-mnav-panel .ft{padding:12px 16px;border-top:1px solid #e2e8f0}' +
      '#un-mnav-panel .ft button{width:100%;padding:12px;border:none;border-radius:10px;background:#0b1c30;color:#fff;' +
      'font-size:14px;font-weight:700;cursor:pointer}' +
      'body.un-menu-leaving{opacity:.92;transition:opacity .12s ease;pointer-events:none}' +
      '#un-mnav-load{position:fixed;inset:0;background:#fff;z-index:90;display:none;' +
      'flex-direction:column;align-items:center;justify-content:center;gap:20px;color:#334155;opacity:0;pointer-events:none;transition:opacity .14s ease}' +
      '#un-mnav-load.open{display:flex;opacity:1;pointer-events:auto}' +
      '#un-mnav-load .mark{width:80px;height:80px;object-fit:contain;background:#fff;display:block}' +
      '#un-mnav-load .line{position:relative;width:150px;height:6px;border-radius:999px;overflow:hidden;background:#b0000b;box-shadow:0 0 12px rgba(217,27,27,.4);animation:un-load-line-pulse 1.2s ease-in-out infinite}' +
      '#un-mnav-load .line::before{content:\'\';position:absolute;top:-3px;bottom:-3px;left:0;width:28px;border-radius:999px;background:#fff;opacity:.45;filter:blur(2px);animation:un-load-line-sheen 1.35s ease-in-out infinite}' +
      '#un-mnav-load .line i{position:relative;z-index:1;display:block;width:48%;height:100%;border-radius:inherit;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.25) 25%,#fff 50%,rgba(255,255,255,.25) 75%,transparent 100%);box-shadow:0 0 8px rgba(255,255,255,.55);animation:un-load-line .8s cubic-bezier(.4,0,.2,1) infinite;animation-delay:-.25s}' +
      '@keyframes un-load-line{0%{transform:translateX(-190%)}100%{transform:translateX(360%)}}' +
      '@keyframes un-load-line-sheen{0%{transform:translateX(-50px);opacity:0}20%{opacity:.6}80%{opacity:.6}100%{transform:translateX(180px);opacity:0}}' +
      '@keyframes un-load-line-pulse{0%,100%{box-shadow:0 0 8px rgba(217,27,27,.25)}50%{box-shadow:0 0 16px rgba(217,27,27,.6)}}' +
      '@media (prefers-reduced-motion: reduce){#un-mnav-load .line{animation:none;box-shadow:none}#un-mnav-load .line::before{display:none}#un-mnav-load .line i{width:100%;transform:none;animation:none;box-shadow:none;background:rgba(255,255,255,.25)}}' +
      'html.dark #un-mnav-load{background:#fff}' +
      'html.dark #un-mnav-panel{background:#0f172a;box-shadow:-8px 0 24px rgba(0,0,0,.35)}' +
      'html.dark #un-mnav-panel nav a{color:#cbd5e1}' +
      'html.dark #un-mnav-panel nav a.on{background:#2a1418;color:#ffb4ab}' +
      'html.dark #un-mnav-panel nav a:active{background:#1e293b}' +
      'html.dark #un-mnav-panel .ft{border-color:#334155}' +
      'html.dark #un-mnav-panel .ft button{background:#b0000b}' +
      'html.dark #un-mnav-load .line{background:#b0000b}' ;
    var st = document.createElement('style');
    st.id = 'un-mnav-css';
    st.textContent = css;
    document.head.appendChild(st);
    var fab = document.createElement('button');
    fab.id = 'un-mnav-fab';
    fab.setAttribute('aria-label', 'Abrir menú de navegación');
    fab.innerHTML = '<span></span><span></span><span></span>';
    var ovl = document.createElement('div');
    ovl.id = 'un-mnav-ovl';
    var panel = document.createElement('div');
    panel.id = 'un-mnav-panel';
    var who = logged
      ? '<b>' + esc(BRAND_NAME) + '</b><small>' + esc(BRAND_SUBTITLE + ' · ' + (u.nombre || '') + (rol ? ' · ' + rol : '')) + '</small>'
      : '<b>' + esc(BRAND_NAME) + '</b><small>' + esc(BRAND_SUBTITLE) + '</small>';
    var links = L.map(function (it) {
      var on = path === it[1].split('#')[0] ? ' on' : '';
      return '<a class="' + on.trim() + '" href="' + it[1] + '">' + esc(it[0]) + '</a>';
    }).join('');
    panel.innerHTML = '<div class="hd">' + who + '</div><nav>' + links + '</nav>' +
      '<div class="ft">' + (logged ? '<button type="button" class="un-secure-logout" data-act="logout" aria-label="Cerrar sesión de forma segura">' + secureLogoutMarkup() + '</button>' : '<button type="button" data-act="login">Iniciar sesión</button>') + '</div>';
    // Estos enlaces son manuales: que rewriteLinks nunca los toque ni renombre
    panel.querySelectorAll('nav a').forEach(function (x) { x._unRenamed = true; });
    document.body.appendChild(fab);
    syncMobileNavVisibility();
    document.body.appendChild(ovl);
    document.body.appendChild(panel);
    // Pantalla de carga: al navegar se muestra al instante para que no se
    // perciba parpadeo ni la interfaz anterior a medias.
    var load = document.createElement('div');
    load.id = 'un-mnav-load';
    load.innerHTML = '<img class="mark" src="/assets/logo.png" alt="" aria-hidden="true"><div class="line"><i></i></div>';
    document.body.appendChild(load);
    function go() {
      close();
      document.body.classList.add('un-menu-leaving');
      load.classList.add('open');
    }
    load.addEventListener('click', function () { load.classList.remove('open'); });
    function open() {
      ovl.classList.add('open'); panel.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      ovl.classList.remove('open'); panel.classList.remove('open');
      document.body.style.overflow = '';
    }
    fab.addEventListener('click', open);
    ovl.addEventListener('click', close);
    var act = panel.querySelector('[data-act]');
    if (act) act.addEventListener('click', function (e) {
      go();
      if (act.getAttribute('data-act') === 'logout') requestLogout(e);
      else location.href = '/login.html';
    });
    panel.querySelectorAll('nav a').forEach(function (x) { x.addEventListener('click', go); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // Respaldo global de imagenes: si una imagen remota del simulador muere
  // (enlaces temporales), se sustituye por un placeholder de marca en vez
  // del icono roto. Solo actua una vez por imagen.
  var UN_IMG_PH = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#16233f"/><stop offset="1" stop-color="#0b1c30"/></linearGradient></defs>' +
    '<rect width="800" height="450" fill="url(#g)"/>' +
    '<g fill="#b0000b"><rect x="352" y="180" width="10" height="44" rx="2"/><rect x="368" y="172" width="10" height="60" rx="2"/>' +
    '<rect x="384" y="172" width="10" height="60" rx="2"/><rect x="400" y="180" width="10" height="44" rx="2"/></g>' +
    '<text x="400" y="270" text-anchor="middle" font-family="Arial" font-size="26" font-weight="bold" fill="#ffffff">' + esc(BRAND_NAME) + '</text>' +
    '<text x="400" y="296" text-anchor="middle" font-family="Arial" font-size="13" letter-spacing="1" fill="#e7bdb7">' + esc(BRAND_SUBTITLE) + '</text></svg>');
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.src && t.src.indexOf('googleusercontent.com/aida/') >= 0 && !t._unFb) {
      t._unFb = true;
      t.src = UN_IMG_PH;
    }
  }, true);
  // Las que ya fallaron antes de atar el listener (carga del parser)
  try {
    document.querySelectorAll('img').forEach(function (im) {
      if (im.complete && im.naturalWidth === 0 && im.src && im.src.indexOf('googleusercontent.com/aida/') >= 0 && !im._unFb) {
        im._unFb = true;
        im.src = UN_IMG_PH;
      }
    });
  } catch (e) { /* nunca romper el arranque */ }

  function openPasswordModal() {
    var existing = document.getElementById('un-password-modal');
    var opener = document.activeElement;
    var dark = document.documentElement.classList.contains('dark');
    var overlay = existing || document.createElement('div');
    if (existing) {
      opener = document.activeElement;
      overlay.style.display = 'flex';
      var reopen = overlay._open;
      if (reopen) reopen();
      return;
    }
    overlay.id = 'un-password-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'un-password-title');
    overlay.setAttribute('aria-describedby', 'un-password-description');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;background:rgba(8,15,28,.62);backdrop-filter:blur(5px);opacity:1;transition:opacity .16s ease';
    var dialog = document.createElement('div');
    dialog.setAttribute('tabindex', '-1');
    dialog.style.cssText = 'width:min(100%,440px);max-height:calc(100vh - 32px);overflow:auto;padding:24px;border:1px solid ' + (dark ? '#334155' : '#e2e8f0') + ';border-radius:18px;background:' + (dark ? '#111827' : '#ffffff') + ';color:' + (dark ? '#f8fafc' : '#0f172a') + ';box-shadow:0 24px 70px rgba(2,6,23,.32);transition:transform .16s ease,opacity .16s ease';
    dialog.innerHTML = '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px"><div><div style="width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:#fef2f2;color:#b91c1c;font-size:16px;letter-spacing:2px;font-weight:800;margin-bottom:12px">•••</div><h2 id="un-password-title" style="margin:0;font-size:20px;line-height:1.2;font-weight:800;letter-spacing:-.02em">Actualizar contraseña</h2><p id="un-password-description" style="margin:7px 0 0;font-size:13px;line-height:1.5;color:' + (dark ? '#cbd5e1' : '#64748b') + '">Usa una contraseña nueva de al menos 8 caracteres.</p></div><button type="button" id="un-password-close" aria-label="Cerrar" style="width:32px;height:32px;border:0;border-radius:9px;background:' + (dark ? '#1e293b' : '#f1f5f9') + ';color:' + (dark ? '#cbd5e1' : '#64748b') + ';font-size:20px;line-height:1;cursor:pointer">×</button></div><form id="un-password-form" novalidate><label for="un-password-current" style="display:block;margin:0 0 7px;font-size:12px;font-weight:750;color:' + (dark ? '#e2e8f0' : '#334155') + '">Contraseña actual</label><div style="position:relative;margin-bottom:15px"><input id="un-password-current" type="password" autocomplete="current-password" style="box-sizing:border-box;width:100%;padding:12px 76px 12px 13px;border:1px solid ' + (dark ? '#334155' : '#cbd5e1') + ';border-radius:11px;background:' + (dark ? '#0b1220' : '#f8fafc') + ';color:' + (dark ? '#f8fafc' : '#0f172a') + ';font-size:14px;outline:none"><button type="button" data-password-toggle="un-password-current" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;border-radius:7px;padding:6px 8px;background:transparent;color:#64748b;font-size:11px;font-weight:700;cursor:pointer">Mostrar</button></div><label for="un-password-new" style="display:block;margin:0 0 7px;font-size:12px;font-weight:750;color:' + (dark ? '#e2e8f0' : '#334155') + '">Nueva contraseña</label><div style="position:relative;margin-bottom:15px"><input id="un-password-new" type="password" autocomplete="new-password" style="box-sizing:border-box;width:100%;padding:12px 76px 12px 13px;border:1px solid ' + (dark ? '#334155' : '#cbd5e1') + ';border-radius:11px;background:' + (dark ? '#0b1220' : '#f8fafc') + ';color:' + (dark ? '#f8fafc' : '#0f172a') + ';font-size:14px;outline:none"><button type="button" data-password-toggle="un-password-new" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;border-radius:7px;padding:6px 8px;background:transparent;color:#64748b;font-size:11px;font-weight:700;cursor:pointer">Mostrar</button></div><label for="un-password-confirm" style="display:block;margin:0 0 7px;font-size:12px;font-weight:750;color:' + (dark ? '#e2e8f0' : '#334155') + '">Confirmar nueva contraseña</label><div style="position:relative"><input id="un-password-confirm" type="password" autocomplete="new-password" style="box-sizing:border-box;width:100%;padding:12px 76px 12px 13px;border:1px solid ' + (dark ? '#334155' : '#cbd5e1') + ';border-radius:11px;background:' + (dark ? '#0b1220' : '#f8fafc') + ';color:' + (dark ? '#f8fafc' : '#0f172a') + ';font-size:14px;outline:none"><button type="button" data-password-toggle="un-password-confirm" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;border-radius:7px;padding:6px 8px;background:transparent;color:#64748b;font-size:11px;font-weight:700;cursor:pointer">Mostrar</button></div><p id="un-password-error" role="alert" aria-live="polite" style="display:none;margin:14px 0 0;padding:10px 12px;border-radius:9px;background:#fef2f2;color:#b91c1c;font-size:12px;line-height:1.4"></p><div style="display:flex;justify-content:flex-end;gap:9px;margin-top:22px"><button type="button" id="un-password-cancel" style="padding:10px 15px;border:1px solid ' + (dark ? '#475569' : '#cbd5e1') + ';border-radius:10px;background:transparent;color:' + (dark ? '#cbd5e1' : '#475569') + ';font-size:13px;font-weight:700;cursor:pointer">Cancelar</button><button type="submit" id="un-password-submit" style="padding:10px 16px;border:0;border-radius:10px;background:#b0000b;color:#fff;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 5px 14px rgba(176,0,11,.2)">Actualizar contraseña</button></div></form>';
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    var form = document.getElementById('un-password-form');
    var current = document.getElementById('un-password-current');
    var next = document.getElementById('un-password-new');
    var confirm = document.getElementById('un-password-confirm');
    var error = document.getElementById('un-password-error');
    var submit = document.getElementById('un-password-submit');
    var oldOverflow = '';
    function setError(message) {
      error.textContent = message || '';
      error.style.display = message ? 'block' : 'none';
    }
    function close() {
      overlay.style.display = 'none';
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = oldOverflow;
      form.reset();
      overlay.querySelectorAll('[data-password-toggle]').forEach(function (button) {
        var input = document.getElementById(button.getAttribute('data-password-toggle'));
        if (input) input.type = 'password';
        button.textContent = 'Mostrar';
      });
      setError('');
      if (opener && opener.focus) opener.focus();
    }
    function onKey(event) {
      if (event.key === 'Escape') close();
    }
    overlay._open = function () {
      oldOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey);
      setError('');
      window.setTimeout(function () { current.focus(); }, 30);
    };
    overlay._open();
    overlay.addEventListener('click', function (event) { if (event.target === overlay) close(); });
    document.getElementById('un-password-close').addEventListener('click', close);
    document.getElementById('un-password-cancel').addEventListener('click', close);
    overlay.querySelectorAll('[data-password-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var input = document.getElementById(button.getAttribute('data-password-toggle'));
        var visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        button.textContent = visible ? 'Mostrar' : 'Ocultar';
        button.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
      });
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var currentValue = current.value;
      var nextValue = next.value;
      var confirmValue = confirm.value;
      if (!currentValue || !nextValue || !confirmValue) { setError('Completa los tres campos para continuar.'); return; }
      if (nextValue.length < 8) { setError('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
      if (nextValue !== confirmValue) { setError('Las contraseñas nuevas no coinciden.'); return; }
      submit.disabled = true;
      submit.textContent = 'Guardando…';
      setError('');
      try {
        await api('/api/me', { method: 'PUT', body: { currentPassword: currentValue, newPassword: nextValue } });
        close();
        if (typeof window.showToast === 'function') window.showToast('Contraseña actualizada correctamente.', 'Seguridad');
        else if (window.SA && typeof window.SA.toast === 'function') window.SA.toast('Contraseña actualizada correctamente.', 'Seguridad');
      } catch (errorValue) {
        setError(repairText(errorValue && errorValue.message ? errorValue.message : 'No se pudo actualizar la contraseña.'));
        submit.disabled = false;
        submit.textContent = 'Actualizar contraseña';
      }
    });
  }

  window.addEventListener('storage', function (event) {
    if (!event) return;
    if (event.key === 'unidos_user' || event.key === profilePhotoKey()) paintProfileAvatars();
    if (event.key === 'unidos_token' && !event.newValue) {
      clearLocalSession();
      if (location.pathname !== '/index.html') location.replace('/index.html');
    }
  });
  window.UN = { API: API, api: api, getUser: getUser, setSession: setSession, logout: logout, requestLogout: requestLogout, getProfilePhoto: getProfilePhoto, setProfilePhoto: setProfilePhoto, clearProfilePhoto: clearProfilePhoto, prepareProfilePhoto: prepareProfilePhoto, saveProfilePhoto: saveProfilePhoto, deleteProfilePhoto: deleteProfilePhoto, syncProfilePhoto: syncProfilePhoto, paintProfileAvatars: paintProfileAvatars, requireAuth: requireAuth, requireStaff: requireStaff, requireEspeciales: requireEspeciales, requireElec: requireElec, requireSuperAdmin: requireSuperAdmin, money: money, esc: esc, norm: normalizeText, search: searchableText, matches: matchesText, compact: compactText, repair: repairText, downloadQuote: downloadQuote, printQuote: printQuote, quoteDocHTML: quoteDoc, viewQuote: viewQuote, closeQuoteViewer: closeQuoteViewer, downloadMant: downloadMant, confirmarEnvio: confirmarEnvio, pdfParaVer: pdfParaVer, syncCatalog: syncCatalog, watchCatalog: watchCatalog, notifyCatalog: notifyCatalog, checkCatalog: checkCatalog, rewriteLinks: rewriteLinks, profileMenu: profileMenu, openPasswordModal: openPasswordModal, ensureMenu: ensureMenu, zonaDeRol: zonaDeRol, ensureMenuRol: ensureMenuRol, setThemeMode: setThemeMode, applyBrand: applyBrand, brand: { name: BRAND_NAME, subtitle: BRAND_SUBTITLE }, theme: { get: themeGet, set: themeSet } };
  // NOTA: cada diseno conserva su comportamiento original; el conector solo
  // reescribe enlaces, refleja sesion y sincroniza tema/accesibilidad global.
  wrapTextApis();
  applyBrand();
  watchBrand();
  rewriteLinks();
  injectMobileNav();
  injectZoneHeadCSS();
injectScrollbarCSS();
  injectCatalogoDark();
  injectRazerCSS();
  injectA11yAssets();
  migrateAccountPreferences();
  applyA11yLogged();
  watchTheme();
  (function revealZone() {
    var reveal = function () { if (window.UN_ZONE_BOOT && UN_ZONE_BOOT.remove) UN_ZONE_BOOT.remove(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reveal, { once: true });
    else reveal();
    setTimeout(reveal, 600);
  })();
  // Valida la sesion guardada: si el token ya no sirve (ej. datos reiniciados),
  // se limpia en silencio para no confundir. Solo ante 401/403, nunca por red caida.
  (function validateSession() {
    var token = localStorage.getItem('unidos_token');
    if (!token) return;
    api('/api/me').then(function (me) {
      if (localStorage.getItem('unidos_token') === token) {
        setSession(token, me);
        // La foto pudo cambiar en otra computadora: se baja y se pinta.
        try { syncProfilePhoto(me); } catch (e) {}
      }
    }).catch(function (e) {
      if (e && (e.status === 401 || e.status === 403) && localStorage.getItem('unidos_token') === token) {
        localStorage.removeItem('unidos_token');
        localStorage.removeItem('unidos_user');
      }
    });
  })();
})();
