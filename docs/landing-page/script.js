(function () {
  var sections = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    sections.forEach(function (el) {
      el.classList.add('in');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  sections.forEach(function (el) {
    observer.observe(el);
  });

  var copyButtons = document.querySelectorAll('[data-copy-target]');
  copyButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.querySelector(button.getAttribute('data-copy-target'));
      if (!target) return;
      var text = target.innerText;
      navigator.clipboard.writeText(text).then(function () {
        var original = button.textContent;
        button.textContent = 'Copied';
        setTimeout(function () {
          button.textContent = original;
        }, 1200);
      });
    });
  });
})();
