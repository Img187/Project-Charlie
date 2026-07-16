/* Sparky Energies - eenvoudige toestemming voor externe Google-diensten. */
(function () {
  'use strict';

  const STORAGE_KEY = 'sparky-cookie-toestemming';
  const CHOICE_FULL = 'volledig';
  const CHOICE_FUNCTIONAL = 'functioneel';
  const MEASUREMENT_ID = 'G-HKTJECPX2Z';
  const GOOGLE_TAG_ID = 'googleAnalyticsTag';

  let currentChoice = readChoice();
  let consentLayer;
  let preferencesButton;

  function readChoice() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === CHOICE_FULL || value === CHOICE_FUNCTIONAL ? value : null;
    } catch (error) {
      return null;
    }
  }

  function saveChoice(value) {
    currentChoice = value;
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // De keuze blijft voor de huidige pagina actief als opslag niet beschikbaar is.
    }
  }

  function consentSettings(value) {
    const state = value === CHOICE_FULL ? 'granted' : 'denied';
    return {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state
    };
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
  }

  function loadGoogleAnalytics() {
    window['ga-disable-' + MEASUREMENT_ID] = false;
    ensureGtag();

    if (document.getElementById(GOOGLE_TAG_ID)) {
      window.gtag('consent', 'update', consentSettings(CHOICE_FULL));
      return;
    }

    window.gtag('consent', 'default', consentSettings(CHOICE_FULL));
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);

    const script = document.createElement('script');
    script.id = GOOGLE_TAG_ID;
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  function deleteGoogleAnalyticsCookies() {
    const cookieNames = document.cookie
      .split(';')
      .map((cookie) => cookie.split('=')[0].trim())
      .filter((name) => /^(_ga|_gid|_gat|_gac_|_gcl_)/.test(name));

    const hostname = window.location.hostname;
    const hostnameParts = hostname.split('.').filter(Boolean);
    const domains = new Set(['', hostname, hostname ? '.' + hostname : '']);
    if (hostnameParts.length >= 2) {
      domains.add('.' + hostnameParts.slice(-2).join('.'));
    }

    cookieNames.forEach((name) => {
      domains.forEach((domain) => {
        const domainPart = domain ? '; Domain=' + domain : '';
        document.cookie = name + '=; Max-Age=0; Path=/' + domainPart + '; SameSite=Lax';
      });
    });
  }

  function disableGoogleAnalytics() {
    window['ga-disable-' + MEASUREMENT_ID] = true;
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', consentSettings(CHOICE_FUNCTIONAL));
    }
    deleteGoogleAnalyticsCookies();
  }

  function createMapPlaceholder(frame) {
    const placeholder = document.createElement('div');
    placeholder.className = 'footerKaartToestemming';
    placeholder.dataset.cookieMapPlaceholder = '';
    placeholder.innerHTML = '<p>De kaart is beschikbaar met volledige toestemming.</p><button class="cookieKaartVoorkeurenKnop" type="button">Cookievoorkeuren</button>';
    placeholder.querySelector('button').addEventListener('click', () => showConsentLayer(true));
    frame.insertAdjacentElement('beforebegin', placeholder);
  }

  function updateGoogleMaps(enabled) {
    document.querySelectorAll('iframe[data-cookie-src]').forEach((frame) => {
      const container = frame.parentElement;
      const placeholder = container && container.querySelector('[data-cookie-map-placeholder]');

      if (enabled) {
        if (!frame.src) frame.src = frame.dataset.cookieSrc;
        frame.hidden = false;
        if (placeholder) placeholder.remove();
        return;
      }

      frame.removeAttribute('src');
      frame.hidden = true;
      if (!placeholder) createMapPlaceholder(frame);
    });
  }

  function closeConsentLayer() {
    consentLayer.hidden = true;
  }

  function showConsentLayer(moveFocus) {
    consentLayer.hidden = false;
    if (moveFocus) {
      window.requestAnimationFrame(() => {
        document.getElementById('cookieToestemmingVolledig').focus({ preventScroll: true });
      });
    }
  }

  function chooseFullConsent() {
    saveChoice(CHOICE_FULL);
    loadGoogleAnalytics();
    updateGoogleMaps(true);
    closeConsentLayer();
    preferencesButton.focus({ preventScroll: true });
  }

  function chooseFunctionalOnly() {
    saveChoice(CHOICE_FUNCTIONAL);
    disableGoogleAnalytics();
    updateGoogleMaps(false);
    closeConsentLayer();
    preferencesButton.focus({ preventScroll: true });
  }

  function createConsentLayer() {
    consentLayer = document.createElement('section');
    consentLayer.id = 'cookieToestemmingLaag';
    consentLayer.className = 'cookieToestemmingLaag';
    consentLayer.setAttribute('role', 'dialog');
    consentLayer.setAttribute('aria-modal', 'false');
    consentLayer.setAttribute('aria-labelledby', 'cookieToestemmingTitel');
    consentLayer.setAttribute('aria-describedby', 'cookieToestemmingUitleg');
    consentLayer.hidden = true;
    consentLayer.innerHTML = [
      '<div class="cookieToestemmingInhoud">',
      '  <div class="cookieToestemmingTekst">',
      '    <h2 id="cookieToestemmingTitel">Uw cookiekeuze</h2>',
      '    <p id="cookieToestemmingUitleg">Volledig staat functionele cookies, Google Analytics en Google Maps toe. Weigeren gebruikt alleen functionele cookies.</p>',
      '  </div>',
      '  <div class="cookieToestemmingActies">',
      '    <button id="cookieToestemmingVolledig" class="cookieToestemmingKnop cookieToestemmingVolledig" type="button" aria-label="Volledig: alle cookies toestaan">Volledig</button>',
      '    <button id="cookieToestemmingWeigeren" class="cookieToestemmingKnop cookieToestemmingWeigeren" type="button" aria-label="Weigeren: alleen functionele opslag toestaan">Weigeren</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(consentLayer);
    document.getElementById('cookieToestemmingVolledig').addEventListener('click', chooseFullConsent);
    document.getElementById('cookieToestemmingWeigeren').addEventListener('click', chooseFunctionalOnly);

    consentLayer.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && currentChoice) {
        closeConsentLayer();
        preferencesButton.focus({ preventScroll: true });
      }
    });
  }

  function createPreferencesButton() {
    preferencesButton = document.createElement('button');
    preferencesButton.className = 'cookieVoorkeurenKnop';
    preferencesButton.type = 'button';
    preferencesButton.textContent = 'Cookievoorkeuren';
    preferencesButton.addEventListener('click', () => showConsentLayer(true));

    const copyright = document.querySelector('.footerCopyright');
    if (copyright) {
      copyright.insertAdjacentElement('beforebegin', preferencesButton);
    } else {
      document.body.appendChild(preferencesButton);
    }
  }

  function initializeCookieConsent() {
    createPreferencesButton();
    createConsentLayer();

    if (currentChoice === CHOICE_FULL) {
      loadGoogleAnalytics();
      updateGoogleMaps(true);
      return;
    }

    disableGoogleAnalytics();
    updateGoogleMaps(false);
    if (!currentChoice) showConsentLayer(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCookieConsent, { once: true });
  } else {
    initializeCookieConsent();
  }
})();
