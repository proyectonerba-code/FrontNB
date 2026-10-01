// Restaura el acento de la etiqueta y revisa la sintaxis de los scripts inline.
const fs = require('fs');
const ruta = 'C:\\Users\\DELL\\AppData\\Local\\Temp\\opencode\\work\\Front\\mis-cotizaciones.html';
let h = fs.readFileSync(ruta, 'utf8');

h = h.replace("k === 'productos' ? 'Electronica y refacciones'",
  "k === 'productos' ? 'Electr\u00f3nica y refacciones'");
fs.writeFileSync(ruta, h, 'utf8');

const scripts = [];
const re = /<script>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(h))) {
  if (m[1].indexOf('function pass()') > -1) scripts.push(m[1]);
}
let malos = 0;
for (const s of scripts) {
  try { new Function(s); } catch (e) { malos++; console.log('  ERROR de sintaxis: ' + e.message); }
}
console.log('  scripts con pass() revisados: ' + scripts.length + '   con error: ' + malos);
console.log('  el return temprano que rompia ya no esta: ' + !h.includes("if (a.style.display === 'none') return;"));
console.log('  el filtro marca con atributo propio  : ' + h.includes('data-oculto-tipo'));
console.log('  el contador usa lo visible           : ' + h.includes('var visibles = arts.filter'));
console.log('  tipoOf acepta las series nuevas      : ' + h.includes('INS|ELC|MAT|ESP'));
console.log('  etiqueta con acento                  : ' + h.includes('Electr\u00f3nica y refacciones'));