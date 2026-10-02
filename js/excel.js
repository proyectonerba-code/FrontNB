/* Descarga de Excel (.xlsx) con formato, sin librerias externas.
 *
 * Los reportes se bajaban como CSV: Excel lo abria sin colores, con las
 * columnas cortadas, las fechas como texto y los importes sin $ ni separador
 * de miles. Aqui se arma un .xlsx de verdad (un ZIP con XML adentro) para que
 * salga con barra de titulo, encabezado, anchos de columna, autofiltro, panel
 * congelado, estado con color, fecha en dd/mm/aaaa y total con $.
 *
 *   EXCEL.descargar({
 *     nombre: 'cotizaciones',
 *     hoja: 'Cotizaciones',
 *     titulo: 'Cotizaciones',
 *     subtitulo: '15 registros · generado 02/10/2026',
 *     columnas: [{ titulo: 'Folio', ancho: 20 }, { titulo: 'Total', tipo: 'moneda' }],
 *     filas: [['COT-INS-0001-2026', '2026-10-02', 17658]],
 *     totales: true
 *   });
 */
(function (global) {
  'use strict';

  var VERDE = 'FF166534', VERDE_FONDO = 'FFDCFCE7';
  var AMBAR = 'FF92400E', AMBAR_FONDO = 'FFFEF3C7';
  var ROJO = 'FF991B1B', ROJO_FONDO = 'FFFEE2E2';
  var TINTA = 'FF0F172A', BANDA = 'FFF8FAFC', BORDE = 'FFE2E8F0';
  var FORMATO_FECHA = 164, FORMATO_MONEDA = 165;

  // ---------------------------------------------------------------- XML ---
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function letra(n) {
    var s = '';
    n += 1;
    while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }

  function nombreHoja(s) {
    var t = String(s || 'Hoja 1').replace(/[\[\]\*\?\/\\:]/g, ' ').trim();
    return (t || 'Hoja 1').slice(0, 31);
  }

  function aNumero(v) {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    if (v == null || v === '') return null;
    var s = String(v).replace(/[^\d.,\-]/g, '');
    if (!s || s === '-') return null;
    var coma = s.lastIndexOf(','), punto = s.lastIndexOf('.');
    if (coma > -1 && punto > -1) {
      s = coma > punto ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else if (coma > -1) {
      s = (s.length - coma - 1 === 3 && /^\d{1,3}(,\d{3})+$/.test(s)) ? s.replace(/,/g, '') : s.replace(',', '.');
    }
    var n = parseFloat(s);
    return isFinite(n) ? n : null;
  }

  function fechaSerial(v) {
    var p = String(v == null ? '' : v).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!p) return null;
    var d = Date.UTC(+p[1], +p[2] - 1, +p[3]);
    if (!isFinite(d)) return null;
    return Math.round((d - Date.UTC(1899, 11, 30)) / 86400000);
  }

  function aTexto(v) {
    return v == null ? '' : String(v);
  }

  // --------------------------------------------------------------- ZIP ---
  var TABLA_CRC = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = TABLA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function empaqueta(archivos) {
    var enc = new TextEncoder();
    var trozos = [], central = [], offset = 0;
    var d = new Date();
    var hora = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
    var fecha = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);

    archivos.forEach(function (a) {
      var nombre = enc.encode(a.nombre);
      var datos = enc.encode(a.datos);
      var crc = crc32(datos);

      var lh = new Uint8Array(30 + nombre.length);
      var v = new DataView(lh.buffer);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, 0x0800, true);
      v.setUint16(8, 0, true);
      v.setUint16(10, hora, true);
      v.setUint16(12, fecha, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, datos.length, true);
      v.setUint32(22, datos.length, true);
      v.setUint16(26, nombre.length, true);
      lh.set(nombre, 30);
      trozos.push(lh, datos);

      var ch = new Uint8Array(46 + nombre.length);
      var c = new DataView(ch.buffer);
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, 20, true);
      c.setUint16(6, 20, true);
      c.setUint16(8, 0x0800, true);
      c.setUint16(10, 0, true);
      c.setUint16(12, hora, true);
      c.setUint16(14, fecha, true);
      c.setUint32(16, crc, true);
      c.setUint32(20, datos.length, true);
      c.setUint32(24, datos.length, true);
      c.setUint16(28, nombre.length, true);
      c.setUint32(42, offset, true);
      ch.set(nombre, 46);
      central.push(ch);

      offset += lh.length + datos.length;
    });

    var tamCentral = central.reduce(function (a, b) { return a + b.length; }, 0);
    var eocd = new Uint8Array(22);
    var f = new DataView(eocd.buffer);
    f.setUint32(0, 0x06054b50, true);
    f.setUint16(8, archivos.length, true);
    f.setUint16(10, archivos.length, true);
    f.setUint32(12, tamCentral, true);
    f.setUint32(16, offset, true);

    var todos = trozos.concat(central, [eocd]);
    var total = todos.reduce(function (a, b) { return a + b.length; }, 0);
    var salida = new Uint8Array(total);
    var p = 0;
    todos.forEach(function (t) { salida.set(t, p); p += t.length; });
    return salida;
  }

  // ------------------------------------------------------------ estilos ---
  function xf(numFmtId, fontId, fillId, borderId, horizontal, wrap) {
    var s = '<xf numFmtId="' + numFmtId + '" fontId="' + fontId + '" fillId="' + fillId +
      '" borderId="' + borderId + '" xfId="0" applyFont="1" applyFill="1" applyBorder="1"' +
      (numFmtId ? ' applyNumberFormat="1"' : '') + ' applyAlignment="1">';
    s += '<alignment horizontal="' + horizontal + '" vertical="center"' + (wrap ? ' wrapText="1"' : '') + '/>';
    return s + '</xf>';
  }

  function estilos() {
    var fuentes =
      '<font><sz val="11"/><color rgb="FF111827"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +
      '<font><i/><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Calibri"/></font>';

    var rellenos =
      '<fill><patternFill patternType="none"/></fill>' +
      '<fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="' + TINTA + '"/><bgColor indexed="64"/></patternFill></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="' + BANDA + '"/><bgColor indexed="64"/></patternFill></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFD91B1B"/><bgColor indexed="64"/></patternFill></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill>';

    var borde = '<color rgb="' + BORDE + '"/>';
    var bordes =
      '<border><left/><right/><top/><bottom/><diagonal/></border>' +
      '<border><left style="thin">' + borde + '</left><right style="thin">' + borde + '</right>' +
      '<top style="thin">' + borde + '</top><bottom style="thin">' + borde + '</bottom><diagonal/></border>' +
      '<border><left style="thin">' + borde + '</left><right style="thin">' + borde + '</right>' +
      '<top style="double"><color rgb="FF94A3B8"/></top><bottom style="thin">' + borde + '</bottom><diagonal/></border>';

    var celdas = [
      xf(0, 0, 0, 0, 'general', false),
      xf(0, 1, 4, 0, 'left', false),
      xf(0, 2, 0, 0, 'left', false),
      xf(0, 3, 2, 1, 'center', true),
      xf(0, 0, 0, 1, 'left', true),
      xf(0, 0, 3, 1, 'left', true),
      xf(0, 0, 0, 1, 'center', false),
      xf(0, 0, 3, 1, 'center', false),
      xf(FORMATO_FECHA, 0, 0, 1, 'center', false),
      xf(FORMATO_FECHA, 0, 3, 1, 'center', false),
      xf(FORMATO_MONEDA, 0, 0, 1, 'right', false),
      xf(FORMATO_MONEDA, 0, 3, 1, 'right', false),
      xf(3, 0, 0, 1, 'right', false),
      xf(3, 0, 3, 1, 'right', false),
      xf(0, 4, 5, 2, 'left', false),
      xf(0, 4, 5, 2, 'center', false),
      xf(FORMATO_MONEDA, 4, 5, 2, 'right', false)
    ];

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="2">' +
      '<numFmt numFmtId="' + FORMATO_FECHA + '" formatCode="dd/mm/yyyy"/>' +
      '<numFmt numFmtId="' + FORMATO_MONEDA + '" formatCode="&quot;$&quot;#,##0.00"/>' +
      '</numFmts>' +
      '<fonts count="5">' + fuentes + '</fonts>' +
      '<fills count="6">' + rellenos + '</fills>' +
      '<borders count="3">' + bordes + '</borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="' + celdas.length + '">' + celdas.join('') + '</cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '<dxfs count="3">' +
      '<dxf><font><color rgb="' + VERDE + '"/></font><fill><patternFill><bgColor rgb="' + VERDE_FONDO + '"/></patternFill></fill></dxf>' +
      '<dxf><font><color rgb="' + AMBAR + '"/></font><fill><patternFill><bgColor rgb="' + AMBAR_FONDO + '"/></patternFill></fill></dxf>' +
      '<dxf><font><color rgb="' + ROJO + '"/></font><fill><patternFill><bgColor rgb="' + ROJO_FONDO + '"/></patternFill></fill></dxf>' +
      '</dxfs>' +
      '<tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>' +
      '</styleSheet>';
  }

  // -------------------------------------------------------------- hoja ---
  var PALABRAS = {
    verde: ['APROBAD', 'ACEPTAD', 'ENTREGAD', 'FINALIZAD', 'COMPLETAD', 'INSTALAD', 'COBRAD', 'GANAD', 'ACTIVA', 'LISTA'],
    ambar: ['PENDIENTE', 'PROCES', 'ENVIAD', 'ESPERA', 'REVIS', 'EN CURSO', 'ABIERTA'],
    rojo: ['RECHAZAD', 'CANCELAD', 'VENCID', 'CADUCAD', 'NO ASIST', 'PERDID', 'SUSPENDID']
  };

  function reglaColor(texto) {
    var t = String(texto || '').toUpperCase();
    for (var i = 0; i < PALABRAS.rojo.length; i++) if (t.indexOf(PALABRAS.rojo[i]) > -1) return 2;
    for (var j = 0; j < PALABRAS.verde.length; j++) if (t.indexOf(PALABRAS.verde[j]) > -1) return 0;
    for (var k = 0; k < PALABRAS.ambar.length; k++) if (t.indexOf(PALABRAS.ambar[k]) > -1) return 1;
    return -1;
  }

  function estilosDe(tipo, banda) {
    switch (tipo) {
      case 'fecha': return banda ? 9 : 8;
      case 'moneda': return banda ? 11 : 10;
      case 'entero': return banda ? 13 : 12;
      case 'centro': return banda ? 7 : 6;
      default: return banda ? 5 : 4;
    }
  }

  function construyeHoja(cfg) {
    var columnas = cfg.columnas;
    var filas = cfg.filas;
    var total = columnas.length;
    var ultimo = 4 + filas.length;
    var ref = letra(total - 1);
    var ancho = 'A1:' + ref + (ultimo + (cfg.totales ? 1 : 0));

    var cols = columnas.map(function (c, i) {
      return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + (c.ancho || 16) + '" customWidth="1"/>';
    }).join('');

    var xml = '';
    xml += '<row r="1" ht="30" customHeight="1"><c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">' +
      esc(cfg.titulo) + '</t></is></c></row>';
    xml += '<row r="2" ht="16" customHeight="1"><c r="A2" s="2" t="inlineStr"><is><t xml:space="preserve">' +
      esc(cfg.subtitulo) + '</t></is></c></row>';

    xml += '<row r="4" ht="30" customHeight="1">' + columnas.map(function (c, i) {
      return '<c r="' + letra(i) + '4" s="3" t="inlineStr"><is><t xml:space="preserve">' +
        esc(c.titulo) + '</t></is></c>';
    }).join('') + '</row>';

    filas.forEach(function (fila, r) {
      var n = 5 + r;
      var banda = r % 2 === 1;
      xml += '<row r="' + n + '">' + columnas.map(function (c, i) {
        var ref2 = letra(i) + n;
        var v = fila[i];
        if (c.tipo === 'fecha') {
          var s = fechaSerial(v);
          return s == null
            ? '<c r="' + ref2 + '" s="' + estilosDe('centro', banda) + '" t="inlineStr"><is><t>' + esc(aTexto(v)) + '</t></is></c>'
            : '<c r="' + ref2 + '" s="' + estilosDe('fecha', banda) + '"><v>' + s + '</v></c>';
        }
        if (c.tipo === 'moneda' || c.tipo === 'entero') {
          var n2 = aNumero(v);
          return n2 == null
            ? '<c r="' + ref2 + '" s="' + estilosDe('centro', banda) + '" t="inlineStr"><is><t>' + esc(aTexto(v)) + '</t></is></c>'
            : '<c r="' + ref2 + '" s="' + estilosDe(c.tipo, banda) + '"><v>' + n2 + '</v></c>';
        }
        var txt = aTexto(v);
        if (txt === '') return '<c r="' + ref2 + '" s="' + estilosDe(c.tipo, banda) + '"/>';
        return '<c r="' + ref2 + '" s="' + estilosDe(c.tipo, banda) + '" t="inlineStr"><is><t xml:space="preserve">' +
          esc(txt) + '</t></is></c>';
      }).join('') + '</row>';
    });

    if (cfg.totales) {
      var nf = ultimo + 1;
      var celdasPie = columnas.map(function (c, i) {
        var ref2 = letra(i) + nf;
        if (i === 0) {
          return '<c r="' + ref2 + '" s="14" t="inlineStr"><is><t xml:space="preserve">' +
            esc(cfg.etiquetaTotal || 'TOTAL') + '</t></is></c>';
        }
        if (c.tipo === 'moneda' || c.tipo === 'entero') {
          return '<c r="' + ref2 + '" s="' + (c.tipo === 'moneda' ? 16 : 15) + '"><f>SUM(' + ref2.replace(/\d+$/, '') +
            '5:' + ref2.replace(/\d+$/, '') + ultimo + ')</f></c>';
        }
        return '<c r="' + ref2 + '" s="15"/>';
      }).join('');
      xml += '<row r="' + nf + '">' + celdasPie + '</row>';
    }

    var colores = columnas.reduce(function (acc, c, i) {
      if (c.tipo !== 'estado') return acc;
      var col = letra(i);
      var rango = col + '5:' + col + ultimo;
      ['PENDIENTE', 'APROBAD', 'RECHAZAD'].forEach(function (palabra, orden) {
        var id = reglaColor(palabra);
        acc.push('<conditionalFormatting sqref="' + rango + '">' +
          '<cfRule type="containsText" dxfId="' + id + '" priority="' + (orden + 1) +
          '" operator="containsText" text="' + palabra + '">' +
          '<formula>NOT(ISERROR(SEARCH("' + palabra + '",' + col + '5)))</formula></cfRule>' +
          '</conditionalFormatting>');
      });
      return acc;
    }, []);

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>' +
      '<dimension ref="' + ancho + '"/>' +
      '<sheetViews><sheetView showGridLines="0" tabSelected="1" workbookViewId="0">' +
      '<pane xSplit="1" ySplit="4" topLeftCell="B5" activePane="bottomRight" state="frozen"/>' +
      '<selection pane="bottomRight" activeCell="B5" sqref="B5"/>' +
      '</sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="16.5"/>' +
      '<cols>' + cols + '</cols>' +
      '<sheetData>' + xml + '</sheetData>' +
      '<autoFilter ref="A4:' + ref + ultimo + '"/>' +
      '<mergeCells count="2"><mergeCell ref="A1:' + ref + '1"/><mergeCell ref="A2:' + ref + '2"/></mergeCells>' +
      colores.join('') +
      '<pageMargins left="0.4" right="0.4" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>' +
      '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>' +
      '</worksheet>';
  }

  function normalizaColumnas(cfg, filas) {
    if (cfg.columnas && cfg.columnas.length) {
      return cfg.columnas.map(function (c) {
        if (typeof c === 'string') return { titulo: c, ancho: 16, tipo: 'texto' };
        return { titulo: c.titulo || '', ancho: c.ancho || 16, tipo: c.tipo || 'texto' };
      });
    }
    var primera = (filas && filas[0]) || [];
    return primera.map(function (t) { return { titulo: aTexto(t), ancho: 16, tipo: 'texto' }; });
  }

  function descarga(cfg) {
    var filas = cfg.filas || [];
    var columnas = normalizaColumnas(cfg, filas);
    if (!columnas.length) return false;

    var total = filas.length;
    var hoy = new Date();
    var sello = String(hoy.getDate()).padStart(2, '0') + '/' +
      String(hoy.getMonth() + 1).padStart(2, '0') + '/' + hoy.getFullYear();
    var subtitulo = cfg.subtitulo || (total + (total === 1 ? ' registro' : ' registros') +
      ' · generado el ' + sello);

    var hoja = nombreHoja(cfg.hoja || cfg.titulo);
    var completo = {
      titulo: cfg.titulo || 'Reporte',
      subtitulo: subtitulo,
      columnas: columnas,
      filas: filas,
      totales: cfg.totales === true,
      etiquetaTotal: cfg.etiquetaTotal
    };

    var momento = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    var archivos = [
      {
        nombre: '[Content_Types].xml',
        datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
          '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
          '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
          '</Types>'
      },
      {
        nombre: '_rels/.rels',
        datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
          '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
          '</Relationships>'
      },
      {
        nombre: 'docProps/core.xml',
        datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
          'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
          'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
          '<dc:title>' + esc(completo.titulo) + '</dc:title>' +
          '<dc:creator>Grupo Nerba Hidalgo</dc:creator>' +
          '<cp:lastModifiedBy>Grupo Nerba Hidalgo</cp:lastModifiedBy>' +
          '<dcterms:created xsi:type="dcterms:W3CDTF">' + momento + '</dcterms:created>' +
          '<dcterms:modified xsi:type="dcterms:W3CDTF">' + momento + '</dcterms:modified>' +
          '</cp:coreProperties>'
      },
      {
        nombre: 'docProps/app.xml',
        datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" ' +
          'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
          '<Application>Microsoft Excel</Application></Properties>'
      },
      {
        nombre: 'xl/workbook.xml',
        datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
          'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          '<sheets><sheet name="' + esc(hoja) + '" sheetId="1" r:id="rId1"/></sheets>' +
          '<calcPr calcId="191029" fullCalcOnLoad="1"/>' +
          '</workbook>'
      },
      {
        nombre: 'xl/_rels/workbook.xml.rels',
        datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
          '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
          '</Relationships>'
      },
      { nombre: 'xl/styles.xml', datos: estilos() },
      { nombre: 'xl/worksheets/sheet1.xml', datos: construyeHoja(completo) }
    ];

    var bin = empaqueta(archivos);
    var archivo = new Blob([bin], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(archivo);
    a.download = (cfg.nombre || 'reporte') + '.xlsx';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    }, 1500);
    return true;
  }

  global.EXCEL = { descargar: descarga };
})(window);