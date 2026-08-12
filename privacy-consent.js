/* 閲覧状況の把握について — 同意を得てから計測する。
 *
 * 2026-08-12 設置。
 *
 * ## 方針
 *
 * 同意が取れるまで **計測用のスクリプトを一切読み込まない**。同意しない選択も
 * 記憶し、次からは尋ねない。判断はいつでも変えられる (プライバシーポリシーの
 * ボタンから)。
 *
 * 「読み込んでから同意を聞く」形にすると、拒否した人の分も既に送信されている。
 * そうならない順序にしてある。
 *
 * ## 設定
 *
 * GA_MEASUREMENT_ID に測定 ID (G-XXXXXXXXXX) を入れる。**空のままなら計測は
 * 一切行わない** (バナーも出ない)。ID を入れるまでは、このファイルを置いても
 * 何も起きない。
 */
(function () {
  'use strict';

  var GA_MEASUREMENT_ID = 'G-QEY2DNWRYK';   // blinkgtk.org。空にすれば計測もバナーも止まる

  var KEY = 'blinkgtk-analytics-consent';   // 'granted' / 'denied'
  var LANG = (document.documentElement.lang || 'ja').slice(0, 2);

  var T = {
    ja: {
      body: 'このサイトでは、どの資料が読まれているかを把握するために Cookie を使う計測を行いたいと考えています。個人を特定する情報は集めません。',
      ok: '同意する',
      no: '使わない',
      policy: 'プライバシーポリシー',
      policyHref: '/privacy-ja.html'
    },
    en: {
      body: 'We would like to measure which documents are read, using cookies. We do not collect information that identifies you.',
      ok: 'Allow',
      no: 'No thanks',
      policy: 'Privacy policy',
      policyHref: '/privacy-en.html'
    }
  };
  var t = T[LANG] || T.ja;

  /* 両サイトともドメイン直下なので絶対パスで参照する。docs/ の下 (深さ 1〜2) から
   * でも同じ 1 行で済み、階層の数え間違いが起きない。 */

  function loadAnalytics() {
    if (!GA_MEASUREMENT_ID) return;
    if (window.__blinkgtkAnalyticsLoaded) return;
    window.__blinkgtkAnalyticsLoaded = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    /* IP を丸める。既定でも行われるが、明示して意図を残す */
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function remember(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* 使えなくても進む */ }
  }
  function recalled() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function banner() {
    var box = document.createElement('div');
    box.id = 'blinkgtk-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', t.policy);
    box.style.cssText = [
      'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:9999',
      'padding:1rem 1.2rem', 'background:#1c1c1e', 'color:#f2f2f2',
      'font-size:.92rem', 'line-height:1.7',
      'box-shadow:0 -2px 12px rgba(0,0,0,.3)',
      'display:flex', 'flex-wrap:wrap', 'gap:.8rem 1.2rem',
      'align-items:center', 'justify-content:center'
    ].join(';');

    var msg = document.createElement('span');
    msg.textContent = t.body;
    msg.style.cssText = 'flex:1 1 22rem;max-width:46rem';

    function button(label, primary) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = [
        'padding:.45rem 1.1rem', 'border-radius:4px', 'cursor:pointer',
        'font-size:.92rem', 'white-space:nowrap',
        primary ? 'background:#4a8ef0' : 'background:transparent',
        primary ? 'color:#fff' : 'color:#f2f2f2',
        primary ? 'border:1px solid #4a8ef0' : 'border:1px solid #6b6b70'
      ].join(';');
      return b;
    }

    var yes = button(t.ok, true);
    var no = button(t.no, false);
    var link = document.createElement('a');
    link.href = t.policyHref;
    link.textContent = t.policy;
    link.style.cssText = 'color:#9dc3ff;white-space:nowrap';

    yes.addEventListener('click', function () {
      remember('granted'); box.remove(); loadAnalytics();
    });
    no.addEventListener('click', function () {
      remember('denied'); box.remove();
    });

    box.appendChild(msg);
    box.appendChild(yes);
    box.appendChild(no);
    box.appendChild(link);
    document.body.appendChild(box);
  }

  /* プライバシーポリシーから判断をやり直せるようにする */
  window.blinkgtkResetConsent = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* noop */ }
    location.reload();
  };

  function start() {
    if (!GA_MEASUREMENT_ID) return;          /* 未設定なら何もしない */
    var c = recalled();
    if (c === 'granted') { loadAnalytics(); return; }
    if (c === 'denied') { return; }
    banner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
