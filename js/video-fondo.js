/* Video de fondo del bloque de gabinetes.
 *
 * Se probo con YouTube y se atoro: el reproductor se quedaba en buffering y la
 * pagina mostraba un cuadro quieto. El mp4 local si se reproduce siempre, asi
 * que volvio a ser el video, pero sin el costo que tenia antes.
 *
 * Antes este mismo mp4 (12.7 MB) se empezaba a bajar con la pagina en blanco.
 * Ahora el atributo src se coloca despues, cuando la pagina ya esta pintada,
 * asi que pesa lo mismo pero no estorba para abrir. El poster se ve desde el
 * primer instante y el video entra en cuanto el bloque esta cerca de pantalla.
 */
(function () {
  'use strict';

  function activar(fondo) {
    if (fondo.dataset.unVideoListo === '1') return;
    fondo.dataset.unVideoListo = '1';

    var video = fondo.querySelector('video');
    var fuente = fondo.querySelector('source[data-un-video-fuente]');
    if (!video || !fuente) return;

    var ruta = fuente.getAttribute('data-src');

    function conectar() {
      if (video.dataset.unVideoConectado === '1') return;
      video.dataset.unVideoConectado = '1';
      fuente.src = ruta;
      fuente.removeAttribute('data-un-video-fuente');
      video.load();
      var intento = video.play();
      if (intento && intento.catch) intento.catch(function () {});
    }

    // Si el navegador pausa el video (pestana en segundo plano, ahorro de
    // energia), se reanuda. Algunos moviles lo hacen solos al volver.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      if (video.dataset.unVideoConectado !== '1') return;
      if (video.paused) { var i = video.play(); if (i && i.catch) i.catch(function () {}); }
    });

    function esperar() {
      if ('IntersectionObserver' in window) {
        var vista = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (e) {
            if (e.isIntersecting) { vista.disconnect(); conectar(); }
          });
        }, { rootMargin: '300px' });
        vista.observe(fondo);
      }
      if ('requestIdleCallback' in window) requestIdleCallback(conectar, { timeout: 1500 });
      else setTimeout(conectar, 300);
    }

    if (document.readyState === 'complete') esperar();
    else window.addEventListener('load', esperar);
  }

  function iniciar() {
    var bloques = document.querySelectorAll('[data-un-video-fondo]');
    for (var i = 0; i < bloques.length; i++) activar(bloques[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();