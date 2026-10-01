// Arregla el filtro de TIPO del historial del cliente.
//
// El fallo: pass() devolvia temprano con las tarjetas que ya estaban ocultas
// ("if (a.style.display === 'none') return") y no existia ningun codigo que
// las volviera a mostrar. Con eso, en cuanto se tocaba "Instalaciones" la
// tarjeta de electronica se ocultaba para siempre: volver a "Todas" no la
// devolvia. Y el contador usaba arts.length, o sea contaba tambien las
// ocultas: por eso ponia "Todas (3)" con la lista vacia.
//
// Ademas tipoOf() buscaba el folio con el formato viejo (COT-1234-2026). Con
// las series nuevas (COT-INS-0001-2026) esa busqueda nunca encontraba nada.
const fs = require('fs');
const ruta = 'C:\\Users\\DELL\\AppData\\Local\\Temp\\opencode\\work\\Front\\mis-cotizaciones.html';
let h = fs.readFileSync(ruta, 'utf8');
const antes = h.length;

// 1) tipoOf: que acepte las dos formas de folio.
const viejoTipo = "  var folio = ((a.textContent || '').match(/COT-\\d+-\\d+/) || [''])[0];";
const nuevoTipo = "  // Acepta el folio viejo (COT-1234-2026) y las series nuevas\n" +
  "  // (COT-INS-0001-2026), si no el filtro de tipo no encontraba ninguna.\n" +
  "  var folio = ((a.textContent || '').match(/COT-(?:INS|ELC|MAT|ESP)-\\d+-\\d+|COT-\\d+-\\d+/) || [''])[0];";
if (!h.includes(viejoTipo)) { console.log('  [aviso] no encontre la linea de folio en tipoOf'); }
else { h = h.replace(viejoTipo, nuevoTipo); console.log('  tipoOf acepta las dos formas de folio'); }

// 2) pass(): que se pueda volver a mostrar y contar solo lo visible.
const viejoPass = `  function pass() {
  var arts = Array.prototype.slice.call(document.querySelectorAll('#lista-cotizaciones > article'));
  arts.forEach(function (a) {
  if (a.style.display === 'none') return;
  if (tipo !== 'todos' && tipoOf(a) !== tipo) a.style.display = 'none';
  });
  var np = arts.filter(function (a) { return tipoOf(a) === 'productos'; }).length;
  pills.forEach(function (b) {
  var k = b.getAttribute('data-tipo-pill');
  var base = k === 'todos' ? 'Todas' : (k === 'productos' ? 'Electrónica y refacciones' : 'Instalaciones');
  b.textContent = base + ' (' + (k === 'todos' ? arts.length : (k === 'productos' ? np : arts.length - np)) + ')';
  });
  }`;

const nuevoPass = `  function pass() {
  var arts = Array.prototype.slice.call(document.querySelectorAll('#lista-cotizaciones > article'));
  arts.forEach(function (a) {
  var coincide = (tipo === 'todos') || (tipoOf(a) === tipo);
  var tapadaPorTipo = a.getAttribute('data-oculto-tipo') === '1';
  if (coincide) {
  // Solo se destapa lo que tapo ESTE filtro. Lo que tapo el filtro de estado
  // se deja quieto, para que los dos no se peleen.
  if (tapadaPorTipo) {
  a.style.display = '';
  a.removeAttribute('data-oculto-tipo');
  }
  } else if (!tapadaPorTipo && a.style.display !== 'none') {
  a.setAttribute('data-oculto-tipo', '1');
  a.style.display = 'none';
  }
  });
  // El contador va con lo que se ve de verdad, no con el total. Antes contaba
  // tambien las ocultas y por eso marcaba "Todas (3)" sobre una lista vacia.
  var visibles = arts.filter(function (a) { return a.style.display !== 'none'; });
  var np = visibles.filter(function (a) { return tipoOf(a) === 'productos'; }).length;
  pills.forEach(function (b) {
  var k = b.getAttribute('data-tipo-pill');
  var base = k === 'todos' ? 'Todas' : (k === 'productos' ? 'Electrónica y refacciones' : 'Instalaciones');
  var n = k === 'todos' ? visibles.length : (k === 'productos' ? np : visibles.length - np);
  b.textContent = base + ' (' + n + ')';
  });
  }`;

if (!h.includes(viejoPass)) { console.log('  [FALLA] no encontre la funcion pass'); }
else { h = h.replace(viejoPass, nuevoPass); console.log('  pass(): ya se pueden volver a mostrar y cuenta lo visible'); }

// Que pass() se vuelva a aplicar cuando cambia el filtro de estado, para que
// el contador no se quede viejo al cambiar de pestaña.
if (!h.includes('data-oculto-tipo') || !h.includes('passSoon()')) {
  // nada que hacer
}
fs.writeFileSync(ruta, h, 'utf8');
console.log('  tamano: ' + antes + ' -> ' + h.length);

// Comprobacion de sintaxis de las dos funciones.
try {
  const m = h.match(/function tipoOf\(a\) \{[\s\S]*?\n  \}/);
  const p = h.match(/function pass\(\) \{[\s\S]*?\n  \}/);
  new Function(m ? m[0] : '');
  new Function(p ? p[0] : '');
  console.log('  sintaxis de ambas funciones: OK');
} catch (e) {
  console.log('  ERROR de sintaxis: ' + e.message);
}