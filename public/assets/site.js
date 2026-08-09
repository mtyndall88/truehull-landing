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
// Posts the email to Loops via fetch, never a browser navigation, and shows our
// own inline status. Loops' endpoint returns JSON, which is why a JS submit is
// used instead of a native form POST - it lets us render success/error in place.
// The <noscript> mailto in the form is the JS-off fallback.
(function () {
  var form = document.getElementById('waitlist-form');
  if (!form) return;

  var input = document.getElementById('waitlist-email');
  var status = document.getElementById('waitlist-status');
  var button = form.querySelector('button[type="submit"]');
  var MAILTO =
    'mailto:mark@gettruehull.com?subject=TrueHull%20launch%20waitlist';
  // The Loops audience this form feeds. Loops' own embed sends this; without it
  // a signup can be created but not attached to the intended list.
  var MAILING_LIST = 'cmslkxfqiae8f0j11e8y33onx';
  var RATE_MSG = 'Too many attempts. Please try again in a moment.';
  var THROTTLE_KEY = 'th-waitlist-last';
  var THROTTLE_MS = 60000;

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.setAttribute('data-state', state || '');
  }
  // A genuine failure (network down, or a Cloudflare block that never returns a
  // JSON body) - offer the mailto so no one is stranded.
  function offerMailto(lead) {
    if (!status) return;
    status.setAttribute('data-state', 'error');
    status.textContent = lead + ' ';
    var link = document.createElement('a');
    link.href = MAILTO;
    link.textContent = 'mark@gettruehull.com';
    status.appendChild(link);
  }
  function lastSubmit() {
    try { return Number(localStorage.getItem(THROTTLE_KEY)) || 0; } catch (e) { return 0; }
  }
  function markSubmit(v) {
    try { localStorage.setItem(THROTTLE_KEY, String(v)); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input || !input.value) return;

    // Client-side throttle: one signup a minute per browser. This is what keeps
    // us from tripping Loops' own server-side 429 in the first place.
    var now = Date.now();
    if (lastSubmit() + THROTTLE_MS > now) {
      setStatus(RATE_MSG, 'error');
      return;
    }

    if (button) button.disabled = true;
    setStatus('Adding you to the list…', 'pending');

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        userGroup: '',
        mailingLists: MAILING_LIST,
        email: input.value
      }).toString()
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, statusCode: res.status, data: data };
        });
      })
      .then(function (r) {
        if (r.ok && r.data.success !== false) {
          markSubmit(now);
          form.reset();
          setStatus("You're on the list. We'll email you once, when TrueHull is ready.", 'ok');
        } else if (r.statusCode === 429) {
          setStatus(RATE_MSG, 'error');
        } else if (r.data && r.data.message) {
          // A specific validation message from Loops (e.g. malformed email).
          setStatus(r.data.message, 'error');
        } else {
          offerMailto('Something went wrong. Email us to join:');
        }
      })
      .catch(function () {
        offerMailto('Something went wrong. Email us to join:');
      })
      .then(function () {
        if (button) button.disabled = false;
      });
  });
})();
