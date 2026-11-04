(function () {
  'use strict';
  // This is a public, write-only PostHog project token, not a personal API key.
  var token = 'phc_yrQK5ydNFUz7tWGv9fPHvqoTjqozNdeKeqNxHP2cJYpF';
  var diagnostics = window.PortfolioAnalyticsStatus = { sdk: 'loading', recording: false, last_error: null, build: '20261104-qa2' };
  var preference = 'portfolio-analytics-disabled';
  var privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  var disabled = privacySignal;
  try { disabled = disabled || localStorage.getItem(preference) === 'true'; } catch (_) {}
  var settings = document.getElementById('analyticsToggle');
  if (settings) {
    settings.textContent = disabled ? 'Turn on analytics in this browser' : 'Turn off analytics in this browser';
    settings.disabled = privacySignal;
    if (privacySignal) settings.textContent = 'Analytics disabled by your browser privacy signal';
    settings.addEventListener('click', function () {
      try { localStorage.setItem(preference, disabled ? 'false' : 'true');
        if (disabled) localStorage.setItem('portfolio-analytics-reenable','true');
      } catch (_) {}
      if (!disabled && window.posthog && window.posthog.opt_out_capturing) window.posthog.opt_out_capturing();
      location.reload();
    });
  }
  if (disabled) { diagnostics.sdk = privacySignal ? 'privacy-signal' : 'opted-out'; return; }
  var local = /^(localhost|127\.0\.0\.1|terminal\.local)$/.test(location.hostname);
  var environment = location.hostname === 'ibrahimjaved20.github.io' ? 'production' : local ? 'test' : 'demo';
  var page = location.pathname === '/' ? '/index.html' : location.pathname;
  function cleanURL(value) {
    try { var u = new URL(value, location.origin); return u.origin + u.pathname; } catch (_) { return ''; }
  }
  function scrub(event) {
    // Replay snapshots are masked by the recorder; do not rewrite their DOM schema.
    if (event.event === '$snapshot') return event;
    function clean(props) {
      Object.keys(props).forEach(function (key) {
        if (/url|referrer/i.test(key) && typeof props[key] === 'string') props[key] = cleanURL(props[key]);
        if (/search|query|email|question|answer|text/i.test(key) && !['chat_message','visitor_name','visitor_email','$name','$email'].includes(key)) delete props[key];
        else if (props[key] && typeof props[key] === 'object') clean(props[key]);
      });
    }
    clean(event.properties || {});
    return event;
  }
  // Official asynchronous snippet queue; only the methods used here are stubbed.
  var ph = window.posthog = window.posthog || [];
  if (!ph.__SV) {
    ph._i = [];
    ph.people = ph.people || [];
    ['capture', 'register', 'identify', 'setPersonProperties', 'startSessionRecording', 'opt_in_capturing', 'opt_out_capturing'].forEach(function (name) {
      ph[name] = function () { ph.push([name].concat([].slice.call(arguments))); };
    });
    ph._i.push([token, {
      api_host: 'https://us.i.posthog.com', ui_host: 'https://us.posthog.com', defaults: '2026-08-30',
      autocapture: false, capture_pageview: false, capture_pageleave: false,
      disable_session_recording: false, capture_heatmaps: false, capture_exceptions: false,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
        maskTextSelector: '',
        recordCrossOriginIframes: false,
        recordHeaders: false, recordBody: false,
        maskCapturedNetworkRequestFn: function (request) {
          if (request.name) request.name = cleanURL(request.name);
          return request;
        }
      },
      enable_recording_console_log: false,
      person_profiles: 'always', persistence: 'localStorage+cookie', before_send: scrub,
      loaded: function (client) {
        diagnostics.sdk = 'loaded';
        try {
          if (localStorage.getItem('portfolio-analytics-reenable') === 'true') {
            client.opt_in_capturing(); localStorage.removeItem('portfolio-analytics-reenable');
          }
        } catch (_) {}
        // Respect project recording rules and quotas; never force an override.
        client.startSessionRecording();
        diagnostics.recording = client.sessionRecordingStarted();
      },
      on_request_error: function (response) {
        diagnostics.last_error = 'PostHog request failed' + (response && response.statusCode ? ' (HTTP ' + response.statusCode + ')' : '');
      }
    }, 'posthog']);
    ph.__SV = 1;
    var sdk = document.createElement('script');
    sdk.async = true; sdk.crossOrigin = 'anonymous';
    sdk.src = 'https://us-assets.i.posthog.com/static/array.js';
    sdk.onerror = function () { diagnostics.sdk = 'blocked-or-unavailable'; diagnostics.last_error = 'Analytics SDK could not load; check blockers or network.'; };
    document.head.appendChild(sdk);
  }
  var userAgent = navigator.userAgent || '';
  var deviceType = /iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent) || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1) ? 'tablet' : /Mobi|iPhone|Android/i.test(userAgent) ? 'mobile' : 'desktop';
  var lastPointer = '';
  window.addEventListener('pointerdown', function (event) { lastPointer = event.pointerType || ''; }, { passive: true });
  window.addEventListener('keydown', function () { lastPointer = 'keyboard'; }, { passive: true });
  function track(event, properties, options) {
    window.posthog.capture(event, Object.assign({ page: page, environment: environment, analytics_version: '20261104-qa2', device_type: deviceType, viewport_width: window.innerWidth, viewport_height: window.innerHeight }, properties || {}), options);
  }
  ph.register({ environment: environment });
  track('$pageview', { $current_url: cleanURL(location.href), $referrer: cleanURL(document.referrer), $title: document.title });
  document.addEventListener('click', function (event) {
    var el = event.target.closest('a,button,summary');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var pointer = event.detail === 0 ? 'keyboard' : event.pointerType || lastPointer || 'unknown';
    track('element_click', {
      element_label: (el.getAttribute('data-analytics-label') || el.getAttribute('aria-label') || (el.closest('.portfolio-guide') ? el.id || el.tagName : el.textContent) || '').trim().slice(0,100),
      element_id: el.id || '', element_tag: el.tagName.toLowerCase(),
      pointer_type: pointer,
      destination: href.indexOf('mailto:') === 0 ? 'email' : href ? cleanURL(href) : '',
      placement: el.closest('.portfolio-guide') ? 'chatbot' : el.closest('footer') ? 'footer' : el.closest('nav') ? 'navigation' : 'content'
    });
    if (el.closest('.portfolio-guide')) return;
    if (el.id === 'resumePrint') return track('resume_print');
    if (el.hasAttribute('data-lens')) return track('illustration_changed', { lens: el.getAttribute('data-lens') });
    if (el.id === 'themeBtn' || el.id === 'resumeTheme') return track('theme_changed');
    if (!el.matches('a[href]')) return;
    var raw = el.getAttribute('href'), url;
    try { url = new URL(raw, location.href); } catch (_) { return; }
    var kind = raw.indexOf('mailto:') === 0 ? 'contact_click' : /\.pdf$/i.test(url.pathname) ? 'resume_download' : url.origin !== location.origin ? 'outbound_click' : /resume\.html$/.test(url.pathname) ? 'resume_open' : el.closest('.project-tile,.menu-project') || el.matches('.project-card') ? 'project_click' : 'navigation_click';
    track(kind, { destination: url.protocol === 'mailto:' ? 'email' : cleanURL(url.href), placement: el.closest('footer') ? 'footer' : el.closest('nav') ? 'navigation' : 'content' });
  });
  // Count activity only while the tab is visible and the visitor is recently active.
  var lastActivity = performance.now(), lastTick = lastActivity, seconds = 0, sectionSeconds = {}, activeSection = '';
  ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'].forEach(function (name) {
    window.addEventListener(name, function () { lastActivity = performance.now(); }, { passive: true });
  });
  function tick() {
    var now = performance.now(), elapsed = Math.min((now - lastTick) / 1000, 5);
    lastTick = now;
    if (document.visibilityState === 'hidden' || now - lastActivity > 30000) return;
    seconds += elapsed;
    if (activeSection) sectionSeconds[activeSection] = (sectionSeconds[activeSection] || 0) + elapsed;
  }
  function flush(exit) {
    tick();
    if (seconds < 1) return;
    var times = {};
    Object.keys(sectionSeconds).forEach(function (key) { times[key] = Math.round(sectionSeconds[key]); });
    track('page_engagement', { active_seconds: Math.round(seconds), section_seconds: times }, exit ? { transport: 'sendBeacon' } : undefined);
    seconds = 0; sectionSeconds = {};
  }
  setInterval(tick, 5000);
  setInterval(function () { flush(false); }, 30000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(true); else lastTick = performance.now(); });
  window.addEventListener('pagehide', function () { flush(true); });
  var depths = new Set();
  function scrollDepth() {
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var percent = height > 0 ? Math.min(100, Math.round(window.scrollY / height * 100)) : 100;
    [25, 50, 75, 100].forEach(function (depth) { if (percent >= depth && !depths.has(depth)) { depths.add(depth); track('scroll_depth', { percent: depth }); } });
  }
  window.addEventListener('scroll', scrollDepth, { passive: true });
  if ('IntersectionObserver' in window) {
    var seen = new Set(), visible = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var key = entry.target.dataset.analyticsSection;
        if (entry.isIntersecting) {
          visible.set(key, entry.intersectionRatio);
          if (!seen.has(key)) { seen.add(key); track('section_view', { section: key }); }
        } else visible.delete(key);
      });
      tick(); activeSection = Array.from(visible.entries()).sort(function (a,b) { return b[1] - a[1]; })[0]?.[0] || '';
    }, { threshold: [0, 0.1, 0.3, 0.6] });
    document.querySelectorAll('main > section, main > .wrap > section, .resume > section').forEach(function (section, index) {
      section.dataset.analyticsSection = section.id || section.classList[0] || 'section-' + (index + 1);
      observer.observe(section);
    });
  }
  // Chat content is explicitly collected after the in-chat notice; automatic capture stays off.
  window.PortfolioAnalytics = {
    status: function () {
      var client = window.posthog;
      diagnostics.recording = !!(client && client.sessionRecordingStarted && client.sessionRecordingStarted());
      return Object.assign({}, diagnostics, {session_id: client && client.get_session_id ? client.get_session_id() : null});
    },
    verify: function (callback) {
      if (!window.posthog || !window.posthog.__loaded) { callback({ok:false,message:'SDK has not loaded yet.'}); return; }
      fetch('https://us.i.posthog.com/i/v0/e/', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({api_key: token, event:'portfolio_qa_check', distinct_id:window.posthog.get_distinct_id(),
          properties:{environment:environment,build:diagnostics.build,$session_id:window.posthog.get_session_id(),$current_url:cleanURL(location.href)}})
      }).then(function(response){callback({ok:response.ok,status:response.status});})
        .catch(function(){callback({ok:false,message:'Ingestion request blocked or unavailable.'});});

    },
    identify: function (name, email) {
      name = String(name || '').trim().slice(0,100);
      email = String(email || '').trim().toLowerCase().slice(0,254);
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        ph.identify(email, { visitor_name: name, visitor_email: email, $name: name || undefined, $email: email });
      } else if (name) {
        ph.setPersonProperties({ visitor_name: name, $name: name });
        track('chat_details_shared', { visitor_name: name });
      }
    },
    chat: function (event, mode, message) {
      if (['chat_opened','chat_question','chat_answer','chat_fallback'].indexOf(event) === -1) return;
      var properties = mode ? { mode: mode } : {};
      if ((event === 'chat_question' || event === 'chat_answer') && typeof message === 'string') properties.chat_message = message.slice(0,6000);
      track(event, properties);
    }
  };
})();
