/* Impresor de la cotización para el personal (admin, superadmin y electrónica).
 *
 * Antes este botón armaba un archivo de texto plano con extensión .pdf: eso no
 * es un PDF y no lo abría ningún lector. Ahora se pide la cotización real al
 * servidor, se arma el documento con los datos guardados —incluidas las fotos
 * que adjuntó el cliente— y se manda a imprimir, que el navegador convierte en
 * PDF de verdad.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fotosDe(q) {
    var fotos = Array.isArray(q.fotos) ? q.fotos : [];
    if (!fotos.length) return '';
    var tira = fotos.slice(0, 3).map(function (src) {
      // Tamaño fijo: ni la dejan gigante ni arman una hoja aparte.
      return '<img src="' + esc(src) + '" alt="Fotografía del inmueble" ' +
        'style="width:100%;height:112px;object-fit:cover;border:1px solid #e2e8f0;border-radius:6px">';
    }).join('');
    return '<h2>Fotografías del inmueble</h2>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + tira + '</div>';
  }

  function fila(etiqueta, valor) {
    if (!valor) return '';
    return '<tr><td style="padding:4px 10px 4px 0;color:#64748b;font-size:11px;white-space:nowrap">' +
      esc(etiqueta) + '</td><td style="padding:4px 0;font-size:12px;font-weight:600">' + esc(valor) + '</td></tr>';
  }

  function documento(q) {
    var cliente = [
      fila('Titular', q.nombre),
      fila('Correo', q.email),
      fila('Teléfono', q.telefono),
      fila('Teléfono 2', q.telefonoSec)
    ].join('');

    var instalacion = [
      fila('Tipo', q.tipoInmueble),
      fila('Alcance', q.espTipoInfraestructura),
      fila('Dirección', q.direccion),
      fila('Distrito', q.distrito),
      fila('Referencia', q.referencia),
      fila('Fecha', q.fecha),
      fila('Validez', q.validez)
    ].join('');

    var texto = q.descripcion || q.medidasDescriptivas || '';

    return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
      '<title>' + esc(q.folio) + ' - Grupo NERBA HIDALGO</title><style>' +
      'body{font-family:Arial,Helvetica,sans-serif;color:#0b1c30;max-width:760px;margin:28px auto;padding:0 16px}' +
      'h1{color:#b0000b;font-size:19px;margin:0 0 2px}' +
      'h2{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#475569;' +
      'border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin:18px 0 8px}' +
      '.sub{color:#64748b;font-size:11px;margin:0 0 12px}' +
      'table{width:100%;border-collapse:collapse}' +
      '.caja{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px}' +
      '.pie{margin-top:22px;border-top:1px solid #e2e8f0;padding-top:8px;color:#94a3b8;font-size:10px}' +
      '@page{size:A4;margin:14mm}' +
      '</style></head><body>' +
      '<h1>Grupo NERBA HIDALGO</h1>' +
      '<p class="sub">Solicitud de cotización · <strong>' + esc(q.folio) + '</strong> · Estado: ' +
      esc(q.estado || 'PENDIENTE') + '</p>' +
      '<h2>Datos del solicitante</h2><div class="caja"><table>' + cliente + '</table></div>' +
      '<h2>Datos de la instalación</h2><div class="caja"><table>' + instalacion + '</table></div>' +
      (texto ? '<h2>Requerimiento declarado</h2><div class="caja" style="white-space:pre-line">' + esc(texto) + '</div>' : '') +
      fotosDe(q) +
      '<div class="pie">Documento generado por Grupo NERBA HIDALGO. No válido para efectos fiscales.</div>' +
      '</body></html>';
  }

  function imprimir(html) {
    var v = window.open('', '_blank');
    if (!v) {
      alert('El navegador bloqueó la ventana del documento. Permite las ventanas emergentes e intenta de nuevo.');
      return false;
    }
    v.document.open();
    v.document.write(html);
    v.document.close();
    v.focus();
    // Un respiro para que las fotos de base64 terminen de pintarse.
    setTimeout(function () { try { v.print(); } catch (e) {} }, 700);
    return true;
  }

  window.descargarPDF = function (folio) {
    if (!folio) { alert('No se indicó el folio de la cotización.'); return; }
    if (window.UN && UN.toast) UN.toast('Preparando el documento...', 'info');
    else if (window.mostrarToast) mostrarToast('Preparando el documento...', 'blue');

    // PDF real del servidor (misma plantilla para todas las areas).
    // Si falla, se usa la vista de impresion unificada de UN.
    function bajaDirecta() {
      var base = (window.UN && UN.API) || '';
      var token = '';
      try { token = localStorage.getItem('unidos_token') || ''; } catch (e) {}
      return fetch(base + '/api/cotizaciones/' + encodeURIComponent(folio) + '/pdf', {
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
        return true;
      });
    }
    function vistaUnificada() {
      var fin = function (q) {
        if (window.UN && UN.printQuote) UN.printQuote(q || { folio: folio });
        else imprimir(documento(q || {}));
      };
      var fallo = function () { alert('No se pudo cargar la cotización ' + folio + '.'); };
      if (window.UN && UN.api) {
        UN.api('/api/cotizaciones/' + encodeURIComponent(folio)).then(fin).catch(fallo);
      } else {
        fetch('api/cotizaciones/' + encodeURIComponent(folio)).then(function (r) {
          if (!r.ok) throw new Error('http ' + r.status);
          return r.json();
        }).then(fin).catch(fallo);
      }
    }

    bajaDirecta().catch(vistaUnificada);
  };
})();