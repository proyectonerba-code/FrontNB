/* Video de fondo servido por YouTube.
 *
 * Antes este fondo era un <video> con un mp4 de 12.7 MB que se empezaba a
 * bajar mientras la pagina aparecia todavia en blanco. YouTube reparte el
 * mismo video por streaming y pesa mucho menos, asi que se ve igual de bien
 * y la pagina abre antes.
 *
 * El poster sigue estando debajo, asi que hay imagen desde el primer instante
 * y nunca se ve un cuadro negro mientras entra el reproductor. Ademas el
 * reproductor no se crea hasta que la pagina ya esta pintada.
 */
(function () {
  'use strict';

  var ID = 'aHv0XeEnGuk';
  var PROPORCION = 16 / 9;

  function montar(fondo) {
    if (fondo.dataset.unVideoListo === '1') return;

    // El <video> local se retira del camino: su archivo sigue en el repo como
    // respaldo, pero ya nadie lo descarga.
    var viejo = fondo.querySelector('video');
    if (viejo && viejo.parentNode) viejo.parentNode.removeChild(viejo);

    var marco = document.createElement('div');
    marco.setAttribute('data-un-video-marco', '1');
    marco.setAttribute('aria-hidden', 'true');
    marco.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'border:0;pointer-events:none;opacity:0;transition:opacity .6s ease';

    var reproductor = document.createElement('iframe');
    reproductor.setAttribute('title', 'Video de presentacion de Grupo NERBA');
    reproductor.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    reproductor.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    reproductor.setAttribute('tabindex', '-1');
    reproductor.setAttribute('loading', 'lazy');
    reproductor.style.cssText = 'display:block;border:0;pointer-events:none';
    reproductor.addEventListener('load', function () { marco.style.opacity = '1'; });

    marco.appendChild(reproductor);
    fondo.appendChild(marco);

    // Igual que object-cover: el reproductor siempre llena el espacio y nunca
    // deja barras, ni en pantallas anchas ni en telefonos.
    function ajustar() {
      var ancho = fondo.clientWidth;
      var alto = fondo.clientHeight;
      if (!ancho || !alto) return;
      var escala = Math.max(ancho / (alto * PROPORCION), 1);
      marco.style.width = Math.round(ancho * escala) + 'px';
      marco.style.height = Math.round(alto * escala) + 'px';
    }

    function reproducir() {
      if (fondo.dataset.unVideoCargado === '1') return;
      fondo.dataset.unVideoCargado = '1';
      ajustar();
      reproductor.src = 'https://www.youtube-nocookie.com/embed/' + ID +
        '?autoplay=1&mute=1&playsinline=1' +
        '&loop=1&playlist=' + ID +
        '&controls=0&disablekb=1&fs=0&rel=0&iv_load_policy=3&modestbranding=1';
    }

    fondo.dataset.unVideoListo = '1';
    ajustar();
    window.addEventListener('resize', ajustar);
    window.addEventListener('orientationchange', ajustar);

    if (document.readyState === 'complete') esperar();
    else window.addEventListener('load', esperar);

    function esperar() {
      if ('IntersectionObserver' in window) {
        // Si el bloque esta fuera de pantalla no se carga todavia.
        var vista = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (e) {
            if (e.isIntersecting) { vista.disconnect(); reproducir(); }
          });
        }, { rootMargin: '200px' });
        vista.observe(fondo);
      }
      if ('requestIdleCallback' in window) requestIdleCallback(reproducir, { timeout: 2500 });
      else setTimeout(reproducir, 500);
    }
  }

  function iniciar() {
    var fondos = document.querySelectorAll('[data-un-video-fondo]');
    for (var i = 0; i < fondos.length; i++) montar(fondos[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();