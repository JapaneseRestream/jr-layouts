!function(e){function t(t){for(var r,u,l=t[0],c=t[1],i=t[2],p=0,f=[];p<l.length;p++)u=l[p],o[u]&&f.push(o[u][0]),o[u]=0;for(r in c)Object.prototype.hasOwnProperty.call(c,r)&&(e[r]=c[r]);for(d&&d(t);f.length;)f.shift()();return a.push.apply(a,i||[]),n()}function n(){for(var e,t=0;t<a.length;t++){for(var n=a[t],r=!0,l=1;l<n.length;l++){var c=n[l];0!==o[c]&&(r=!1)}r&&(a.splice(t--,1),e=u(u.s=n[0]))}return e}var r={},o={2:0},a=[];function u(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,u),n.l=!0,n.exports}u.m=e,u.c=r,u.d=function(e,t,n){u.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},u.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.t=function(e,t){if(1&t&&(e=u(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(u.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)u.d(n,r,function(t){return e[t]}.bind(null,r));return n},u.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return u.d(t,"a",t),t},u.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},u.p="";var l=window.webpackJsonp=window.webpackJsonp||[],c=l.push.bind(l);l.push=t,l=l.slice();for(var i=0;i<l.length;i++)t(l[i]);var d=c;a.push([5548,0]),n()}({5548:function(e,t,n){"use strict";n.r(t);var r=n(18),o=n(5),a=n(0),u=n.n(a),l=n(16),c=n.n(l),i=n(19),d=n(17);const p=nodecg.Replicant("current-run"),f=i.a.div`
	margin: 8px;
	display: grid;
	grid-auto-flow: row;
	gap: 16px;
`,s=Object(r.createMuiTheme)({palette:{type:"dark"}});c.a.render(u.a.createElement(()=>{const[e,t]=Object(d.a)(p,null),[n,l]=Object(a.useState)(""),[c,i]=Object(a.useState)(""),[g,m]=Object(a.useState)("");return Object(a.useEffect)(()=>{const r=()=>{e&&(l(e.game),i(e.category),m(e.commentator))},o=()=>{e&&t({...e,game:n,category:c,commentator:g})};return document.addEventListener("dialog-opened",r),document.addEventListener("dialog-confirmed",o),()=>{document.removeEventListener("dialog-opened",r),document.removeEventListener("dialog-confirmed",o)}}),e?u.a.createElement(f,null,u.a.createElement(r.MuiThemeProvider,{theme:s},u.a.createElement(o.k,{label:"ゲーム",value:n,helperText:e.english,onChange:e=>{l(e.target.value)}}),u.a.createElement(o.k,{label:"カテゴリー",value:c,onChange:e=>{i(e.target.value)}}),u.a.createElement(o.k,{label:"解説",value:g,onChange:e=>{m(e.target.value)}}))):null},null),document.querySelector("#root"))}});
//# sourceMappingURL=edit-modal.f9174d49dfd8d69c096e.js.map