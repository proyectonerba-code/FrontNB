/* NerBot — interfaz del asistente IA de Grupo NERBA HIDALGO.
   La UI se conserva; el procesamiento vive en BackendNB/Gemini.
   Solo se muestra a cuentas CLIENTE autenticadas. */
(function () {
  if (window.__nbLoaded) return;
  window.__nbLoaded = true;

  function getUser() {
    try {
      if (window.UN && UN.getUser) return UN.getUser();
      return JSON.parse(localStorage.getItem('unidos_user') || 'null');
    } catch (e) { return null; }
  }
  // NerBot es para CLIENTE. Cuando el servidor corre con NERBOT_STAFF=1 el
  // equipo interno tambien puede probarlo; el widget se muestra igual porque
  // el backend es quien decide (aqui solo se filtra lo que no es cliente ni staff).
  function isClient() {
    var u = getUser();
    if (!localStorage.getItem('unidos_token') || !u) return false;
    if (u.rol === 'CLIENTE') return true;
    return ['ADMIN', 'SUPERADMIN', 'PROYECTOS_ESPECIALES', 'PRODUCTOS_ELECTRONICOS'].indexOf(u.rol) > -1;
  }
  if (!isClient()) return;

  var ICON_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 9H7V9h4v2zm6 0h-4V9h4v2z"/></svg>';
  var ICON_MIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13H5v-2h14v2z"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>';
  var ICON_NEW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.65 6.35A8 8 0 1 0 19.73 14h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
  var NB_LOGO = '/assets/chatbot.png?v=4';
  var NB_LOGO_OLD = '/assets/logo.png';

  window.__nbLogoErr = function (img) {
    if (!img.dataset.fbk) { img.dataset.fbk = '1'; img.src = NB_LOGO_OLD; }
    else if (img.parentNode) img.parentNode.removeChild(img);
  };
  function nbLogoImg() {
    return '<span class="nb-ava-fb">N</span><img src="' + NB_LOGO + '" alt="NerBot" onerror="__nbLogoErr(this)">';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function linkify(text) {
    var safe = esc(text);
    return safe
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/(https:\/\/wa\.me\/\d+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">WhatsApp</a>');
  }
  function hour() {
    return new Date().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
  }

  (function () {
    if (document.querySelector('link[data-nb-css]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.setAttribute('data-nb-css', '1');
    l.href = '/css/chatbot.css?v=2.3';
    document.head.appendChild(l);
  })();

  var user = getUser() || {};
  var userName = user.nombre || 'Ingeniero';
  var sessionKey = 'nerba_chat_session::' + (user.email || 'anon');
  var openKey = 'nerba_chat_open::' + (user.email || 'anon');
  var sessionId = '';
  try {
    sessionId = localStorage.getItem(sessionKey) || '';
    if (!sessionId) {
      sessionId = 'nb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(sessionKey, sessionId);
    }
  } catch (e) {
    sessionId = 'nb_' + Date.now().toString(36);
  }

  var fab = document.createElement('button');
  fab.id = 'nb-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Abrir chat NerBot');
  fab.setAttribute('aria-expanded', 'false');
  fab.title = 'NerBot · Asistente Virtual';
  fab.innerHTML = '<span class="nb-fab-svg">' + ICON_CHAT + '</span><img class="nb-fab-img" src="' + NB_LOGO + '" alt="NerBot" onerror="__nbLogoErr(this)"><span id="nb-fab-dot"></span>';

  var teaser = document.createElement('div');
  teaser.id = 'nb-teaser';
  teaser.setAttribute('role', 'status');
  teaser.setAttribute('aria-live', 'polite');
  teaser.setAttribute('aria-hidden', 'true');
  teaser.textContent = 'COMUNÍCATE CON NOSOTROS';

  var panel = document.createElement('div');
  panel.id = 'nb-panel';
  panel.className = 'nb-hidden';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat NerBot');
  panel.innerHTML =
    '<div id="nb-bar"></div>' +
    '<div id="nb-head"><div id="nb-head-info">' +
      '<div id="nb-avatar">' + nbLogoImg() + '</div>' +
      '<div><div id="nb-title">NerBot <span id="nb-badge">Asistente IA</span></div>' +
      '<div id="nb-status"><i></i>En línea 24/7</div></div>' +
    '</div><div id="nb-head-btns">' +
      '<button id="nb-new" type="button" title="Nueva conversación" aria-label="Nueva conversación">' + ICON_NEW + '</button>' +
      '<button id="nb-min" type="button" title="Minimizar" aria-label="Minimizar">' + ICON_MIN + '</button>' +
      '<button id="nb-close" type="button" title="Cerrar" aria-label="Cerrar">' + ICON_X + '</button>' +
    '</div></div>' +
    '<div id="nb-body" aria-live="polite"></div>' +
    '<div id="nb-quick"></div>' +
    '<div id="nb-form-wrap"><form id="nb-form">' +
      '<input id="nb-input" type="text" placeholder="Escribe tu consulta técnica…" autocomplete="off" maxlength="1200">' +
      '<button id="nb-send" type="submit" title="Enviar" aria-label="Enviar">' + ICON_SEND + '</button>' +
    '</form><div id="nb-foot"><i></i>Soporte especializado Nerba · IA en tiempo real</div></div>';

  document.body.appendChild(fab);
  document.body.appendChild(teaser);
  document.body.appendChild(panel);

  var body = panel.querySelector('#nb-body');
  var quick = panel.querySelector('#nb-quick');
  var form = panel.querySelector('#nb-form');
  var input = panel.querySelector('#nb-input');

  function addMsg(who, text, meta) {
    var row = document.createElement('div');
    row.className = 'nb-row' + (who === 'user' ? ' nb-user' : '');
    var av = who === 'bot' ? '<div class="nb-ava">' + nbLogoImg() + '</div>' : '';
    var extra = '';
    if (who === 'bot' && meta && meta.messageId) {
      extra = '<div class="nb-feedback" data-message-id="' + esc(meta.messageId) + '">' +
        '<button type="button" data-rate="up" title="Respuesta útil" aria-label="Respuesta útil">👍</button>' +
        '<button type="button" data-rate="down" title="Respuesta no útil" aria-label="Respuesta no útil">👎</button></div>';
    }
    row.innerHTML = av + '<div style="min-width:0"><div class="nb-bubble">' + (who === 'bot' ? linkify(text) : esc(text)) + '</div>' +
      (meta && meta.whatsapp ? '<div class="nb-nb-wa"><a href="' + esc(meta.whatsapp.url) + '" target="_blank" rel="noopener noreferrer">💬 ' + esc(meta.whatsapp.label || 'Hablar por WhatsApp') + '</a></div>' : '') +
      '<div class="nb-time">' + hour() + '</div>' + extra + '</div>';
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
    return row;
  }

  function typing(show) {
    var old = body.querySelector('.nb-typing-row');
    if (old) old.remove();
    if (!show) return;
    var row = document.createElement('div');
    row.className = 'nb-row nb-typing-row';
    row.innerHTML = '<div class="nb-ava">' + nbLogoImg() + '</div><div class="nb-bubble"><span class="nb-typing"><span></span><span></span><span></span></span></div>';
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  // Candado de doble envío: sin esto, doble-clic o Enter repetido mandaba el
  // mismo mensaje varias veces (cada uno gastaba IA o devolvía un 429 ruidoso).
  var enviando = false;
  async function sendMessage(message) {
    var text = String(message || '').trim();
    if (!text || enviando) return;
    enviando = true;
    addMsg('user', text);
    typing(true);
    try {
      var result = await UN.api('/api/chatbot/message', {
        method: 'POST',
        body: { session_id: sessionId, message: text }
      });
      if (result.session_id) {
        sessionId = result.session_id;
        try { localStorage.setItem(sessionKey, sessionId); } catch (e) {}
      }
      typing(false);
      enviando = false;
      addMsg('bot', result.reply || 'No pude generar una respuesta en este momento.', {
        messageId: result.message_id,
        whatsapp: result.whatsapp
      });
      renderSuggestions(result.suggestions);
    } catch (e) {
      typing(false);
      enviando = false;
      addMsg('bot', e && e.status === 401
        ? 'Tu sesión ya no está activa. Inicia sesión nuevamente para continuar.'
        : e && e.status === 403
          ? 'NerBot está disponible para cuentas CLIENTE.'
          : e && e.status === 429
            ? (e.message || 'Vas muy rápido. Espera unos segundos e inténtalo de nuevo.')
            : 'No pude conectarme con NerBot en este momento. Inténtalo de nuevo en unos segundos.');
    }
  }

  function renderSuggestions(items) {
    // Sin sugerencias de la IA se restauran los atajos por defecto: antes el
    // reseteo los borraba para siempre hasta recargar la página.
    var lista = (Array.isArray(items) && items.length ? items : QUICK).slice(0, 4);
    quick.innerHTML = '';
    lista.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', function () { sendMessage(label); });
      quick.appendChild(b);
    });
  }

  // OJO: aqui se usa **negrita** (markdown), no <strong>. linkify()
  // escapa el HTML crudo, asi que las etiquetas se verian como texto.
  function saludo() {
    return '¡Hola **' + userName + '**! Soy NerBot, el asistente IA de **Grupo NERBA HIDALGO**. Puedo ayudarte a entender soluciones, encontrar productos del catálogo y canalizarte con el área correspondiente.';
  }

  async function loadHistory() {
    try {
      var result = await UN.api('/api/chatbot/history?session_id=' + encodeURIComponent(sessionId));
      var items = Array.isArray(result.items) ? result.items : [];
      body.innerHTML = '';
      if (!items.length) {
        addMsg('bot', saludo());
        return;
      }
      items.forEach(function (m) {
        addMsg(m.role === 'user' ? 'user' : 'bot', m.content, m.role === 'model' ? { messageId: m.id } : null);
      });
    } catch (e) {
      if (!body.children.length) addMsg('bot', '¡Hola **' + userName + '**! Soy NerBot. ¿Qué necesitas consultar?');
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = (input.value || '').trim();
    if (!value) return;
    input.value = '';
    sendMessage(value);
    input.focus();
  });

  body.addEventListener('click', function (e) {
    var button = e.target.closest('[data-rate]');
    if (!button) return;
    var wrap = button.closest('.nb-feedback');
    if (!wrap) return;
    var messageId = wrap.getAttribute('data-message-id');
    var rating = button.getAttribute('data-rate');
    if (!messageId) return;
    UN.api('/api/chatbot/feedback', {
      method: 'POST',
      body: { session_id: sessionId, message_id: messageId, rating: rating }
    }).then(function () {
      wrap.innerHTML = '<span>Gracias por tu feedback.</span>';
    }).catch(function () {});
  });

  var QUICK = ['¿Qué productos manejan?', 'Necesito videovigilancia', 'Necesito mantenimiento', 'Quiero hablar con un asesor'];
  QUICK.forEach(function (q) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = q;
    b.addEventListener('click', function () { sendMessage(q); });
    quick.appendChild(b);
  });

  function persist(open) {
    try { localStorage.setItem(openKey, open ? '1' : '0'); } catch (e) {}
  }
  var nbT = null;
  function openFull() {
    if (nbT) clearTimeout(nbT);
    teaser.classList.remove('nb-teaser-show');
    fab.setAttribute('aria-expanded', 'true');
    panel.classList.remove('nb-hidden', 'nb-min', 'nb-closing');
    fab.style.display = 'none';
    persist(true);
    if (!body.dataset.loaded) {
      body.dataset.loaded = '1';
      loadHistory();
    }
    setTimeout(function () { input.focus(); }, 120);
  }
  function closeAll() {
    if (nbT) clearTimeout(nbT);
    fab.setAttribute('aria-expanded', 'false');
    panel.classList.add('nb-closing');
    nbT = setTimeout(function () {
      panel.classList.add('nb-hidden');
      panel.classList.remove('nb-min', 'nb-closing');
      fab.style.display = 'flex';
      nbT = null;
    }, 170);
    persist(false);
  }
  // Confirmación con el estilo del chat (en vez del confirm() nativo del
  // navegador, que se ve ajeno al diseño).
  var confirmCb = null;
  function ensureConfirmModal() {
    if (document.getElementById('nb-confirm')) return;
    if (!document.getElementById('nb-confirm-css')) {
      var st = document.createElement('style');
      st.id = 'nb-confirm-css';
      st.textContent =
        '#nb-confirm{position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;background:rgba(11,28,48,.55);padding:16px}' +
        '#nb-confirm.on{display:flex}' +
        '#nb-confirm-card{background:#fff;border-radius:16px;max-width:340px;width:100%;padding:24px 20px 20px;text-align:center;position:relative;' +
        'box-shadow:0 24px 60px -12px rgba(2,6,23,.45);font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;' +
        'animation:nb-in .22s cubic-bezier(.16,1,.3,1)}' +
        '#nb-confirm-x{position:absolute;top:10px;right:10px;width:30px;height:30px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#64748b;cursor:pointer;font-size:14px;line-height:1;padding:0}' +
        '#nb-confirm-x:hover{border-color:#d91b1b;color:#d91b1b}' +
        '.nb-confirm-ico{width:52px;height:52px;border-radius:50%;background:#fef2f2;color:#d91b1b;display:flex;align-items:center;justify-content:center;margin:0 auto 12px}' +
        '.nb-confirm-ico svg{width:24px;height:24px;fill:currentColor}' +
        '#nb-confirm-card h3{font-size:16px;font-weight:800;color:#0b1c30;margin:0 0 8px}' +
        '#nb-confirm-card p{font-size:13px;color:#475569;line-height:1.6;margin:0 0 18px}' +
        '.nb-confirm-row{display:flex;gap:8px}' +
        '.nb-confirm-btn{flex:1;padding:11px 8px;border-radius:10px;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}' +
        '.nb-confirm-go{background:#d91b1b;color:#fff;border:0}' +
        '.nb-confirm-go:hover{background:#b0000b}' +
        '.nb-confirm-no{background:#fff;color:#334155;border:1px solid #e2e8f0}' +
        '.nb-confirm-no:hover{border-color:#d91b1b;color:#d91b1b}';
      document.head.appendChild(st);
    }
    var w = document.createElement('div');
    w.innerHTML =
      '<div id="nb-confirm" role="dialog" aria-label="Confirmar nueva conversación">' +
      '<div id="nb-confirm-card">' +
      '<button type="button" id="nb-confirm-x" aria-label="Cerrar">✕</button>' +
      '<div class="nb-confirm-ico">' + ICON_NEW + '</div>' +
      '<h3>¿Empezar de nuevo?</h3>' +
      '<p>Se borrará el historial de este chat y empezarás una conversación fresca.</p>' +
      '<div class="nb-confirm-row">' +
      '<button type="button" class="nb-confirm-btn nb-confirm-no" id="nb-confirm-no">Cancelar</button>' +
      '<button type="button" class="nb-confirm-btn nb-confirm-go" id="nb-confirm-go">Empezar de nuevo</button>' +
      '</div></div></div>';
    while (w.firstChild) document.body.appendChild(w.firstChild);
    var modal = document.getElementById('nb-confirm');
    document.getElementById('nb-confirm-x').addEventListener('click', closeConfirmModal);
    document.getElementById('nb-confirm-no').addEventListener('click', closeConfirmModal);
    // Candado: doble-clic en "Empezar" mandaba dos resets (quemaba 2 de los 10
    // reinicios diarios y el segundo borraba la sesión fresca).
    var reseteando = false;
    document.getElementById('nb-confirm-go').addEventListener('click', function () {
      if (reseteando) return;
      var cb = confirmCb;
      closeConfirmModal();
      if (!cb) return;
      reseteando = true;
      try {
        var r = cb();
        if (r && r.then) r.then(function () { reseteando = false; }, function () { reseteando = false; });
        else reseteando = false;
      } catch (e) { reseteando = false; }
    });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeConfirmModal(); });
  }
  function openConfirmModal(cb) {
    ensureConfirmModal();
    confirmCb = cb || null;
    document.getElementById('nb-confirm').classList.add('on');
  }
  function closeConfirmModal() {
    var m = document.getElementById('nb-confirm');
    if (m) m.classList.remove('on');
    confirmCb = null;
  }
  // Borra la conversación actual en el servidor y empieza de cero. El
  // servidor topa los reinicios por día para que no lo usen en bucle.
  async function nuevaConversacion() {
    openConfirmModal(ejecutarReseteo);
  }
  async function ejecutarReseteo() {
    typing(true);
    try {
      var r = await UN.api('/api/chatbot/reset', {
        method: 'POST',
        body: { session_id: sessionId }
      });
      if (r.session_id) {
        sessionId = r.session_id;
        try { localStorage.setItem(sessionKey, sessionId); } catch (e) {}
      }
      body.innerHTML = '';
      body.dataset.loaded = '1';
      addMsg('bot', saludo());
      renderSuggestions([]);
    } catch (e) {
      addMsg('bot', (e && (e.status === 429 || e.status === 403))
        ? (e.message || 'Por ahora sigue en esta conversación.')
        : 'No se pudo reiniciar el chat. Inténtalo de nuevo.');
    }
    typing(false);
  }
  panel.querySelector('#nb-new').addEventListener('click', nuevaConversacion);
  panel.querySelector('#nb-min').addEventListener('click', closeAll);
  panel.querySelector('#nb-close').addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var cm = document.getElementById('nb-confirm');
    if (cm && cm.classList.contains('on')) { closeConfirmModal(); return; }
    if (!panel.classList.contains('nb-hidden')) closeAll();
  });
  fab.addEventListener('click', openFull);

  var wasOpen = false;
  try { wasOpen = localStorage.getItem(openKey) === '1'; } catch (e) {}
  if (wasOpen) openFull();
  else { panel.classList.add('nb-hidden'); fab.style.display = 'flex'; }

  window.NerBot = { open: openFull, close: closeAll, toggle: function () {
    if (panel.classList.contains('nb-hidden')) openFull(); else closeAll();
  }};
})();
