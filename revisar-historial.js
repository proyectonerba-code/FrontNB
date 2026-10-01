// Revisa la sintaxis de todos los scripts inline del historial y confirma
// que el arreglo quedo completo.
const fs = require('fs');
const ruta = 'C:\\Users\\DELL\\AppData\\Local\\Temp\\opencode\\work\\Front\\mis-cotizaciones.html';
const h = fs.readFileSync(ruta, 'utf8');

const re = /<script>([\s\S]*?)<\/script>/g;
let m, n = 0, malos = 0;
while ((m = re.exec(h))) {
  const s = m[1];
  if (!s.trim()) continue;
  n++;
  try { new Function(s); } catch (e) { malos++; console.log('  ERROR: ' + e.message.slice(0, 90)); }
}
console.log('  scripts inline revisados: ' + n + '   con error de sintaxis: ' + malos);
console.log('  el return temprano que rompia ya no esta : ' + !h.indexOf("if (a.style.display === 'none') return;").valueOf() * 0 - (h.indexOf("if (a.style.display === 'none') return;") === -1));
console.log('  el filtro marca lo que tapa              : ' + h.indexOf('data-oculto-tipo') > -1);
console.log('  el contador usa lo visible               : ' + h.indexOf('var visibles = arts.filter') > -1);
console.log('  tipoOf acepta las series nuevas          : ' + h.indexOf('INS|ELC|MAT|ESP') > -1);
console.log('  la etiqueta conserva el acento           : ' + h.indexOf('Electr\u00f3nica y refacciones') > -1);