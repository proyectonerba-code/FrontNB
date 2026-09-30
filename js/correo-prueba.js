/* Grupo NERBA HIDALGO - Prueba del correo de recuperacion (admin/superadmin).
   /api/recuperar siempre responde 200 para no revelar que correos estan
   registrados, asi que si el SMTP o el Resend estan mal configurados el fallo
   no se ve desde el sitio. Este panel manda un correo de prueba y enseña el
   error real del proveedor, sin tener que abrir los logs de Railway.
   Solo aparece para ADMIN y SUPERADMIN, y solo en las paginas de perfil. */
(function () {
  if (!window.UN) return;
  var u = UN.getUser() || {};
  var rol = String(u.rol || '').toUpperCase();
  if (rol !== 'ADMIN' && rol !== 'SUPERADMIN') return;
  if (!localStorage.getItem('unidos_token')) return;
  if (!document.getElementById('seccion-seguridad')) return;

  function ensureCss() {
    if (document.getElementById('un-correo-css')) return;
    var st = document.createElement('style');
    st.id = 'un-correo-css';
    st.textContent =
      '.un-cw{background:#f8f9ff;border:1px solid #e5eeff;border-radius:12px;padding:16px;margin-top:16px}' +
      '.un-cw h3{font-size:15px;font-weight:700;margin:0 0 4px}' +
      '.un-cw p{font-size:13px;color:#575e70;margin:0 0 12px;line-height:1.6}' +
      '.un-cw-row{display:flex;gap:8px;flex-wrap:wrap}' +
      '.un-cw input{flex:1;min-width:200px;height:42px;padding:0 12px;border:1px solid #d3e4fe;border-radius:8px;background:#fff;font-size:14px;box-sizing:border-box}' +
      '.un-cw input:focus{outline:none;border-color:#b0000b}' +
      '.un-cw button{height:42px;padding:0 18px;border-radius:8px;border:0;background:#b0000b;color:#fff;font-size:13px;font-weight:700;cursor:pointer}' +
      '.un-cw button:disabled{opacity:.6;cursor:not-allowed}' +
      '.un-cw .un-cw-out{margin-top:12px;padding:10px 12px;border-radius:8px;font-size:13px;line-height:1.6;display:none;white-space:pre-wrap;word-break:break-word}' +
      '.un-cw .ok{background:#dcfce7;color:#14532d;display:block}' +
      '.un-cw .err{background:#ffdad6;color:#93000a;display:block}' +
      '.un-cw .warn{background:#fef3c7;color:#78350f;display:block}';
    document.head.appendChild(st);
  }

  ensureCss();
  var sec = document.getElementById('seccion-seguridad');
  var d = document.createElement('div');
  d.className = 'un-cw';
  d.innerHTML =
    '<h3>Prueba del correo de recuperacion</h3>' +
    '<p>Envia un correo de prueba para confirmar que los enlaces de recuperacion si salen. ' +
    'Si el proveedor esta mal configurado, aqui aparece el error exacto.</p>' +
    '<div class="un-cw-row">' +
    '<input id="un-cw-mail" type="email" placeholder="tu-correo@gmail.com" value="' + UN.esc(u.email || '') + '">' +
    '<button id="un-cw-go" type="button">Probar envio</button>' +
    '</div>' +
    '<div class="un-cw-out" id="un-cw-out"></div>';
  sec.appendChild(d);

  var out = d.querySelector('#un-cw-out');
  var btn = d.querySelector('#un-cw-go');
  var mail = d.querySelector('#un-cw-mail');

  btn.addEventListener('click', function () {
    var v = String(mail.value || '').trim();
    if (!v || v.indexOf('@') < 1) {
      out.className = 'un-cw-out err';
      out.textContent = 'Escribe un correo valido.';
      return;
    }
    btn.disabled = true;
    out.className = 'un-cw-out';
    out.textContent = 'Enviando...';
    UN.api('/api/admin/probar-correo', { method: 'POST', body: { email: v } }).then(function (r) {
      out.className = 'un-cw-out ok';
      out.textContent = 'Correo enviado a ' + (r.destino || v) + '.\nRevisa la bandeja de entrada y la carpeta de spam.';
    }).catch(function (e) {
      var msg = (e && e.message) || 'No se pudo enviar.';
      var extra = '';
      // api() adjunta el cuerpo del error en el status; el motivo viene en
      // el mensaje cuando el backend responde con 502.
      out.className = 'un-cw-out err';
      out.textContent = 'No se pudo enviar.\n' + msg;
      if (/proveedor|SMTP_USER|RESEND_API_KEY/i.test(msg)) out.className = 'un-cw-out warn';
    }).finally(function () {
      btn.disabled = false;
    });
  });
})();
