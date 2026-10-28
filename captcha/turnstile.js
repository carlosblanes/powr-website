/*
 * Runs Cloudflare Turnstile and hands each token to the Wizelift app
 * (wizelift-native/src/auth/captcha.ts parses these messages). docs/security/CAPTCHA.md.
 *
 * The site key comes in the query string so this page never needs a rebuild:
 * it is public, and Turnstile itself refuses a key whose widget does not list
 * this hostname.
 */
(function () {
  'use strict';

  function post(message) {
    message.wizeliftCaptcha = 1;
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    } catch (e) { /* not inside the app: nothing to tell */ }
  }

  var sitekey = new URLSearchParams(window.location.search).get('sitekey') || '';
  if (!/^[0-9A-Za-z_-]{8,128}$/.test(sitekey)) {
    post({ type: 'error', code: 'sitekey' });
    return;
  }

  var widgetId = null;

  /* The app calls this after spending a token, to have the next one ready. */
  window.wizeliftCaptchaReset = function () {
    if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
  };

  window.wizeliftTurnstileLoaded = function () {
    widgetId = window.turnstile.render('#widget', {
      sitekey: sitekey,
      /* Invisible unless Cloudflare needs a tap; then the app opens the view. */
      appearance: 'interaction-only',
      theme: 'auto',
      size: 'flexible',
      'refresh-expired': 'auto',
      'refresh-timeout': 'auto',
      retry: 'auto',
      'response-field': false,
      callback: function (token) { post({ type: 'token', token: token }); },
      'expired-callback': function () { post({ type: 'expired' }); },
      'timeout-callback': function () { post({ type: 'expired' }); },
      'before-interactive-callback': function () { post({ type: 'interactive' }); },
      'after-interactive-callback': function () { post({ type: 'ready' }); },
      'unsupported-callback': function () { post({ type: 'error', code: 'unsupported' }); },
      'error-callback': function (code) {
        post({ type: 'error', code: String(code || '') });
        return true;
      },
    });
  };

  /* Loaded from here rather than a tag so a failed load (no signal) is reported. */
  function loadTurnstile() {
    var script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=wizeliftTurnstileLoaded';
    script.async = true;
    script.onerror = function () { post({ type: 'error', code: 'load' }); };
    document.head.appendChild(script);
  }

  post({ type: 'ready' });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTurnstile);
  } else {
    loadTurnstile();
  }
})();
