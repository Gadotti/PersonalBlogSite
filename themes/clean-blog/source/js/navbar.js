// Abre/fecha o menu no mobile. Substitui o plugin "collapse" do Bootstrap 3 JS
// (e o jQuery que ele exigia), que eram carregados de CDN so para isto.
// O CSS do Bootstrap 3 ja mostra/esconde o menu pela classe "in".
(function () {
  var buttons = document.querySelectorAll('[data-toggle="collapse"][data-target]');
  Array.prototype.forEach.call(buttons, function (button) {
    var target = document.querySelector(button.getAttribute('data-target'));
    if (!target) return;
    button.addEventListener('click', function () {
      var open = target.classList.toggle('in');
      button.classList.toggle('collapsed', !open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
