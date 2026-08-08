// TrueHull landing — progressive enhancement.
// Served as a same-origin file so the page can run under a strict
// Content-Security-Policy (script-src 'self', no inline scripts).

// Without JS the menu is simply visible; this marks that JS is available.
document.documentElement.classList.add('js');

// ---- Mobile nav toggle ----
(function () {
  var nav = document.querySelector('.site-nav');
  var btn = nav && nav.querySelector('.site-nav__toggle');
  if (!nav || !btn) return;

  function isOpen() {
    return nav.getAttribute('data-open') === 'true';
  }
  function setOpen(open) {
    nav.setAttribute('data-open', String(open));
    btn.setAttribute('aria-expanded', String(open));
  }
  // returnFocus is for keyboard/programmatic closes only - after a link tap the
  // page is navigating, and after an outside tap the user is pointing elsewhere,
  // so yanking focus back to the toggle in those cases would be hostile.
  function close(returnFocus) {
    if (!isOpen()) return;
    setOpen(false);
    if (returnFocus) btn.focus();
  }

  btn.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  // Close on link tap (the target section is what the user wants to see).
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close(false);
  });

  // Escape closes and returns focus to the toggle, the expected keyboard path.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close(true);
  });

  // A tap/click outside the nav closes it. Guarded by isOpen so it costs
  // nothing while the menu is shut, and scoped to the open panel so taps on
  // the page do not fight anything else.
  document.addEventListener('click', function (e) {
    if (isOpen() && !nav.contains(e.target)) close(false);
  });
})();

// ---- Waitlist submit ----
// Posts the email to Loops without leaving the page, and shows an inline
// result. If JS is off, the <noscript> mailto in the form is the fallback;
// if the fetch fails, the same mailto is offered inline.
(function () {
  var form = document.getElementById('waitlist-form');
  if (!form) return;

  var input = document.getElementById('waitlist-email');
  var status = document.getElementById('waitlist-status');
  var button = form.querySelector('button[type="submit"]');
  var MAILTO =
    'mailto:mark@gettruehull.com?subject=TrueHull%20launch%20waitlist';

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.setAttribute('data-state', state || '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input || !input.value) return;

    // Guard against the pre-launch placeholder so a test click before the
    // real form ID is wired does not silently look like a failure.
    if (form.action.indexOf('PLACEHOLDER-FORM-ID') !== -1) {
      setStatus(
        'The waitlist is not connected yet. Please check back at launch.',
        'error'
      );
      return;
    }

    if (button) button.disabled = true;
    setStatus('Adding you to the list…', 'pending');

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: input.value }).toString()
    })
      .then(function (res) {
        return res.json().catch(function () {
          return { success: res.ok };
        });
      })
      .then(function (data) {
        if (data && data.success) {
          form.reset();
          setStatus(
            "You're on the list. We'll email you once, when TrueHull is ready.",
            'ok'
          );
        } else {
          throw new Error((data && data.message) || 'Subscription failed');
        }
      })
      .catch(function () {
        setStatus('', '');
        if (status) {
          status.setAttribute('data-state', 'error');
          status.textContent = "Something went wrong. Email us to join: ";
          var link = document.createElement('a');
          link.href = MAILTO;
          link.textContent = 'mark@gettruehull.com';
          status.appendChild(link);
        }
      })
      .then(function () {
        if (button) button.disabled = false;
      });
  });
})();
