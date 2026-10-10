# ARIA Widget Patterns

Full patterns from the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/).

## Modal Dialog

```html
<button id="open-modal">Open settings</button>

<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" id="dialog">
  <h2 id="dialog-title">Settings</h2>
  <p>Dialog content here.</p>
  <button id="close-modal">Close</button>
</div>
```

```javascript
function openModal(dialogEl, triggerEl) {
  const focusable = dialogEl.querySelectorAll(
    'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  dialogEl.removeAttribute('hidden');
  first.focus();

  const trap = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === 'Escape') closeModal(dialogEl, triggerEl, trap);
  };
  dialogEl.addEventListener('keydown', trap);
}

function closeModal(dialogEl, triggerEl, trap) {
  dialogEl.setAttribute('hidden', '');
  dialogEl.removeEventListener('keydown', trap);
  triggerEl.focus(); // Restore focus to trigger
}
```

## Tabs

```html
<div role="tablist" aria-label="Account settings">
  <button role="tab" aria-selected="true"  aria-controls="panel-profile" id="tab-profile">Profile</button>
  <button role="tab" aria-selected="false" aria-controls="panel-billing" id="tab-billing" tabindex="-1">Billing</button>
</div>
<div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">…</div>
<div role="tabpanel" id="panel-billing" aria-labelledby="tab-billing" hidden>…</div>
```

```javascript
// Arrow key navigation between tabs (required by APG)
tablist.addEventListener('keydown', (e) => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const idx = tabs.indexOf(document.activeElement);
  let next;
  if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
  if (e.key === 'ArrowLeft')  next = (idx - 1 + tabs.length) % tabs.length;
  if (e.key === 'Home') next = 0;
  if (e.key === 'End')  next = tabs.length - 1;
  if (next !== undefined) { tabs[next].focus(); tabs[next].click(); e.preventDefault(); }
});
```

## Accordion

```html
<h3><button aria-expanded="false" aria-controls="acc-1">Section title</button></h3>
<div id="acc-1" hidden>Section content</div>
```

```javascript
document.querySelectorAll('.accordion button').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    document.getElementById(btn.getAttribute('aria-controls')).hidden = expanded;
  });
});
```

## Combobox (Autocomplete)

```html
<label for="search">Search</label>
<input id="search" type="text" role="combobox"
       aria-expanded="false" aria-autocomplete="list"
       aria-controls="search-listbox" aria-activedescendant="">
<ul id="search-listbox" role="listbox" hidden>
  <li role="option" id="opt-1">Apple</li>
  <li role="option" id="opt-2">Banana</li>
</ul>
```

## Live Regions

```html
<!-- Status (non-urgent) -->
<div aria-live="polite" aria-atomic="true" id="status-msg"></div>

<!-- Alert (urgent, interrupts) -->
<div role="alert" id="error-msg"></div>

<!-- Progress -->
<div role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">
  40% complete
</div>
```

```javascript
// Announce message to screen readers
function announce(msg, urgency = 'polite') {
  const region = document.getElementById(urgency === 'assertive' ? 'error-msg' : 'status-msg');
  region.textContent = '';          // Clear first (forces re-announcement)
  requestAnimationFrame(() => { region.textContent = msg; });
}
```

## Disclosure (Show/Hide)

```html
<!-- Simple: no list role needed -->
<button aria-expanded="false" aria-controls="details">Show details</button>
<div id="details" hidden>
  <p>Additional information here.</p>
</div>
```

## Breadcrumb Navigation

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/shoes" aria-current="page">Shoes</a></li>
  </ol>
</nav>
```

## Skip Links

```html
<!-- Must be the very first element in <body> -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 9999;
  transition: top 0.2s;
}
.skip-link:focus { top: 0; }
</style>

<main id="main-content" tabindex="-1">…</main>
```
