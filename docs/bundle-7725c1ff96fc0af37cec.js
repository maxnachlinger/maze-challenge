!function(e){function n(n){for(var t,o,i=n[0],a=n[1],u=0,c=[];u<i.length;u++)o=i[u],Object.prototype.hasOwnProperty.call(r,o)&&r[o]&&c.push(r[o][0]),r[o]=0;for(t in a)Object.prototype.hasOwnProperty.call(a,t)&&(e[t]=a[t]);for(s&&s(n);c.length;)c.shift()()}var t={},r={0:0};var o={};var i={5:function(){return{"./maze_challenge_bg.js":{__wbg_random_f1dabdd9f148bad5:function(){return t[2].exports.c()},__wbg_floor_ecd9cd89028e4982:function(e){return t[2].exports.b(e)},__wbindgen_throw:function(e,n){return t[2].exports.d(e,n)}}}}};function a(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,a),r.l=!0,r.exports}a.e=function(e){var n=[],t=r[e];if(0!==t)if(t)n.push(t[2]);else{var u=new Promise((function(n,o){t=r[e]=[n,o]}));n.push(t[2]=u);var c,f=document.createElement("script");f.charset="utf-8",f.timeout=120,a.nc&&f.setAttribute("nonce",a.nc),f.src=function(e){return a.p+""+({}[e]||e)+"-7725c1ff96fc0af37cec.js"}(e);var s=new Error;c=function(n){f.onerror=f.onload=null,clearTimeout(l);var t=r[e];if(0!==t){if(t){var o=n&&("load"===n.type?"missing":n.type),i=n&&n.target&&n.target.src;s.message="Loading chunk "+e+" failed.\n("+o+": "+i+")",s.name="ChunkLoadError",s.type=o,s.request=i,t[1](s)}r[e]=void 0}};var l=setTimeout((function(){c({type:"timeout",target:f})}),12e4);f.onerror=f.onload=c,document.head.appendChild(f)}return({1:[5]}[e]||[]).forEach((function(e){var t=o[e];if(t)n.push(t);else{var r,u=i[e](),c=fetch(a.p+""+{5:"c3ed57e0bdea8b0307ad"}[e]+".module.wasm");if(u instanceof Promise&&"function"==typeof WebAssembly.compileStreaming)r=Promise.all([WebAssembly.compileStreaming(c),u]).then((function(e){return WebAssembly.instantiate(e[0],e[1])}));else if("function"==typeof WebAssembly.instantiateStreaming)r=WebAssembly.instantiateStreaming(c,u);else{r=c.then((function(e){return e.arrayBuffer()})).then((function(e){return WebAssembly.instantiate(e,u)}))}n.push(o[e]=r.then((function(n){return a.w[e]=(n.instance||n).exports})))}})),Promise.all(n)},a.m=e,a.c=t,a.d=function(e,n,t){a.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,n){if(1&n&&(e=a(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(a.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)a.d(t,r,function(n){return e[n]}.bind(null,r));return t},a.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(n,"a",n),n},a.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},a.p="",a.oe=function(e){throw console.error(e),e},a.w={};var u=window.webpackJsonp=window.webpackJsonp||[],c=u.push.bind(u);u.push=n,u=u.slice();for(var f=0;f<u.length;f++)n(u[f]);var s=c;a(a.s=0)}([function(e,n,t){t.e(1).then(t.bind(null,1)).then(({startUp:e})=>e()).catch(e=>console.error("Error importing `index.js`:",e))}]);