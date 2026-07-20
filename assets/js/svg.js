// ============================================================================
//  svg.js — איורים מקוריים (SVG) של קו הרקיע של בודפשט.
//  נמנע משימוש בתמונות המוגנות בזכויות יוצרים; הכל מצויר ידנית.
// ============================================================================

/**
 * קו רקיע סטייליסטי של בודפשט: הפרלמנט, גשר השלשלאות, כיפת הבזיליקה, גבעות בודה.
 * @param {object} o
 * @param {number} [o.h=300] גובה viewBox
 * @param {boolean} [o.reflection=true] השתקפות בדנובה
 */
export function skyline(o = {}) {
  const reflection = o.reflection !== false;
  return `
<svg class="hero__sky" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" role="img" aria-label="קו הרקיע של בודפשט">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8dcac"/>
      <stop offset="0.45" stop-color="#eeb488"/>
      <stop offset="0.75" stop-color="#c98aa0"/>
      <stop offset="1" stop-color="#8a7fae"/>
    </linearGradient>
    <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7f86b0"/>
      <stop offset="1" stop-color="#5d6698"/>
    </linearGradient>
    <linearGradient id="bld" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5c4a63"/>
      <stop offset="1" stop-color="#3f3350"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="300" fill="url(#sky)"/>
  <circle cx="980" cy="96" r="52" fill="#fff2d6" opacity="0.85"/>
  <circle cx="980" cy="96" r="52" fill="#ffd98a" opacity="0.35"/>

  <!-- גבעות בודה מימין -->
  <path d="M1200 150 C1120 120 1060 140 1000 168 C980 176 940 176 900 186 L1200 186 Z" fill="#6b5a72" opacity="0.55"/>

  <!-- אגף מבנים -->
  <g fill="url(#bld)" opacity="0.92">
    <!-- בזיליקת סנט סטפן (כיפה) -->
    <rect x="150" y="150" width="120" height="60"/>
    <path d="M180 150 a30 30 0 0 1 60 0 Z"/>
    <rect x="206" y="96" width="8" height="26"/>
    <circle cx="210" cy="120" r="8"/>
    <!-- מבנים כלליים -->
    <rect x="70" y="168" width="60" height="42"/>
    <rect x="300" y="160" width="46" height="50"/>
    <rect x="352" y="172" width="40" height="38"/>

    <!-- הפרלמנט ההונגרי (הכיפה המרכזית + צריחים גותיים) -->
    <g transform="translate(470,70)">
      <rect x="0" y="72" width="230" height="70"/>
      <!-- כיפה מרכזית -->
      <path d="M92 72 a23 40 0 0 1 46 0 Z"/>
      <rect x="112" y="8" width="6" height="26"/>
      <circle cx="115" cy="32" r="7"/>
      <!-- צריחים -->
      <path d="M8 72 l10 -30 l10 30 Z"/>
      <path d="M40 72 l9 -22 l9 22 Z"/>
      <path d="M182 72 l9 -22 l9 22 Z"/>
      <path d="M212 72 l10 -30 l10 30 Z"/>
      <g fill="#3f3350"><rect x="4" y="92" width="222" height="6"/><rect x="4" y="108" width="222" height="6"/></g>
    </g>

    <!-- מבנים לכיוון מרכז -->
    <rect x="740" y="164" width="52" height="46"/>
    <rect x="798" y="150" width="40" height="60"/>
    <rect x="844" y="170" width="46" height="40"/>
  </g>

  <!-- גשר השלשלאות -->
  <g stroke="#4a3d55" stroke-width="4" fill="none" opacity="0.9">
    <path d="M700 176 q60 -70 120 0" />
    <path d="M820 176 q60 -70 120 0" />
    <line x1="700" y1="176" x2="940" y2="176"/>
    <rect x="756" y="120" width="8" height="56" fill="#4a3d55" stroke="none"/>
    <rect x="876" y="120" width="8" height="56" fill="#4a3d55" stroke="none"/>
  </g>

  <!-- הדנובה -->
  <rect x="0" y="210" width="1200" height="90" fill="url(#river)"/>
  ${reflection ? `<g opacity="0.22" fill="#2f2740">
    <rect x="470" y="212" width="230" height="34"/>
    <rect x="150" y="212" width="120" height="26"/>
  </g>` : ''}
  <g stroke="#ffffff" stroke-width="2" opacity="0.18">
    <line x1="120" y1="230" x2="360" y2="230"/>
    <line x1="520" y1="248" x2="820" y2="248"/>
    <line x1="900" y1="236" x2="1120" y2="236"/>
  </g>
</svg>`;
}
