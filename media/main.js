/**
 * @author Ali Gençay
 * https://github.com/gencay/chinamobile-codehelper
 *
 * @license
 * Copyright (c) 2022 - Present, Ali Gençay
 *
 * All rights reserved. Code licensed under the ISC license
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

// @ts-nocheck

(function () {
    const vscode = acquireVsCodeApi();

    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function (code, _lang) {
            return hljs.highlightAuto(code).value;
        },
        langPrefix: 'hljs language-',
        pedantic: false,
        gfm: true,
        breaks: true,
        sanitize: false,
        smartypants: false,
        xhtml: false
    });

    // const aiSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-5 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"></path></svg>`;
    const aiSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="14px" height="14px" viewBox="0 0 14 14" version="1.1">
<defs>
<filter id="alpha" filterUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
  <feColorMatrix type="matrix" in="SourceGraphic" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/>
</filter>
<mask id="mask0">
  <g filter="url(#alpha)">
<rect x="0" y="0" width="14" height="14" style="fill:rgb(0%,0%,0%);fill-opacity:0.717647;stroke:none;"/>
  </g>
</mask>
<clipPath id="clip1">
  <rect x="0" y="0" width="14" height="14"/>
</clipPath>
<g id="surface5" clip-path="url(#clip1)">
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(0%,55.294118%,83.137255%);fill-opacity:1;" d="M 5.03125 -0.21875 C 6.199219 -0.21875 7.363281 -0.21875 8.53125 -0.21875 C 10.46875 1.304688 12.21875 3.054688 13.78125 5.03125 C 13.78125 5.46875 13.78125 5.90625 13.78125 6.34375 C 13.636719 6.34375 13.488281 6.34375 13.34375 6.34375 C 13.050781 6.34375 12.90625 6.199219 12.90625 5.90625 C 13.488281 5.761719 13.488281 5.613281 12.90625 5.46875 C 12.90625 5.175781 12.761719 5.03125 12.46875 5.03125 C 12.46875 4.738281 12.324219 4.59375 12.03125 4.59375 C 12.03125 4.300781 11.886719 4.15625 11.59375 4.15625 C 11.59375 3.863281 11.449219 3.71875 11.15625 3.71875 C 11.15625 3.425781 11.011719 3.28125 10.71875 3.28125 C 10.71875 2.988281 10.574219 2.84375 10.28125 2.84375 C 10.28125 2.550781 10.136719 2.40625 9.84375 2.40625 C 9.84375 2.113281 9.699219 1.96875 9.40625 1.96875 C 9.257812 1.601562 8.964844 1.457031 8.53125 1.53125 C 7.898438 1.042969 7.167969 0.972656 6.34375 1.3125 C 4.644531 2.667969 2.894531 3.90625 1.09375 5.03125 C 1.09375 4.738281 0.949219 4.59375 0.65625 4.59375 C 0.609375 4.324219 0.460938 4.105469 0.21875 3.9375 C 1.90625 2.609375 3.511719 1.226562 5.03125 -0.21875 Z M 5.03125 -0.21875 "/>
</g>
<mask id="mask1">
  <g filter="url(#alpha)">
<rect x="0" y="0" width="14" height="14" style="fill:rgb(0%,0%,0%);fill-opacity:0.831373;stroke:none;"/>
  </g>
</mask>
<clipPath id="clip2">
  <rect x="0" y="0" width="14" height="14"/>
</clipPath>
<g id="surface8" clip-path="url(#clip2)">
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(0.392157%,54.901961%,84.313725%);fill-opacity:1;" d="M 8.53125 1.53125 C 8.679688 1.898438 8.972656 2.042969 9.40625 1.96875 C 9.699219 1.96875 9.84375 2.113281 9.84375 2.40625 C 10.136719 2.40625 10.28125 2.550781 10.28125 2.84375 C 10.574219 2.84375 10.71875 2.988281 10.71875 3.28125 C 10.71875 3.425781 10.71875 3.574219 10.71875 3.71875 C 10.425781 3.71875 10.136719 3.71875 9.84375 3.71875 C 9.128906 3.40625 8.398438 3.332031 7.65625 3.5 C 6.125 4.667969 4.667969 5.90625 3.28125 7.21875 C 3.28125 6.925781 3.136719 6.78125 2.84375 6.78125 C 2.84375 6.488281 2.699219 6.34375 2.40625 6.34375 C 2.40625 6.050781 2.261719 5.90625 1.96875 5.90625 C 3.328125 4.769531 4.640625 3.527344 5.90625 2.1875 C 6.714844 1.695312 7.589844 1.476562 8.53125 1.53125 Z M 8.53125 1.53125 "/>
</g>
<mask id="mask2">
  <g filter="url(#alpha)">
<rect x="0" y="0" width="14" height="14" style="fill:rgb(0%,0%,0%);fill-opacity:0.984314;stroke:none;"/>
  </g>
</mask>
<clipPath id="clip3">
  <rect x="0" y="0" width="14" height="14"/>
</clipPath>
<g id="surface11" clip-path="url(#clip3)">
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(56.078431%,78.039216%,23.137255%);fill-opacity:1;" d="M 9.84375 4.15625 C 9.84375 4.300781 9.84375 4.449219 9.84375 4.59375 C 9.84375 5.03125 9.84375 5.46875 9.84375 5.90625 C 8.113281 7.125 6.433594 8.4375 4.8125 9.84375 C 4.519531 9.515625 4.15625 9.367188 3.71875 9.40625 C 3.71875 9.113281 3.574219 8.96875 3.28125 8.96875 C 3.28125 8.824219 3.28125 8.675781 3.28125 8.53125 C 3.574219 8.238281 3.863281 7.949219 4.15625 7.65625 C 5.378906 6.652344 6.546875 5.558594 7.65625 4.375 C 8.371094 4.160156 9.101562 4.085938 9.84375 4.15625 Z M 9.84375 4.15625 "/>
</g>
<mask id="mask3">
  <g filter="url(#alpha)">
<rect x="0" y="0" width="14" height="14" style="fill:rgb(0%,0%,0%);fill-opacity:0.572549;stroke:none;"/>
  </g>
</mask>
<clipPath id="clip4">
  <rect x="0" y="0" width="14" height="14"/>
</clipPath>
<g id="surface14" clip-path="url(#clip4)">
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(63.137255%,80.784314%,16.078431%);fill-opacity:1;" d="M -0.21875 4.59375 C 0.0742188 4.59375 0.363281 4.59375 0.65625 4.59375 C 0.949219 4.59375 1.09375 4.738281 1.09375 5.03125 C 1.238281 5.46875 1.53125 5.761719 1.96875 5.90625 C 2.261719 5.90625 2.40625 6.050781 2.40625 6.34375 C 2.699219 6.34375 2.84375 6.488281 2.84375 6.78125 C 3.136719 6.78125 3.28125 6.925781 3.28125 7.21875 C 3.429688 7.585938 3.722656 7.730469 4.15625 7.65625 C 3.863281 7.949219 3.574219 8.238281 3.28125 8.53125 C 3.136719 8.53125 2.988281 8.53125 2.84375 8.53125 C 2.84375 8.238281 2.699219 8.09375 2.40625 8.09375 C 2.40625 7.800781 2.261719 7.65625 1.96875 7.65625 C 1.96875 7.363281 1.824219 7.21875 1.53125 7.21875 C 1.53125 6.925781 1.386719 6.78125 1.09375 6.78125 C 1.09375 6.488281 0.949219 6.34375 0.65625 6.34375 C 0.65625 6.050781 0.511719 5.90625 0.21875 5.90625 C 0.21875 5.613281 0.0742188 5.46875 -0.21875 5.46875 C -0.21875 5.175781 -0.21875 4.886719 -0.21875 4.59375 Z M -0.21875 4.59375 "/>
</g>
<mask id="mask4">
  <g filter="url(#alpha)">
<rect x="0" y="0" width="14" height="14" style="fill:rgb(0%,0%,0%);fill-opacity:0.701961;stroke:none;"/>
  </g>
</mask>
<clipPath id="clip5">
  <rect x="0" y="0" width="14" height="14"/>
</clipPath>
<g id="surface17" clip-path="url(#clip5)">
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(0%,55.294118%,83.529412%);fill-opacity:1;" d="M -0.21875 5.90625 C -0.0742188 5.90625 0.0742188 5.90625 0.21875 5.90625 C 0.511719 5.90625 0.65625 6.050781 0.65625 6.34375 C 0.65625 6.488281 0.65625 6.636719 0.65625 6.78125 C 0.65625 7.074219 0.65625 7.363281 0.65625 7.65625 C 0.0742188 7.800781 0.0742188 7.949219 0.65625 8.09375 C 0.65625 8.386719 0.800781 8.53125 1.09375 8.53125 C 1.09375 8.824219 1.238281 8.96875 1.53125 8.96875 C 1.53125 9.261719 1.675781 9.40625 1.96875 9.40625 C 1.96875 9.699219 2.113281 9.84375 2.40625 9.84375 C 2.40625 10.136719 2.550781 10.28125 2.84375 10.28125 C 2.84375 10.574219 2.988281 10.71875 3.28125 10.71875 C 3.28125 11.011719 3.425781 11.15625 3.71875 11.15625 C 3.71875 11.449219 3.863281 11.59375 4.15625 11.59375 C 4.304688 11.960938 4.597656 12.105469 5.03125 12.03125 C 5.761719 12.613281 6.488281 12.613281 7.21875 12.03125 C 9.085938 11.035156 10.835938 9.871094 12.46875 8.53125 C 12.46875 8.824219 12.613281 8.96875 12.90625 8.96875 C 13.039062 9.253906 13.183594 9.542969 13.34375 9.84375 C 11.847656 11.34375 10.242188 12.65625 8.53125 13.78125 C 7.363281 13.78125 6.199219 13.78125 5.03125 13.78125 C 2.84375 12.46875 1.09375 10.71875 -0.21875 8.53125 C -0.21875 7.65625 -0.21875 6.78125 -0.21875 5.90625 Z M -0.21875 5.90625 "/>
</g>
<mask id="mask5">
  <g filter="url(#alpha)">
<rect x="0" y="0" width="14" height="14" style="fill:rgb(0%,0%,0%);fill-opacity:0.815686;stroke:none;"/>
  </g>
</mask>
<clipPath id="clip6">
  <rect x="0" y="0" width="14" height="14"/>
</clipPath>
<g id="surface20" clip-path="url(#clip6)">
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(0.392157%,54.901961%,84.313725%);fill-opacity:1;" d="M 10.28125 6.34375 C 10.28125 6.636719 10.425781 6.78125 10.71875 6.78125 C 10.71875 7.074219 10.863281 7.21875 11.15625 7.21875 C 11.15625 7.511719 11.300781 7.65625 11.59375 7.65625 C 10.269531 9.273438 8.8125 10.730469 7.21875 12.03125 C 6.488281 12.03125 5.761719 12.03125 5.03125 12.03125 C 4.882812 11.664062 4.589844 11.519531 4.15625 11.59375 C 3.863281 11.59375 3.71875 11.449219 3.71875 11.15625 C 3.425781 11.15625 3.28125 11.011719 3.28125 10.71875 C 3.28125 10.574219 3.28125 10.425781 3.28125 10.28125 C 3.574219 10.28125 3.863281 10.28125 4.15625 10.28125 C 5.097656 10.335938 5.972656 10.117188 6.78125 9.625 C 7.890625 8.441406 9.058594 7.347656 10.28125 6.34375 Z M 10.28125 6.34375 "/>
</g>
</defs>
<g id="surface1">
<use xlink:href="#surface5" mask="url(#mask0)"/>
<use xlink:href="#surface8" mask="url(#mask1)"/>
<use xlink:href="#surface11" mask="url(#mask2)"/>
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(1.568627%,52.941176%,89.411765%);fill-opacity:1;" d="M 9.84375 4.15625 C 9.84375 4.011719 9.84375 3.863281 9.84375 3.71875 C 10.136719 3.71875 10.425781 3.71875 10.71875 3.71875 C 10.863281 3.71875 11.011719 3.71875 11.15625 3.71875 C 11.449219 3.71875 11.59375 3.863281 11.59375 4.15625 C 11.886719 4.15625 12.03125 4.300781 12.03125 4.59375 C 12.324219 4.59375 12.46875 4.738281 12.46875 5.03125 C 12.761719 5.03125 12.90625 5.175781 12.90625 5.46875 C 12.90625 5.613281 12.90625 5.761719 12.90625 5.90625 C 12.90625 6.199219 13.050781 6.34375 13.34375 6.34375 C 13.34375 6.636719 13.488281 6.78125 13.78125 6.78125 C 13.78125 7.074219 13.78125 7.363281 13.78125 7.65625 C 13.636719 7.65625 13.488281 7.65625 13.34375 7.65625 C 13.34375 7.363281 13.199219 7.21875 12.90625 7.21875 C 12.90625 6.925781 12.761719 6.78125 12.46875 6.78125 C 12.46875 6.488281 12.324219 6.34375 12.03125 6.34375 C 12.03125 6.050781 11.886719 5.90625 11.59375 5.90625 C 11.59375 5.613281 11.449219 5.46875 11.15625 5.46875 C 11.15625 5.175781 11.011719 5.03125 10.71875 5.03125 C 10.71875 4.738281 10.574219 4.59375 10.28125 4.59375 C 10.28125 4.300781 10.136719 4.15625 9.84375 4.15625 Z M 9.84375 4.15625 "/>
<use xlink:href="#surface14" mask="url(#mask3)"/>
<use xlink:href="#surface17" mask="url(#mask4)"/>
<use xlink:href="#surface20" mask="url(#mask5)"/>
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(63.137255%,80.784314%,16.078431%);fill-opacity:1;" d="M 9.84375 4.59375 C 9.988281 4.59375 10.136719 4.59375 10.28125 4.59375 C 10.574219 4.59375 10.71875 4.738281 10.71875 5.03125 C 11.011719 5.03125 11.15625 5.175781 11.15625 5.46875 C 11.449219 5.46875 11.59375 5.613281 11.59375 5.90625 C 11.886719 5.90625 12.03125 6.050781 12.03125 6.34375 C 12.324219 6.34375 12.46875 6.488281 12.46875 6.78125 C 12.761719 6.78125 12.90625 6.925781 12.90625 7.21875 C 13.199219 7.21875 13.34375 7.363281 13.34375 7.65625 C 13.34375 7.949219 13.488281 8.09375 13.78125 8.09375 C 13.78125 8.386719 13.78125 8.675781 13.78125 8.96875 C 13.488281 8.96875 13.199219 8.96875 12.90625 8.96875 C 12.613281 8.96875 12.46875 8.824219 12.46875 8.53125 C 12.324219 8.09375 12.03125 7.800781 11.59375 7.65625 C 11.300781 7.65625 11.15625 7.511719 11.15625 7.21875 C 10.863281 7.21875 10.71875 7.074219 10.71875 6.78125 C 10.425781 6.78125 10.28125 6.636719 10.28125 6.34375 C 10.28125 6.050781 10.136719 5.90625 9.84375 5.90625 C 9.84375 5.46875 9.84375 5.03125 9.84375 4.59375 Z M 9.84375 4.59375 "/>
<path style=" stroke:none;fill-rule:evenodd;fill:rgb(1.176471%,53.72549%,88.235294%);fill-opacity:1;" d="M 0.65625 6.78125 C 0.800781 6.78125 0.949219 6.78125 1.09375 6.78125 C 1.386719 6.78125 1.53125 6.925781 1.53125 7.21875 C 1.824219 7.21875 1.96875 7.363281 1.96875 7.65625 C 2.261719 7.65625 2.40625 7.800781 2.40625 8.09375 C 2.699219 8.09375 2.84375 8.238281 2.84375 8.53125 C 2.84375 8.824219 2.988281 8.96875 3.28125 8.96875 C 3.574219 8.96875 3.71875 9.113281 3.71875 9.40625 C 3.863281 9.699219 4.011719 9.988281 4.15625 10.28125 C 3.863281 10.28125 3.574219 10.28125 3.28125 10.28125 C 3.136719 10.28125 2.988281 10.28125 2.84375 10.28125 C 2.550781 10.28125 2.40625 10.136719 2.40625 9.84375 C 2.113281 9.84375 1.96875 9.699219 1.96875 9.40625 C 1.675781 9.40625 1.53125 9.261719 1.53125 8.96875 C 1.238281 8.96875 1.09375 8.824219 1.09375 8.53125 C 0.800781 8.53125 0.65625 8.386719 0.65625 8.09375 C 0.65625 7.949219 0.65625 7.800781 0.65625 7.65625 C 0.65625 7.363281 0.65625 7.074219 0.65625 6.78125 Z M 0.65625 6.78125 "/>
</g>
</svg>`;
    const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-5 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;

    const clipboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>`;

    const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;

    const cancelSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;

    const sendSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>`;

    const pencilSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="2" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`;

    const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`;

    const insertSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>`;

    const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" data-license="isc-gnc" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" ><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

    const closeSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;

    const refreshSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>`;

    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event) => {
        const message = event.data;
        const list = document.getElementById("qa-list");

        switch (message.type) {
            case "showInProgress":
                if (message.showStopButton) {
                    document.getElementById("stop-button").classList.remove("hidden");
                } else {
                    document.getElementById("stop-button").classList.add("hidden");
                }

                if (message.inProgress) {
                    document.getElementById("in-progress").classList.remove("hidden");
                    document.getElementById("question-input").setAttribute("disabled", true);
                    document.getElementById("question-input-buttons").classList.add("hidden");
                } else {
                    document.getElementById("in-progress").classList.add("hidden");
                    document.getElementById("question-input").removeAttribute("disabled");
                    document.getElementById("question-input-buttons").classList.remove("hidden");
                }
                break;
            case "addQuestion":
                list.classList.remove("hidden");
                document.getElementById("introduction")?.classList?.add("hidden");
                document.getElementById("conversation-list").classList.add("hidden");

                const escapeHtml = (unsafe) => {
                    return unsafe.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#039;', "'");
                };

                list.innerHTML +=
                    `<div class="p-4 self-end mt-4 question-element-ext relative input-background">
                        <h2 class="mb-5 flex" data-license="isc-gnc">${userSvg}用户</h2>
                        <no-export class="mb-2 flex items-center" data-license="isc-gnc">
                            <button title="Edit and resend this prompt" class="resend-element-ext p-1.5 flex items-center rounded-lg absolute right-6 top-6">${pencilSvg}</button>
                            <div class="hidden send-cancel-elements-ext flex gap-2">
                                <button title="Send this prompt" class="send-element-ext p-1 pr-2 flex items-center">${sendSvg}&nbsp;发送</button>
                                <button title="Cancel" class="cancel-element-ext p-1 pr-2 flex items-center">${cancelSvg}&nbsp;取消</button>
                            </div>
                        </no-export>
                        <div class="overflow-y-auto">${escapeHtml(message.value)}</div>
                    </div>`;

                if (message.autoScroll) {
                    list.lastChild?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
                }
                break;
            case "addResponse":
                let existingMessage = message.rawId && document.getElementById(message.id);
                let updatedValue = "";

                const unEscapeHtml = (unsafe) => {
                    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
                };

                if (!message.responseInMarkdown) {
                    updatedValue = "```\r\n" + unEscapeHtml(message.value) + " \r\n ```";
                } else {
                    updatedValue = message.value.split("```").length % 2 === 1 ? message.value : message.value + "\n\n```\n\n";
                }

                const markedResponse = marked.parse(updatedValue);

                if (existingMessage) {
                    existingMessage.innerHTML = markedResponse;
                } else {
                    list.innerHTML +=
                        `<div data-license="isc-gnc" class="p-4 self-end mt-4 pb-8 answer-element-ext">
                        <h2 class="mb-5 flex"><span style="position:relative;top: 2px">${aiSvg}</span><span style="position:relative;left: 6px">中国移动编码助手</span></h2>
                        <div class="result-streaming" id="${message.id}">${markedResponse}</div>
                    </div>`;
                }

                if (message.done) {
                    const preCodeList = list.lastChild.querySelectorAll("pre > code");

                    preCodeList.forEach((preCode) => {
                        preCode.classList.add("input-background", "p-4", "pb-2", "block", "whitespace-pre", "overflow-x-scroll");
                        preCode.parentElement.classList.add("pre-code-element", "relative");

                        const buttonWrapper = document.createElement("no-export");
                        buttonWrapper.classList.add("code-actions-wrapper", "flex", "gap-3", "pr-2", "pt-1", "pb-1", "flex-wrap", "items-center", "justify-end", "rounded-t-lg", "input-background");

                        // Create copy to clipboard button
                        const copyButton = document.createElement("button");
                        copyButton.title = "Copy to clipboard";
                        copyButton.innerHTML = `${clipboardSvg} Copy`;

                        copyButton.classList.add("code-element-ext", "p-1", "pr-2", "flex", "items-center", "rounded-lg");

                        const insert = document.createElement("button");
                        insert.title = "Insert the below code to the current file";
                        insert.innerHTML = `${insertSvg} Insert`;

                        insert.classList.add("edit-element-ext", "p-1", "pr-2", "flex", "items-center", "rounded-lg");

                        const newTab = document.createElement("button");
                        newTab.title = "Create a new file with the below code";
                        newTab.innerHTML = `${plusSvg} New`;

                        newTab.classList.add("new-code-element-ext", "p-1", "pr-2", "flex", "items-center", "rounded-lg");

                        buttonWrapper.append(copyButton, insert, newTab);

                        if (preCode.parentNode.previousSibling) {
                            preCode.parentNode.parentElement.insertAfter(buttonWrapper, preCode.parentElement.previousSibling);
                        } else {
                            preCode.parentNode.parentElement.append(buttonWrapper);
                        }
                    });

                    existingMessage = document.getElementById(message.id);
                    existingMessage.classList.remove("result-streaming");
                }

                if (message.autoScroll && (message.done || markedResponse.endsWith("\n"))) {
                    list.lastChild?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
                }

                break;
            case "addError":
                const messageValue = message.value || "An error occurred. If this issue persists please clear your session token with `ChatGPT: Reset session` command and/or restart your Visual Studio Code. If you still experience issues, it may be due to outage on https://openai.com services.";

                list.innerHTML +=
                    `<div class="p-4 self-end mt-4 pb-8 error-element-ext" data-license="isc-gnc">
                        <h2 class="mb-5 flex">${aiSvg}中国移动编码助手</h2>
                        <div class="text-red-400">${marked.parse(messageValue)}</div>
                    </div>`;

                if (message.autoScroll) {
                    list.lastChild?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
                }
                break;
            case "clearConversation":
                clearConversation();
                break;
            case "exportConversation":
                exportConversation();
                break;
            case "loginSuccessful":
                document.getElementById("login-button")?.classList?.add("hidden");
                if (message.showConversations) {
                    document.getElementById("list-conversations-link")?.classList?.remove("hidden");
                }
                break;
            default:
                break;
        }
    });

    const addFreeTextQuestion = () => {
        const input = document.getElementById("question-input");
        if (input.value?.length > 0) {
            vscode.postMessage({
                type: "addFreeTextQuestion",
                value: input.value,
            });

            input.value = "";
        }
    };

    const clearConversation = () => {
        document.getElementById("qa-list").innerHTML = "";

        document.getElementById("introduction")?.classList?.remove("hidden");

        vscode.postMessage({
            type: "clearConversation"
        });

    };

    const exportConversation = () => {
        const turndownService = new TurndownService({ codeBlockStyle: "fenced" });
        turndownService.remove('no-export');
        let markdown = turndownService.turndown(document.getElementById("qa-list"));

        vscode.postMessage({
            type: "openNew",
            value: markdown,
            language: "markdown"
        });
    };

    document.getElementById('question-input').addEventListener("keydown", function (event) {
        if (event.key == "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            addFreeTextQuestion();
        }
    });

    document.addEventListener("click", (e) => {
        const targetButton = e.target.closest('button');

        if (targetButton?.id === "more-button") {
            e.preventDefault();
            document.getElementById('chat-button-wrapper')?.classList.toggle("hidden");

            return;
        } else {
            document.getElementById('chat-button-wrapper')?.classList.add("hidden");
        }

        if (e.target?.id === "settings-button") {
            e.preventDefault();
            vscode.postMessage({
                type: "openSettings",
            });
            return;
        }

        if (e.target?.id === "settings-prompt-button") {
            e.preventDefault();
            vscode.postMessage({
                type: "openSettingsPrompt",
            });
            return;
        }

        if (targetButton?.id === "login-button") {
            e.preventDefault();
            vscode.postMessage({
                type: "login",
            });
            return;
        }

        if (targetButton?.id === "ask-button") {
            e.preventDefault();
            addFreeTextQuestion();
            return;
        }

        if (targetButton?.id === "clear-button") {
            e.preventDefault();
            clearConversation();
            return;
        }

        if (targetButton?.id === "export-button") {
            e.preventDefault();
            exportConversation();
            return;
        }

        if (targetButton?.id === "stop-button") {
            e.preventDefault();
            vscode.postMessage({
                type: "stopGenerating",
            });

            return;
        }

        if (targetButton?.classList?.contains("resend-element-ext")) {
            e.preventDefault();
            const question = targetButton.closest(".question-element-ext");
            const elements = targetButton.nextElementSibling;
            elements.classList.remove("hidden");
            question.lastElementChild?.setAttribute("contenteditable", true);

            targetButton.classList.add("hidden");

            return;
        }

        if (targetButton?.classList?.contains("send-element-ext")) {
            e.preventDefault();

            const question = targetButton.closest(".question-element-ext");
            const elements = targetButton.closest(".send-cancel-elements-ext");
            const resendElement = targetButton.parentElement.parentElement.firstElementChild;
            elements.classList.add("hidden");
            resendElement.classList.remove("hidden");
            question.lastElementChild?.setAttribute("contenteditable", false);

            if (question.lastElementChild.textContent?.length > 0) {
                vscode.postMessage({
                    type: "addFreeTextQuestion",
                    value: question.lastElementChild.textContent,
                });
            }
            return;
        }

        if (targetButton?.classList?.contains("cancel-element-ext")) {
            e.preventDefault();
            const question = targetButton.closest(".question-element-ext");
            const elements = targetButton.closest(".send-cancel-elements-ext");
            const resendElement = targetButton.parentElement.parentElement.firstElementChild;
            elements.classList.add("hidden");
            resendElement.classList.remove("hidden");
            question.lastElementChild?.setAttribute("contenteditable", false);
            return;
        }

        if (targetButton?.classList?.contains("code-element-ext")) {
            e.preventDefault();
            navigator.clipboard.writeText(targetButton.parentElement?.nextElementSibling?.lastChild?.textContent).then(() => {
                targetButton.innerHTML = `${checkSvg} Copied`;

                setTimeout(() => {
                    targetButton.innerHTML = `${clipboardSvg} Copy`;
                }, 1500);
            });

            return;
        }

        if (targetButton?.classList?.contains("edit-element-ext")) {
            e.preventDefault();
            vscode.postMessage({
                type: "editCode",
                value: targetButton.parentElement?.nextElementSibling?.lastChild?.textContent,
            });

            return;
        }

        if (targetButton?.classList?.contains("new-code-element-ext")) {
            e.preventDefault();
            vscode.postMessage({
                type: "openNew",
                value: targetButton.parentElement?.nextElementSibling?.lastChild?.textContent,
            });

            return;
        }
    });

})();
