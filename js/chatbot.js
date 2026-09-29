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
  function isClient() {
    var u = getUser();
    return !!(localStorage.getItem('unidos_token') && u && u.rol === 'CLIENTE');
  }
  if (!isClient()) return;

  var ICON_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 9H7V9h4v2zm6 0h-4V9h4v2z"/></svg>';
  var ICON_MIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13H5v-2h14v2z"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>';
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

  async function sendMessage(message) {
    var text = String(message || '').trim();
    if (!text) return;
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
      addMsg('bot', result.reply || 'No pude generar una respuesta en este momento.', {
        messageId: result.message_id,
        whatsapp: result.whatsapp
      });
      renderSuggestions(result.suggestions);
    } catch (e) {
      typing(false);
      addMsg('bot', e && e.status === 401
        ? 'Tu sesión ya no está activa. Inicia sesión nuevamente para continuar.'
        : e && e.status === 403
          ? 'NerBot está disponible para cuentas CLIENTE.'
          : 'No pude conectarme con NerBot en este momento. Inténtalo de nuevo en unos segundos.');
    }
  }

  function renderSuggestions(items) {
    quick.innerHTML = '';
    (Array.isArray(items) ? items : []).slice(0, 4).forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', function () { sendMessage(label); });
      quick.appendChild(b);
    });
  }

  async function loadHistory() {
    try {
      var result = await UN.api('/api/chatbot/history?session_id=' + encodeURIComponent(sessionId));
      var items = Array.isArray(result.items) ? result.items : [];
      body.innerHTML = '';
      if (!items.length) {
        addMsg('bot', '¡Hola <strong>' + esc(userName) + '</strong>! Soy NerBot, el asistente IA de <strong>Grupo NERBA HIDALGO</strong>. Puedo ayudarte a entender soluciones, encontrar productos del catálogo y canalizarte con el área correspondiente.');
        return;
      }
      items.forEach(function (m) {
        addMsg(m.role === 'user' ? 'user' : 'bot', m.content, m.role === 'model' ? { messageId: m.id } : null);
      });
    } catch (e) {
      if (!body.children.length) addMsg('bot', '¡Hola <strong>' + esc(userName) + '</strong>! Soy NerBot. ¿Qué necesitas consultar?');
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

  var QUICK = ['¿Qué productos manejan?', 'Necesito CCTV', 'Necesito mantenimiento', 'Quiero hablar con un asesor'];
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
  panel.querySelector('#nb-min').addEventListener('click', closeAll);
  panel.querySelector('#nb-close').addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.classList.contains('nb-hidden')) closeAll();
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
