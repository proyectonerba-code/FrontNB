// Localiza function pass() en el historial y la reemplaza por la version
// corregida, bounding la llave de cierre por conteo de llaves (no a ojo).
const fs = require('fs');
const ruta = 'C:\\Users\\DELL\\AppData\\Local\\Temp\\opencode\\work\\Front\\mis-cotizaciones.html';
const h = fs.readFileSync(ruta, 'utf8');
const lineas = h.split(/\r?\n/);

const ini = lineas.findIndex(function (l) { return /^\s*function pass\(\) \{/.test(l); });
if (ini < 0) { console.log('  no encontre pass()'); process.exit(1); }

let prof = 0, fin = -1;
for (let i = ini; i < lineas.length; i++) {
  for (const ch of lineas[i]) { if (ch === '{') prof++; else if (ch === '}') prof--; }
  if (i > ini && prof === 0) { fin = i; break; }
}
if (fin < 0) { console.log('  no se pudo cerrar el bloque'); process.exit(1); }

console.log('  pass() va de la linea ' + (ini + 1) + ' a la ' + (fin + 1));
console.log('  llave de cierre: "' + lineas[fin].trim() + '"');
console.log('  --- version actual ---');
lineas.slice(ini, fin + 1).forEach(function (l, k) { console.log('   ' + (k + 1) + ': ' + l.trim()); });

const nueva = [
  '  function pass() {',
  '    var arts = Array.prototype.slice.call(document.querySelectorAll(\'#lista-cotizaciones > article\'));',
  '    arts.forEach(function (a) {',
  '      var coincide = (tipo === \'todos\') || (tipoOf(a) === tipo);',
  '      var tapadaPorTipo = a.getAttribute(\'data-oculto-tipo\') === \'1\';',
  '      if (coincide) {',
  '        // Solo se destapa lo que tapo ESTE filtro. Lo que tapo el filtro de',
  '        // estado se deja quieto, para que los dos no se peleen entre ellos.',
  '        if (tapadaPorTipo) {',
  '          a.style.display = \'\';',
  '          a.removeAttribute(\'data-oculto-tipo\');',
  '        }',
  '      } else if (!tapadaPorTipo && a.style.display !== \'none\') {',
  '        a.setAttribute(\'data-oculto-tipo\', \'1\');',
  '        a.style.display = \'none\';',
  '      }',
  '    });',
  '    // El contador va con lo que se ve de verdad. Antes contaba tambien las',
  '    // ocultas, y por eso marcaba "Todas (3)" sobre una lista vacia.',
  '    var visibles = arts.filter(function (a) { return a.style.display !== \'none\'; });',
  '    var np = visibles.filter(function (a) { return tipoOf(a) === \'productos\'; }).length;',
  '    pills.forEach(function (b) {',
  '      var k = b.getAttribute(\'data-tipo-pill\');',
  '      var base = k === \'todos\' ? \'Todas\' : (k === \'productos\' ? \'Electr\u00f3nica y refacciones\' : \'Instalaciones\');',
  '      var n = k === \'todos\' ? visibles.length : (k === \'productos\' ? np : visibles.length - np);',
  '      b.textContent = base + \' (\' + n + \')\';',
  '    });',
  '  }'
];

const salida = lineas.slice(0, ini).concat(nueva, lineas.slice(fin + 1));
fs.writeFileSync(ruta, salida.join('\n'), 'utf8');
console.log('  --- nueva version instalada ---');

// Y el arreglo de tipoOf: que la busqueda del folio acepte las series nuevas.
let h2 = fs.readFileSync(ruta, 'utf8');
const viejo = "    var folio = ((a.textContent || '').match(/COT-\\d+-\\d+/) || [''])[0];";
const nuevo = "    // Acepta el folio viejo (COT-1234-2026) y las series nuevas\n" +
  "    // (COT-INS-0001-2026): si no, el filtro de tipo no encontraba ninguna.\n" +
  "    var folio = ((a.textContent || '').match(/COT-(?:INS|ELC|MAT|ESP)-\\d+-\\d+|COT-\\d+-\\d+/) || [''])[0];";
if (h2.indexOf(viejo) === -1) { console.log('  [aviso] no encontre la linea de folio de tipoOf'); }
else { h2 = h2.replace(viejo, nuevo); fs.writeFileSync(ruta, h2, 'utf8'); console.log('  tipoOf acepta las dos formas de folio'); }