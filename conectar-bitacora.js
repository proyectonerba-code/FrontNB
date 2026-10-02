// Conecta la bitacora: paginacion por dia + boton de vaciar.
//
// 1) El bloque de paginacion del diseño (botones Anterior/Siguiente y los
//    numeros 1 2 3 ... 142) era HTML fijo, sin manejador: no hacia nada. Se
//    reemplaza por navegacion por dia.
// 2) Se agrega el boton de vaciar la bitacora.
// 3) El script de la pagina deja de pintar todas las filas de golpe y delega
//    en el modulo nuevo.
const fs = require('fs');
const pag = 'C:\\Users\\DELL\\AppData\\Local\\Temp\\opencode\\work\\Front\\superadmin\\bitacora.html';
const mod = 'C:\\Users\\DELL\\AppData\\Local\\Temp\\opencode\\work\\front\\bitacora-dias.js';

let h = fs.readFileSync(pag, 'utf8');
const antes = h.length;

// --- 1) el pie de la tabla, con navegacion por dia y boton de limpiar -----
const ini = h.indexOf('<div class="flex items-center gap-2"><span class="material-symbols-outlined text-base">info</span>');
if (ini < 0) { console.log('  [FALLA] no encontre el pie de la bitacora'); process.exit(1); }
// Se corta hasta el cierre del contenedor de la fila del pie.
const fin = h.indexOf('</section>', ini);
if (fin < 0) { console.log('  [FALLA] no encontre el cierre de la seccion'); process.exit(1); }
const antesBloque = h.slice(ini, fin);

const nuevoPie = [
  '<div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-surface-container">',
  '  <div class="flex flex-wrap items-center gap-2">',
  '    <span class="material-symbols-outlined text-base">info</span>',
  '    <span class="" id="auditFooterCount">Cargando bitácora…</span>',
  '  </div>',
  '  <div class="flex items-center gap-2">',
  '    <button type="button" id="auditDiaAnt" class="px-3 py-1.5 rounded-md bg-surface-container text-on-surface font-label-md font-label-md font-bold disabled:opacity-40">◀ Día anterior</button>',
  '    <button type="button" id="auditDiaSig" class="px-3 py-1.5 rounded-md bg-surface-container text-on-surface font-label-md font-label-md font-bold disabled:opacity-40">Día siguiente ▶</button>',
  '    <button type="button" onclick="window.__bitacoraLimpiar()" class="ml-2 px-3 py-1.5 rounded-md border border-error text-error font-label-md font-label-md font-bold hover:bg-error/10 flex items-center gap-1.5">',
  '      <span class="material-symbols-outlined text-base">delete_sweep</span>Vaciar bitácora',
  '    </button>',
  '  </div>',
  '</div>',
  '<div class="flex flex-wrap items-center gap-1.5 px-5 pb-4" id="auditDiaChips"></div>'
].join('\n');

h = h.slice(0, ini) + nuevoPie + h.slice(fin);
console.log('  pie reemplazado: ' + antesBloque.length + ' -> ' + nuevoPie.length + ' chars');

// --- 2) el script de la pagina delega en el modulo -----------------------
const viejoPinta = "        tb.innerHTML = (r.items || []).map(rowHTML).join('');";
const nuevoPinta = [
  '        // La paginacion por dia la hace el modulo bitacora-dias.js.',
  "        window.__auditRowHTML = rowHTML;",
  '        if (window.__bitacoraPaginar) window.__bitacoraPaginar(r.items || []);',
  "        else tb.innerHTML = (r.items || []).map(rowHTML).join('');"
].join('\n');
if (h.indexOf(viejoPinta) === -1) { console.log('  [aviso] no encontre la linea que pinta la tabla'); }
else { h = h.replace(viejoPinta, nuevoPinta); console.log('  la tabla delega en el modulo de dias'); }

// --- 3) exponer load() para el boton de vaciar --------------------------
const viejoSetup = '    setupDateRange();';
const nuevoSetup = [
  '    setupDateRange();',
  '    // El boton de vaciar necesita poder recargar la tabla al terminar.',
  '    window.__bitacoraRefrescar = load;'
].join('\n');
if (h.indexOf(viejoSetup) > -1) { h = h.replace(viejoSetup, nuevoSetup); console.log('  load() expuesta para el boton de vaciar'); }

// --- 4) cargamos el modulo nuevo -----------------------------------------
if (h.indexOf('js/bitacora-dias.js') === -1) {
  const tag = '<script src="/js/bitacora-dias.js?v=1.0"></script>';
  const anclaScript = '<script src="/js/superadmin/js/superadmin.js';
  const p = h.indexOf(anclaScript);
  if (p > -1) {
    const finScript = h.indexOf('</script>', p) + 9;
    h = h.slice(0, finScript) + tag + h.slice(finScript);
    console.log('  modulo cargado antes del script de la pagina');
  } else {
    h = h.replace('</body>', tag + '\n</body>');
    console.log('  modulo cargado antes de </body>');
  }
}

// --- 5) los botones del dia escuchan las flechas -----------------------
const anclaFin = '  window.__bitacoraIrDia = function (delta) {';
const nacho = [
  '  // Las flechas cambian de dia.',
  "  document.addEventListener('DOMContentLoaded', function () {",
  "    var a = document.getElementById('auditDiaAnt');",
  "    var s = document.getElementById('auditDiaSig');",
  '    if (a) a.addEventListener("click", function () { window.__bitacoraIrDia(-1); });',
  '    if (s) s.addEventListener("click", function () { window.__bitacoraIrDia(1); });',
  '  });',
  ''
].join('\n');
let mod2 = fs.readFileSync(mod, 'utf8');
if (mod2.indexOf('auditDiaAnt') === -1 || mod2.indexOf("addEventListener('DOMContentLoaded'") === -1) {
  mod2 = mod2.replace(anclaFin, nacho + anclaFin);
  fs.writeFileSync(mod, mod2, 'utf8');
  console.log('  flechas conectadas en el modulo');
}

fs.writeFileSync(pag, h, 'utf8');
console.log('  pagina: ' + antes + ' -> ' + h.length + ' bytes');
console.log('  sigue el texto fijo "1,428": ' + h.includes('1,428'));