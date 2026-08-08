// TrueHull landing — progressive enhancement.
// Served as a same-origin file so the page can run under a strict
// Content-Security-Policy (script-src 'self', no inline scripts).

// Without JS the menu is simply visible; this marks that JS is available.
document.documentElement.classList.add('js');

// ---- Mobile nav toggle (moved verbatim from the former inline script) ----
(function () {
  var nav = document.querySelector('.site-nav');
  var btn = nav && nav.querySelector('.site-nav__toggle');
  if (!nav || !btn) return;
  btn.addEventListener('click', function () {
    var open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    btn.setAttribute('aria-expanded', String(!open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.setAttribute('data-open', 'false');
      btn.setAttribute('aria-expanded', 'false');
    }
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
