(function () {
  const params = new URLSearchParams(window.location.search);
  const nonce = params.get('nonce');

  async function postResult(payload) {
    try {
      await fetch('/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ nonce: nonce }, payload)),
      });
      showDone();
    } catch (err) {
      window.alert('Could not reach the harness. Is it still running?');
    }
  }

  function showDone() {
    const done = document.getElementById('done');
    if (done) {
      done.hidden = false;
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Choice mode: any element with data-choice resolves with its id.
  // Layout-agnostic: works regardless of how the agent structured the HTML.
  document.querySelectorAll('[data-choice]').forEach(function (el) {
    el.addEventListener('click', function () {
      const id = el.getAttribute('data-choice');
      document.querySelectorAll('[data-choice]').forEach(function (other) {
        other.classList.toggle('is-selected', other === el);
      });
      postResult({ id: id });
    });
  });

  // Confirm mode: #confirm / #reject elements.
  const confirmBtn = document.getElementById('confirm');
  const rejectBtn = document.getElementById('reject');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      postResult({ confirmed: true });
    });
  }
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () {
      const reason = window.prompt('What does not match?') || '';
      postResult({ confirmed: false, reason: reason });
    });
  }
})();
