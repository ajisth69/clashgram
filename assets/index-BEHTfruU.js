const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./shared-components-DeyUOUr6.js","./rolldown-runtime-QTnfLwEv.js","./shared-components-BAvCcgHo.css","./dist-js-BFuJbw7t.js","./dist-js-DtFEljyc.js","./window-ttYlYFWR.js","./event-WGnj0wHc.js","./dist-js-DN3ZVlXi.js","./qr-code-styling-hwPyLIAV.js"])))=>i.map(i=>d[i]);
import{r as e,t}from"./rolldown-runtime-QTnfLwEv.js";import{Ag as n,Bi as r,Bl as i,Bp as a,C_ as o,Da as s,Dg as c,Dh as l,Di as u,Er as d,Fh as f,Fn as p,Fy as m,Gi as h,Gn as g,Gs as _,Gt as v,H_ as y,Hg as b,Hm as x,Ih as S,Iy as C,J as w,J_ as T,K as E,K_ as D,Kh as O,Lm as k,M_ as A,Mg as j,Mt as M,Nf as N,Nt as P,Or as F,P_ as ee,Pg as I,Pl as L,Rh as R,S_ as z,St as B,T_ as te,Tg as V,Tn as ne,Ts as re,Tt as ie,Us as ae,Vg as oe,Vv as se,W_ as ce,Wi as le,Wm as ue,X as de,Y_ as fe,Yf as pe,Yh as me,Zf as H,Zt as he,_g as ge,ag as _e,am as ve,an as ye,br as be,by as xe,ca as U,cg as Se,cn as Ce,cv as we,dg as Te,dp as Ee,dt as De,e_ as Oe,ft as ke,gp as Ae,gs as je,gv as Me,gy as Ne,hg as Pe,hv as Fe,hy as Ie,is as Le,j_ as Re,jg as ze,jh as Be,k_ as Ve,kg as W,kl as He,kr as Ue,lv as We,ma as Ge,mg as Ke,na as qe,oa as Je,og as Ye,om as Xe,on as Ze,p_ as Qe,pa as $e,pg as et,pn as tt,pt as nt,q_ as rt,qg as it,qh as at,ra as ot,rh as st,rm as ct,sn as lt,ta as ut,ti as dt,tv as ft,uf as pt,ug as G,uo as mt,up as ht,vg as K,vi as gt,vt as q,xa as _t,xt as vt,ya as yt,yg as J,yy as bt,zt as xt}from"./shared-components-DeyUOUr6.js";import{$ as St,Cr as Ct,Fr as wt,Nr as Tt,c as Et,dn as Dt,un as Ot}from"./reducers-BoAVhmHH.js";import{b as kt,i as At,t as jt,y as Mt}from"./ClashgramBadge-DFBk5JNQ.js";import{t as Nt}from"./usePrevious-Uxg5uoCa.js";import{n as Pt}from"./animatedAssets-CUW74yt0.js";import{D as Ft,T as It,_ as Lt,d as Rt,g as zt,h as Bt,n as Vt,t as Ht}from"./lock-B9IWqqGd.js";import{C as Ut,S as Wt,_ as Gt,a as Kt,c as qt,d as Jt,f as Yt,o as Xt,p as Zt,u as Qt,v as $t,y as en}from"./initial-CqrVPaO6.js";import{n as tn,t as nn}from"./clashgramSessionVault-CGjGl4js.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var rn=t((e=>{e.byteLength=c,e.toByteArray=u,e.fromByteArray=p;for(var t=[],n=[],r=typeof Uint8Array<`u`?Uint8Array:Array,i=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`,a=0,o=i.length;a<o;++a)t[a]=i[a],n[i.charCodeAt(a)]=a;n[45]=62,n[95]=63;function s(e){var t=e.length;if(t%4>0)throw Error(`Invalid string. Length must be a multiple of 4`);var n=e.indexOf(`=`);n===-1&&(n=t);var r=n===t?0:4-n%4;return[n,r]}function c(e){var t=s(e),n=t[0],r=t[1];return(n+r)*3/4-r}function l(e,t,n){return(t+n)*3/4-n}function u(e){var t,i=s(e),a=i[0],o=i[1],c=new r(l(e,a,o)),u=0,d=o>0?a-4:a,f;for(f=0;f<d;f+=4)t=n[e.charCodeAt(f)]<<18|n[e.charCodeAt(f+1)]<<12|n[e.charCodeAt(f+2)]<<6|n[e.charCodeAt(f+3)],c[u++]=t>>16&255,c[u++]=t>>8&255,c[u++]=t&255;return o===2&&(t=n[e.charCodeAt(f)]<<2|n[e.charCodeAt(f+1)]>>4,c[u++]=t&255),o===1&&(t=n[e.charCodeAt(f)]<<10|n[e.charCodeAt(f+1)]<<4|n[e.charCodeAt(f+2)]>>2,c[u++]=t>>8&255,c[u++]=t&255),c}function d(e){return t[e>>18&63]+t[e>>12&63]+t[e>>6&63]+t[e&63]}function f(e,t,n){for(var r,i=[],a=t;a<n;a+=3)r=(e[a]<<16&16711680)+(e[a+1]<<8&65280)+(e[a+2]&255),i.push(d(r));return i.join(``)}function p(e){for(var n,r=e.length,i=r%3,a=[],o=16383,s=0,c=r-i;s<c;s+=o)a.push(f(e,s,s+o>c?c:s+o));return i===1?(n=e[r-1],a.push(t[n>>2]+t[n<<4&63]+`==`)):i===2&&(n=(e[r-2]<<8)+e[r-1],a.push(t[n>>10]+t[n>>4&63]+t[n<<2&63]+`=`)),a.join(``)}})),an=t((e=>{e.read=function(e,t,n,r,i){var a,o,s=i*8-r-1,c=(1<<s)-1,l=c>>1,u=-7,d=n?i-1:0,f=n?-1:1,p=e[t+d];for(d+=f,a=p&(1<<-u)-1,p>>=-u,u+=s;u>0;a=a*256+e[t+d],d+=f,u-=8);for(o=a&(1<<-u)-1,a>>=-u,u+=r;u>0;o=o*256+e[t+d],d+=f,u-=8);if(a===0)a=1-l;else if(a===c)return o?NaN:(p?-1:1)*(1/0);else o+=2**r,a-=l;return(p?-1:1)*o*2**(a-r)},e.write=function(e,t,n,r,i,a){var o,s,c,l=a*8-i-1,u=(1<<l)-1,d=u>>1,f=i===23?2**-24-2**-77:0,p=r?0:a-1,m=r?1:-1,h=+(t<0||t===0&&1/t<0);for(t=Math.abs(t),isNaN(t)||t===1/0?(s=+!!isNaN(t),o=u):(o=Math.floor(Math.log(t)/Math.LN2),t*(c=2**-o)<1&&(o--,c*=2),o+d>=1?t+=f/c:t+=f*2**(1-d),t*c>=2&&(o++,c/=2),o+d>=u?(s=0,o=u):o+d>=1?(s=(t*c-1)*2**i,o+=d):(s=t*2**(d-1)*2**i,o=0));i>=8;e[n+p]=s&255,p+=m,s/=256,i-=8);for(o=o<<i|s,l+=i;l>0;e[n+p]=o&255,p+=m,o/=256,l-=8);e[n+p-m]|=h*128}})),on=t((e=>{var t=rn(),n=an(),r=typeof Symbol==`function`&&typeof Symbol.for==`function`?Symbol.for(`nodejs.util.inspect.custom`):null;e.Buffer=s,e.SlowBuffer=v,e.INSPECT_MAX_BYTES=50;var i=2147483647;e.kMaxLength=i,s.TYPED_ARRAY_SUPPORT=a(),!s.TYPED_ARRAY_SUPPORT&&typeof console<`u`&&typeof console.error==`function`&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function a(){try{let e=new Uint8Array(1),t={foo:function(){return 42}};return Object.setPrototypeOf(t,Uint8Array.prototype),Object.setPrototypeOf(e,t),e.foo()===42}catch{return!1}}Object.defineProperty(s.prototype,"parent",{enumerable:!0,get:function(){if(s.isBuffer(this))return this.buffer}}),Object.defineProperty(s.prototype,"offset",{enumerable:!0,get:function(){if(s.isBuffer(this))return this.byteOffset}});function o(e){if(e>i)throw RangeError(`The value "`+e+`" is invalid for option "size"`);let t=new Uint8Array(e);return Object.setPrototypeOf(t,s.prototype),t}function s(e,t,n){if(typeof e==`number`){if(typeof t==`string`)throw TypeError(`The "string" argument must be of type string. Received type number`);return d(e)}return c(e,t,n)}s.poolSize=8192;function c(e,t,n){if(typeof e==`string`)return f(e,t);if(ArrayBuffer.isView(e))return m(e);if(e==null)throw TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type `+typeof e);if(he(e,ArrayBuffer)||e&&he(e.buffer,ArrayBuffer)||typeof SharedArrayBuffer<`u`&&(he(e,SharedArrayBuffer)||e&&he(e.buffer,SharedArrayBuffer)))return h(e,t,n);if(typeof e==`number`)throw TypeError(`The "value" argument must not be of type number. Received type number`);let r=e.valueOf&&e.valueOf();if(r!=null&&r!==e)return s.from(r,t,n);let i=g(e);if(i)return i;if(typeof Symbol<`u`&&Symbol.toPrimitive!=null&&typeof e[Symbol.toPrimitive]==`function`)return s.from(e[Symbol.toPrimitive](`string`),t,n);throw TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type `+typeof e)}s.from=function(e,t,n){return c(e,t,n)},Object.setPrototypeOf(s.prototype,Uint8Array.prototype),Object.setPrototypeOf(s,Uint8Array);function l(e){if(typeof e!=`number`)throw TypeError(`"size" argument must be of type number`);if(e<0)throw RangeError(`The value "`+e+`" is invalid for option "size"`)}function u(e,t,n){return l(e),e<=0||t===void 0?o(e):typeof n==`string`?o(e).fill(t,n):o(e).fill(t)}s.alloc=function(e,t,n){return u(e,t,n)};function d(e){return l(e),o(e<0?0:_(e)|0)}s.allocUnsafe=function(e){return d(e)},s.allocUnsafeSlow=function(e){return d(e)};function f(e,t){if((typeof t!=`string`||t===``)&&(t=`utf8`),!s.isEncoding(t))throw TypeError(`Unknown encoding: `+t);let n=y(e,t)|0,r=o(n),i=r.write(e,t);return i!==n&&(r=r.slice(0,i)),r}function p(e){let t=e.length<0?0:_(e.length)|0,n=o(t);for(let r=0;r<t;r+=1)n[r]=e[r]&255;return n}function m(e){if(he(e,Uint8Array)){let t=new Uint8Array(e);return h(t.buffer,t.byteOffset,t.byteLength)}return p(e)}function h(e,t,n){if(t<0||e.byteLength<t)throw RangeError(`"offset" is outside of buffer bounds`);if(e.byteLength<t+(n||0))throw RangeError(`"length" is outside of buffer bounds`);let r;return r=t===void 0&&n===void 0?new Uint8Array(e):n===void 0?new Uint8Array(e,t):new Uint8Array(e,t,n),Object.setPrototypeOf(r,s.prototype),r}function g(e){if(s.isBuffer(e)){let t=_(e.length)|0,n=o(t);return n.length===0||e.copy(n,0,0,t),n}if(e.length!==void 0)return typeof e.length!=`number`||ge(e.length)?o(0):p(e);if(e.type===`Buffer`&&Array.isArray(e.data))return p(e.data)}function _(e){if(e>=i)throw RangeError(`Attempt to allocate Buffer larger than maximum size: 0x`+i.toString(16)+` bytes`);return e|0}function v(e){return+e!=e&&(e=0),s.alloc(+e)}s.isBuffer=function(e){return e!=null&&e._isBuffer===!0&&e!==s.prototype},s.compare=function(e,t){if(he(e,Uint8Array)&&(e=s.from(e,e.offset,e.byteLength)),he(t,Uint8Array)&&(t=s.from(t,t.offset,t.byteLength)),!s.isBuffer(e)||!s.isBuffer(t))throw TypeError(`The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array`);if(e===t)return 0;let n=e.length,r=t.length;for(let i=0,a=Math.min(n,r);i<a;++i)if(e[i]!==t[i]){n=e[i],r=t[i];break}return n<r?-1:+(r<n)},s.isEncoding=function(e){switch(String(e).toLowerCase()){case`hex`:case`utf8`:case`utf-8`:case`ascii`:case`latin1`:case`binary`:case`base64`:case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return!0;default:return!1}},s.concat=function(e,t){if(!Array.isArray(e))throw TypeError(`"list" argument must be an Array of Buffers`);if(e.length===0)return s.alloc(0);let n;if(t===void 0)for(t=0,n=0;n<e.length;++n)t+=e[n].length;let r=s.allocUnsafe(t),i=0;for(n=0;n<e.length;++n){let t=e[n];if(he(t,Uint8Array))i+t.length>r.length?(s.isBuffer(t)||(t=s.from(t)),t.copy(r,i)):Uint8Array.prototype.set.call(r,t,i);else if(s.isBuffer(t))t.copy(r,i);else throw TypeError(`"list" argument must be an Array of Buffers`);i+=t.length}return r};function y(e,t){if(s.isBuffer(e))return e.length;if(ArrayBuffer.isView(e)||he(e,ArrayBuffer))return e.byteLength;if(typeof e!=`string`)throw TypeError(`The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type `+typeof e);let n=e.length,r=arguments.length>2&&arguments[2]===!0;if(!r&&n===0)return 0;let i=!1;for(;;)switch(t){case`ascii`:case`latin1`:case`binary`:return n;case`utf8`:case`utf-8`:return de(e).length;case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return n*2;case`hex`:return n>>>1;case`base64`:return me(e).length;default:if(i)return r?-1:de(e).length;t=(``+t).toLowerCase(),i=!0}}s.byteLength=y;function b(e,t,n){let r=!1;if((t===void 0||t<0)&&(t=0),t>this.length||((n===void 0||n>this.length)&&(n=this.length),n<=0)||(n>>>=0,t>>>=0,n<=t))return``;for(e||=`utf8`;;)switch(e){case`hex`:return F(this,t,n);case`utf8`:case`utf-8`:return A(this,t,n);case`ascii`:return N(this,t,n);case`latin1`:case`binary`:return P(this,t,n);case`base64`:return k(this,t,n);case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return ee(this,t,n);default:if(r)throw TypeError(`Unknown encoding: `+e);e=(e+``).toLowerCase(),r=!0}}s.prototype._isBuffer=!0;function x(e,t,n){let r=e[t];e[t]=e[n],e[n]=r}s.prototype.swap16=function(){let e=this.length;if(e%2!=0)throw RangeError(`Buffer size must be a multiple of 16-bits`);for(let t=0;t<e;t+=2)x(this,t,t+1);return this},s.prototype.swap32=function(){let e=this.length;if(e%4!=0)throw RangeError(`Buffer size must be a multiple of 32-bits`);for(let t=0;t<e;t+=4)x(this,t,t+3),x(this,t+1,t+2);return this},s.prototype.swap64=function(){let e=this.length;if(e%8!=0)throw RangeError(`Buffer size must be a multiple of 64-bits`);for(let t=0;t<e;t+=8)x(this,t,t+7),x(this,t+1,t+6),x(this,t+2,t+5),x(this,t+3,t+4);return this},s.prototype.toString=function(){let e=this.length;return e===0?``:arguments.length===0?A(this,0,e):b.apply(this,arguments)},s.prototype.toLocaleString=s.prototype.toString,s.prototype.equals=function(e){if(!s.isBuffer(e))throw TypeError(`Argument must be a Buffer`);return this===e||s.compare(this,e)===0},s.prototype.inspect=function(){let t=``,n=e.INSPECT_MAX_BYTES;return t=this.toString(`hex`,0,n).replace(/(.{2})/g,`$1 `).trim(),this.length>n&&(t+=` ... `),`<Buffer `+t+`>`},r&&(s.prototype[r]=s.prototype.inspect),s.prototype.compare=function(e,t,n,r,i){if(he(e,Uint8Array)&&(e=s.from(e,e.offset,e.byteLength)),!s.isBuffer(e))throw TypeError(`The "target" argument must be one of type Buffer or Uint8Array. Received type `+typeof e);if(t===void 0&&(t=0),n===void 0&&(n=e?e.length:0),r===void 0&&(r=0),i===void 0&&(i=this.length),t<0||n>e.length||r<0||i>this.length)throw RangeError(`out of range index`);if(r>=i&&t>=n)return 0;if(r>=i)return-1;if(t>=n)return 1;if(t>>>=0,n>>>=0,r>>>=0,i>>>=0,this===e)return 0;let a=i-r,o=n-t,c=Math.min(a,o),l=this.slice(r,i),u=e.slice(t,n);for(let e=0;e<c;++e)if(l[e]!==u[e]){a=l[e],o=u[e];break}return a<o?-1:+(o<a)};function S(e,t,n,r,i){if(e.length===0)return-1;if(typeof n==`string`?(r=n,n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648),n=+n,ge(n)&&(n=i?0:e.length-1),n<0&&(n=e.length+n),n>=e.length){if(i)return-1;n=e.length-1}else if(n<0)if(i)n=0;else return-1;if(typeof t==`string`&&(t=s.from(t,r)),s.isBuffer(t))return t.length===0?-1:C(e,t,n,r,i);if(typeof t==`number`)return t&=255,typeof Uint8Array.prototype.indexOf==`function`?i?Uint8Array.prototype.indexOf.call(e,t,n):Uint8Array.prototype.lastIndexOf.call(e,t,n):C(e,[t],n,r,i);throw TypeError(`val must be string, number or Buffer`)}function C(e,t,n,r,i){let a=1,o=e.length,s=t.length;if(r!==void 0&&(r=String(r).toLowerCase(),r===`ucs2`||r===`ucs-2`||r===`utf16le`||r===`utf-16le`)){if(e.length<2||t.length<2)return-1;a=2,o/=2,s/=2,n/=2}function c(e,t){return a===1?e[t]:e.readUInt16BE(t*a)}let l;if(i){let r=-1;for(l=n;l<o;l++)if(c(e,l)===c(t,r===-1?0:l-r)){if(r===-1&&(r=l),l-r+1===s)return r*a}else r!==-1&&(l-=l-r),r=-1}else for(n+s>o&&(n=o-s),l=n;l>=0;l--){let n=!0;for(let r=0;r<s;r++)if(c(e,l+r)!==c(t,r)){n=!1;break}if(n)return l}return-1}s.prototype.includes=function(e,t,n){return this.indexOf(e,t,n)!==-1},s.prototype.indexOf=function(e,t,n){return S(this,e,t,n,!0)},s.prototype.lastIndexOf=function(e,t,n){return S(this,e,t,n,!1)};function w(e,t,n,r){n=Number(n)||0;let i=e.length-n;r?(r=Number(r),r>i&&(r=i)):r=i;let a=t.length;r>a/2&&(r=a/2);let o;for(o=0;o<r;++o){let r=parseInt(t.substr(o*2,2),16);if(ge(r))return o;e[n+o]=r}return o}function T(e,t,n,r){return H(de(t,e.length-n),e,n,r)}function E(e,t,n,r){return H(fe(t),e,n,r)}function D(e,t,n,r){return H(me(t),e,n,r)}function O(e,t,n,r){return H(pe(t,e.length-n),e,n,r)}s.prototype.write=function(e,t,n,r){if(t===void 0)r=`utf8`,n=this.length,t=0;else if(n===void 0&&typeof t==`string`)r=t,n=this.length,t=0;else if(isFinite(t))t>>>=0,isFinite(n)?(n>>>=0,r===void 0&&(r=`utf8`)):(r=n,n=void 0);else throw Error(`Buffer.write(string, encoding, offset[, length]) is no longer supported`);let i=this.length-t;if((n===void 0||n>i)&&(n=i),e.length>0&&(n<0||t<0)||t>this.length)throw RangeError(`Attempt to write outside buffer bounds`);r||=`utf8`;let a=!1;for(;;)switch(r){case`hex`:return w(this,e,t,n);case`utf8`:case`utf-8`:return T(this,e,t,n);case`ascii`:case`latin1`:case`binary`:return E(this,e,t,n);case`base64`:return D(this,e,t,n);case`ucs2`:case`ucs-2`:case`utf16le`:case`utf-16le`:return O(this,e,t,n);default:if(a)throw TypeError(`Unknown encoding: `+r);r=(``+r).toLowerCase(),a=!0}},s.prototype.toJSON=function(){return{type:`Buffer`,data:Array.prototype.slice.call(this._arr||this,0)}};function k(e,n,r){return n===0&&r===e.length?t.fromByteArray(e):t.fromByteArray(e.slice(n,r))}function A(e,t,n){n=Math.min(e.length,n);let r=[],i=t;for(;i<n;){let t=e[i],a=null,o=t>239?4:t>223?3:t>191?2:1;if(i+o<=n){let n,r,s,c;switch(o){case 1:t<128&&(a=t);break;case 2:n=e[i+1],(n&192)==128&&(c=(t&31)<<6|n&63,c>127&&(a=c));break;case 3:n=e[i+1],r=e[i+2],(n&192)==128&&(r&192)==128&&(c=(t&15)<<12|(n&63)<<6|r&63,c>2047&&(c<55296||c>57343)&&(a=c));break;case 4:n=e[i+1],r=e[i+2],s=e[i+3],(n&192)==128&&(r&192)==128&&(s&192)==128&&(c=(t&15)<<18|(n&63)<<12|(r&63)<<6|s&63,c>65535&&c<1114112&&(a=c))}}a===null?(a=65533,o=1):a>65535&&(a-=65536,r.push(a>>>10&1023|55296),a=56320|a&1023),r.push(a),i+=o}return M(r)}var j=4096;function M(e){let t=e.length;if(t<=j)return String.fromCharCode.apply(String,e);let n=``,r=0;for(;r<t;)n+=String.fromCharCode.apply(String,e.slice(r,r+=j));return n}function N(e,t,n){let r=``;n=Math.min(e.length,n);for(let i=t;i<n;++i)r+=String.fromCharCode(e[i]&127);return r}function P(e,t,n){let r=``;n=Math.min(e.length,n);for(let i=t;i<n;++i)r+=String.fromCharCode(e[i]);return r}function F(e,t,n){let r=e.length;(!t||t<0)&&(t=0),(!n||n<0||n>r)&&(n=r);let i=``;for(let r=t;r<n;++r)i+=_e[e[r]];return i}function ee(e,t,n){let r=e.slice(t,n),i=``;for(let e=0;e<r.length-1;e+=2)i+=String.fromCharCode(r[e]+r[e+1]*256);return i}s.prototype.slice=function(e,t){let n=this.length;e=~~e,t=t===void 0?n:~~t,e<0?(e+=n,e<0&&(e=0)):e>n&&(e=n),t<0?(t+=n,t<0&&(t=0)):t>n&&(t=n),t<e&&(t=e);let r=this.subarray(e,t);return Object.setPrototypeOf(r,s.prototype),r};function I(e,t,n){if(e%1!=0||e<0)throw RangeError(`offset is not uint`);if(e+t>n)throw RangeError(`Trying to access beyond buffer length`)}s.prototype.readUintLE=s.prototype.readUIntLE=function(e,t,n){e>>>=0,t>>>=0,n||I(e,t,this.length);let r=this[e],i=1,a=0;for(;++a<t&&(i*=256);)r+=this[e+a]*i;return r},s.prototype.readUintBE=s.prototype.readUIntBE=function(e,t,n){e>>>=0,t>>>=0,n||I(e,t,this.length);let r=this[e+--t],i=1;for(;t>0&&(i*=256);)r+=this[e+--t]*i;return r},s.prototype.readUint8=s.prototype.readUInt8=function(e,t){return e>>>=0,t||I(e,1,this.length),this[e]},s.prototype.readUint16LE=s.prototype.readUInt16LE=function(e,t){return e>>>=0,t||I(e,2,this.length),this[e]|this[e+1]<<8},s.prototype.readUint16BE=s.prototype.readUInt16BE=function(e,t){return e>>>=0,t||I(e,2,this.length),this[e]<<8|this[e+1]},s.prototype.readUint32LE=s.prototype.readUInt32LE=function(e,t){return e>>>=0,t||I(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+this[e+3]*16777216},s.prototype.readUint32BE=s.prototype.readUInt32BE=function(e,t){return e>>>=0,t||I(e,4,this.length),this[e]*16777216+(this[e+1]<<16|this[e+2]<<8|this[e+3])},s.prototype.readBigUInt64LE=ve(function(e){e>>>=0,se(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&ce(e,this.length-8);let r=t+this[++e]*2**8+this[++e]*2**16+this[++e]*2**24,i=this[++e]+this[++e]*2**8+this[++e]*2**16+n*2**24;return BigInt(r)+(BigInt(i)<<BigInt(32))}),s.prototype.readBigUInt64BE=ve(function(e){e>>>=0,se(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&ce(e,this.length-8);let r=t*2**24+this[++e]*2**16+this[++e]*2**8+this[++e],i=this[++e]*2**24+this[++e]*2**16+this[++e]*2**8+n;return(BigInt(r)<<BigInt(32))+BigInt(i)}),s.prototype.readIntLE=function(e,t,n){e>>>=0,t>>>=0,n||I(e,t,this.length);let r=this[e],i=1,a=0;for(;++a<t&&(i*=256);)r+=this[e+a]*i;return i*=128,r>=i&&(r-=2**(8*t)),r},s.prototype.readIntBE=function(e,t,n){e>>>=0,t>>>=0,n||I(e,t,this.length);let r=t,i=1,a=this[e+--r];for(;r>0&&(i*=256);)a+=this[e+--r]*i;return i*=128,a>=i&&(a-=2**(8*t)),a},s.prototype.readInt8=function(e,t){return e>>>=0,t||I(e,1,this.length),this[e]&128?(255-this[e]+1)*-1:this[e]},s.prototype.readInt16LE=function(e,t){e>>>=0,t||I(e,2,this.length);let n=this[e]|this[e+1]<<8;return n&32768?n|4294901760:n},s.prototype.readInt16BE=function(e,t){e>>>=0,t||I(e,2,this.length);let n=this[e+1]|this[e]<<8;return n&32768?n|4294901760:n},s.prototype.readInt32LE=function(e,t){return e>>>=0,t||I(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},s.prototype.readInt32BE=function(e,t){return e>>>=0,t||I(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},s.prototype.readBigInt64LE=ve(function(e){e>>>=0,se(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&ce(e,this.length-8);let r=this[e+4]+this[e+5]*2**8+this[e+6]*2**16+(n<<24);return(BigInt(r)<<BigInt(32))+BigInt(t+this[++e]*2**8+this[++e]*2**16+this[++e]*2**24)}),s.prototype.readBigInt64BE=ve(function(e){e>>>=0,se(e,`offset`);let t=this[e],n=this[e+7];(t===void 0||n===void 0)&&ce(e,this.length-8);let r=(t<<24)+this[++e]*2**16+this[++e]*2**8+this[++e];return(BigInt(r)<<BigInt(32))+BigInt(this[++e]*2**24+this[++e]*2**16+this[++e]*2**8+n)}),s.prototype.readFloatLE=function(e,t){return e>>>=0,t||I(e,4,this.length),n.read(this,e,!0,23,4)},s.prototype.readFloatBE=function(e,t){return e>>>=0,t||I(e,4,this.length),n.read(this,e,!1,23,4)},s.prototype.readDoubleLE=function(e,t){return e>>>=0,t||I(e,8,this.length),n.read(this,e,!0,52,8)},s.prototype.readDoubleBE=function(e,t){return e>>>=0,t||I(e,8,this.length),n.read(this,e,!1,52,8)};function L(e,t,n,r,i,a){if(!s.isBuffer(e))throw TypeError(`"buffer" argument must be a Buffer instance`);if(t>i||t<a)throw RangeError(`"value" argument is out of bounds`);if(n+r>e.length)throw RangeError(`Index out of range`)}s.prototype.writeUintLE=s.prototype.writeUIntLE=function(e,t,n,r){if(e=+e,t>>>=0,n>>>=0,!r){let r=2**(8*n)-1;L(this,e,t,n,r,0)}let i=1,a=0;for(this[t]=e&255;++a<n&&(i*=256);)this[t+a]=e/i&255;return t+n},s.prototype.writeUintBE=s.prototype.writeUIntBE=function(e,t,n,r){if(e=+e,t>>>=0,n>>>=0,!r){let r=2**(8*n)-1;L(this,e,t,n,r,0)}let i=n-1,a=1;for(this[t+i]=e&255;--i>=0&&(a*=256);)this[t+i]=e/a&255;return t+n},s.prototype.writeUint8=s.prototype.writeUInt8=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,1,255,0),this[t]=e&255,t+1},s.prototype.writeUint16LE=s.prototype.writeUInt16LE=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,2,65535,0),this[t]=e&255,this[t+1]=e>>>8,t+2},s.prototype.writeUint16BE=s.prototype.writeUInt16BE=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,2,65535,0),this[t]=e>>>8,this[t+1]=e&255,t+2},s.prototype.writeUint32LE=s.prototype.writeUInt32LE=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,4,4294967295,0),this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=e&255,t+4},s.prototype.writeUint32BE=s.prototype.writeUInt32BE=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,4,4294967295,0),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=e&255,t+4};function R(e,t,n,r,i){oe(t,r,i,e,n,7);let a=Number(t&BigInt(4294967295));e[n++]=a,a>>=8,e[n++]=a,a>>=8,e[n++]=a,a>>=8,e[n++]=a;let o=Number(t>>BigInt(32)&BigInt(4294967295));return e[n++]=o,o>>=8,e[n++]=o,o>>=8,e[n++]=o,o>>=8,e[n++]=o,n}function z(e,t,n,r,i){oe(t,r,i,e,n,7);let a=Number(t&BigInt(4294967295));e[n+7]=a,a>>=8,e[n+6]=a,a>>=8,e[n+5]=a,a>>=8,e[n+4]=a;let o=Number(t>>BigInt(32)&BigInt(4294967295));return e[n+3]=o,o>>=8,e[n+2]=o,o>>=8,e[n+1]=o,o>>=8,e[n]=o,n+8}s.prototype.writeBigUInt64LE=ve(function(e,t=0){return R(this,e,t,BigInt(0),BigInt(`0xffffffffffffffff`))}),s.prototype.writeBigUInt64BE=ve(function(e,t=0){return z(this,e,t,BigInt(0),BigInt(`0xffffffffffffffff`))}),s.prototype.writeIntLE=function(e,t,n,r){if(e=+e,t>>>=0,!r){let r=2**(8*n-1);L(this,e,t,n,r-1,-r)}let i=0,a=1,o=0;for(this[t]=e&255;++i<n&&(a*=256);)e<0&&o===0&&this[t+i-1]!==0&&(o=1),this[t+i]=(e/a>>0)-o&255;return t+n},s.prototype.writeIntBE=function(e,t,n,r){if(e=+e,t>>>=0,!r){let r=2**(8*n-1);L(this,e,t,n,r-1,-r)}let i=n-1,a=1,o=0;for(this[t+i]=e&255;--i>=0&&(a*=256);)e<0&&o===0&&this[t+i+1]!==0&&(o=1),this[t+i]=(e/a>>0)-o&255;return t+n},s.prototype.writeInt8=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,1,127,-128),e<0&&(e=255+e+1),this[t]=e&255,t+1},s.prototype.writeInt16LE=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,2,32767,-32768),this[t]=e&255,this[t+1]=e>>>8,t+2},s.prototype.writeInt16BE=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,2,32767,-32768),this[t]=e>>>8,this[t+1]=e&255,t+2},s.prototype.writeInt32LE=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,4,2147483647,-2147483648),this[t]=e&255,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24,t+4},s.prototype.writeInt32BE=function(e,t,n){return e=+e,t>>>=0,n||L(this,e,t,4,2147483647,-2147483648),e<0&&(e=4294967295+e+1),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=e&255,t+4},s.prototype.writeBigInt64LE=ve(function(e,t=0){return R(this,e,t,-BigInt(`0x8000000000000000`),BigInt(`0x7fffffffffffffff`))}),s.prototype.writeBigInt64BE=ve(function(e,t=0){return z(this,e,t,-BigInt(`0x8000000000000000`),BigInt(`0x7fffffffffffffff`))});function B(e,t,n,r,i,a){if(n+r>e.length||n<0)throw RangeError(`Index out of range`)}function te(e,t,r,i,a){return t=+t,r>>>=0,a||B(e,t,r,4,34028234663852886e22,-34028234663852886e22),n.write(e,t,r,i,23,4),r+4}s.prototype.writeFloatLE=function(e,t,n){return te(this,e,t,!0,n)},s.prototype.writeFloatBE=function(e,t,n){return te(this,e,t,!1,n)};function V(e,t,r,i,a){return t=+t,r>>>=0,a||B(e,t,r,8,17976931348623157e292,-17976931348623157e292),n.write(e,t,r,i,52,8),r+8}s.prototype.writeDoubleLE=function(e,t,n){return V(this,e,t,!0,n)},s.prototype.writeDoubleBE=function(e,t,n){return V(this,e,t,!1,n)},s.prototype.copy=function(e,t,n,r){if(!s.isBuffer(e))throw TypeError(`argument should be a Buffer`);if(n||=0,!r&&r!==0&&(r=this.length),t>=e.length&&(t=e.length),t||=0,r>0&&r<n&&(r=n),r===n||e.length===0||this.length===0)return 0;if(t<0)throw RangeError(`targetStart out of bounds`);if(n<0||n>=this.length)throw RangeError(`Index out of range`);if(r<0)throw RangeError(`sourceEnd out of bounds`);r>this.length&&(r=this.length),e.length-t<r-n&&(r=e.length-t+n);let i=r-n;return this===e&&typeof Uint8Array.prototype.copyWithin==`function`?this.copyWithin(t,n,r):Uint8Array.prototype.set.call(e,this.subarray(n,r),t),i},s.prototype.fill=function(e,t,n,r){if(typeof e==`string`){if(typeof t==`string`?(r=t,t=0,n=this.length):typeof n==`string`&&(r=n,n=this.length),r!==void 0&&typeof r!=`string`)throw TypeError(`encoding must be a string`);if(typeof r==`string`&&!s.isEncoding(r))throw TypeError(`Unknown encoding: `+r);if(e.length===1){let t=e.charCodeAt(0);(r===`utf8`&&t<128||r===`latin1`)&&(e=t)}}else typeof e==`number`?e&=255:typeof e==`boolean`&&(e=Number(e));if(t<0||this.length<t||this.length<n)throw RangeError(`Out of range index`);if(n<=t)return this;t>>>=0,n=n===void 0?this.length:n>>>0,e||=0;let i;if(typeof e==`number`)for(i=t;i<n;++i)this[i]=e;else{let a=s.isBuffer(e)?e:s.from(e,r),o=a.length;if(o===0)throw TypeError(`The value "`+e+`" is invalid for argument "value"`);for(i=0;i<n-t;++i)this[i+t]=a[i%o]}return this};var ne={};function re(e,t,n){ne[e]=class extends n{constructor(){super(),Object.defineProperty(this,"message",{value:t.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${e}]`,this.stack,delete this.name}get code(){return e}set code(e){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:e,writable:!0})}toString(){return`${this.name} [${e}]: ${this.message}`}}}re(`ERR_BUFFER_OUT_OF_BOUNDS`,function(e){return e?`${e} is outside of buffer bounds`:`Attempt to access memory outside buffer bounds`},RangeError),re(`ERR_INVALID_ARG_TYPE`,function(e,t){return`The "${e}" argument must be of type number. Received type ${typeof t}`},TypeError),re(`ERR_OUT_OF_RANGE`,function(e,t,n){let r=`The value of "${e}" is out of range.`,i=n;return Number.isInteger(n)&&Math.abs(n)>2**32?i=ie(String(n)):typeof n==`bigint`&&(i=String(n),(n>BigInt(2)**BigInt(32)||n<-(BigInt(2)**BigInt(32)))&&(i=ie(i)),i+=`n`),r+=` It must be ${t}. Received ${i}`,r},RangeError);function ie(e){let t=``,n=e.length,r=+(e[0]===`-`);for(;n>=r+4;n-=3)t=`_${e.slice(n-3,n)}${t}`;return`${e.slice(0,n)}${t}`}function ae(e,t,n){se(t,`offset`),(e[t]===void 0||e[t+n]===void 0)&&ce(t,e.length-(n+1))}function oe(e,t,n,r,i,a){if(e>n||e<t){let r=typeof t==`bigint`?`n`:``,i;throw i=a>3?t===0||t===BigInt(0)?`>= 0${r} and < 2${r} ** ${(a+1)*8}${r}`:`>= -(2${r} ** ${(a+1)*8-1}${r}) and < 2 ** ${(a+1)*8-1}${r}`:`>= ${t}${r} and <= ${n}${r}`,new ne.ERR_OUT_OF_RANGE(`value`,i,e)}ae(r,i,a)}function se(e,t){if(typeof e!=`number`)throw new ne.ERR_INVALID_ARG_TYPE(t,`number`,e)}function ce(e,t,n){throw Math.floor(e)===e?t<0?new ne.ERR_BUFFER_OUT_OF_BOUNDS:new ne.ERR_OUT_OF_RANGE(n||`offset`,`>= ${+!!n} and <= ${t}`,e):(se(e,n),new ne.ERR_OUT_OF_RANGE(n||`offset`,`an integer`,e))}var le=/[^+/0-9A-Za-z-_]/g;function ue(e){if(e=e.split(`=`)[0],e=e.trim().replace(le,``),e.length<2)return``;for(;e.length%4!=0;)e+=`=`;return e}function de(e,t){t||=1/0;let n,r=e.length,i=null,a=[];for(let o=0;o<r;++o){if(n=e.charCodeAt(o),n>55295&&n<57344){if(!i){if(n>56319){(t-=3)>-1&&a.push(239,191,189);continue}else if(o+1===r){(t-=3)>-1&&a.push(239,191,189);continue}i=n;continue}if(n<56320){(t-=3)>-1&&a.push(239,191,189),i=n;continue}n=(i-55296<<10|n-56320)+65536}else i&&(t-=3)>-1&&a.push(239,191,189);if(i=null,n<128){if(--t<0)break;a.push(n)}else if(n<2048){if((t-=2)<0)break;a.push(n>>6|192,n&63|128)}else if(n<65536){if((t-=3)<0)break;a.push(n>>12|224,n>>6&63|128,n&63|128)}else if(n<1114112){if((t-=4)<0)break;a.push(n>>18|240,n>>12&63|128,n>>6&63|128,n&63|128)}else throw Error(`Invalid code point`)}return a}function fe(e){let t=[];for(let n=0;n<e.length;++n)t.push(e.charCodeAt(n)&255);return t}function pe(e,t){let n,r,i,a=[];for(let o=0;o<e.length&&!((t-=2)<0);++o)n=e.charCodeAt(o),r=n>>8,i=n%256,a.push(i),a.push(r);return a}function me(e){return t.toByteArray(ue(e))}function H(e,t,n,r){let i;for(i=0;i<r&&!(i+n>=t.length||i>=e.length);++i)t[i+n]=e[i];return i}function he(e,t){return e instanceof t||e!=null&&e.constructor!=null&&e.constructor.name!=null&&e.constructor.name===t.name}function ge(e){return e!==e}var _e=(function(){let e=`0123456789abcdef`,t=Array(256);for(let n=0;n<16;++n){let r=n*16;for(let i=0;i<16;++i)t[r+i]=e[n]+e[i]}return t})();function ve(e){return typeof BigInt>`u`?ye:e}function ye(){throw Error(`BigInt not supported`)}}))();typeof window<`u`&&(window.Buffer=on.Buffer),typeof self<`u`&&(self.Buffer=on.Buffer),globalThis.Buffer=on.Buffer;var sn=`/k/`;function cn(e){if(e.source!==navigator.serviceWorker?.controller||e.origin&&e.origin!==window.location.origin)return;let t=e.data;if(!t.type)return;let n=G(),r=t.payload;switch(t.type){case`focusMessage`:n.focusMessage?.(r);break;case`playNotificationSound`:Ft(t.payload.id);break;case`share`:n.openChatWithDraft({text:wt(r.url,r.text,r.title),files:ue(r.files)});break}}function ln(){navigator.serviceWorker.removeEventListener(`message`,cn),navigator.serviceWorker.addEventListener(`message`,cn),It()}at&&(window.addEventListener(`load`,async()=>{try{let e=navigator.serviceWorker.controller;if(!e||e.scriptURL.includes(sn)){let e=(await navigator.serviceWorker.getRegistrations()).filter(e=>!e.scope.includes(sn));e.length&&await Promise.all(e.map(e=>e.unregister()))}if(await navigator.serviceWorker.register(new URL(`data:video/mp2t;base64,aW1wb3J0IHsgREVCVUcgfSBmcm9tICcuLi9jb25maWcnOwppbXBvcnQgeyBwYXVzZSB9IGZyb20gJy4uL3V0aWwvc2NoZWR1bGVycyc7CmltcG9ydCB7IGNsZWFyQXNzZXRDYWNoZSwgcmVzcG9uZFdpdGhDYWNoZSwgcmVzcG9uZFdpdGhDYWNoZU5ldHdvcmtGaXJzdCB9IGZyb20gJy4vYXNzZXRDYWNoZSc7CmltcG9ydCB7IHJlc3BvbmRGb3JEb3dubG9hZCB9IGZyb20gJy4vZG93bmxvYWQnOwppbXBvcnQgeyByZXNwb25kRm9yUHJvZ3Jlc3NpdmUgfSBmcm9tICcuL3Byb2dyZXNzaXZlJzsKaW1wb3J0IHsKICBoYW5kbGVDbGllbnRNZXNzYWdlIGFzIGhhbmRsZU5vdGlmaWNhdGlvbk1lc3NhZ2UsCiAgaGFuZGxlTm90aWZpY2F0aW9uQ2xpY2ssCiAgaGFuZGxlUHVzaCwKfSBmcm9tICcuL3B1c2hOb3RpZmljYXRpb24nOwppbXBvcnQgeyBoYW5kbGVDbGllbnRNZXNzYWdlIGFzIGhhbmRsZVNoYXJlTWVzc2FnZSwgcmVzcG9uZEZvclNoYXJlIH0gZnJvbSAnLi9zaGFyZSc7CgpkZWNsYXJlIGNvbnN0IHNlbGY6IFNlcnZpY2VXb3JrZXJHbG9iYWxTY29wZTsKCmNvbnN0IFJFX05FVFdPUktfRklSU1RfQVNTRVRTID0gL1wuKHdhc218aHRtbCkkLzsKY29uc3QgUkVfQ0FDSEVfRklSU1RfQVNTRVRTID0gL1tcZGEtZl17MjB9LipcLihqc3xjc3N8d29mZjI/fHN2Z3xwbmd8anBnfGpwZWd8dGdzfGpzb258d2FzbSkkLzsKY29uc3QgQUNUSVZBVEVfVElNRU9VVCA9IDMwMDA7CgpzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2luc3RhbGwnLCAoZSkgPT4gewogIGlmIChERUJVRykgewogICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUKICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlV29ya2VyIGluc3RhbGxlZCcpOwogIH0KCiAgLy8gQWN0aXZhdGUgd29ya2VyIGltbWVkaWF0ZWx5CiAgZS53YWl0VW50aWwoc2VsZi5za2lwV2FpdGluZygpKTsKfSk7CgpzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2FjdGl2YXRlJywgKGUpID0+IHsKICBpZiAoREVCVUcpIHsKICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlCiAgICBjb25zb2xlLmxvZygnU2VydmljZVdvcmtlciBhY3RpdmF0ZWQnKTsKICB9CgogIGUud2FpdFVudGlsKAogICAgUHJvbWlzZS5yYWNlKFsKICAgICAgLy8gQW4gYXR0ZW1wdCB0byBmaXggZnJlZXppbmcgVUkgb24gaU9TCiAgICAgIHBhdXNlKEFDVElWQVRFX1RJTUVPVVQpLAogICAgICBQcm9taXNlLmFsbChbCiAgICAgICAgY2xlYXJBc3NldENhY2hlKCksCiAgICAgICAgLy8gQmVjb21lIGF2YWlsYWJsZSB0byBhbGwgcGFnZXMKICAgICAgICBzZWxmLmNsaWVudHMuY2xhaW0oKSwKICAgICAgXSksCiAgICBdKSwKICApOwp9KTsKCnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignZmV0Y2gnLCAoZTogRmV0Y2hFdmVudCkgPT4gewogIGNvbnN0IHsgdXJsIH0gPSBlLnJlcXVlc3Q7CiAgY29uc3QgeyBzY29wZSB9ID0gc2VsZi5yZWdpc3RyYXRpb247CiAgaWYgKCF1cmwuc3RhcnRzV2l0aChzY29wZSkpIHsKICAgIHJldHVybiBmYWxzZTsKICB9CgogIGNvbnN0IHsgcGF0aG5hbWUsIHByb3RvY29sIH0gPSBuZXcgVVJMKHVybCk7CiAgY29uc3QgeyBwYXRobmFtZTogc2NvcGVQYXRobmFtZSB9ID0gbmV3IFVSTChzY29wZSk7CgogIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3Byb2dyZXNzaXZlLycpKSB7CiAgICBlLnJlc3BvbmRXaXRoKHJlc3BvbmRGb3JQcm9ncmVzc2l2ZShlKSk7CiAgICByZXR1cm4gdHJ1ZTsKICB9CgogIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL2Rvd25sb2FkLycpKSB7CiAgICBlLnJlc3BvbmRXaXRoKHJlc3BvbmRGb3JEb3dubG9hZChlKSk7CiAgICByZXR1cm4gdHJ1ZTsKICB9CgogIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3NoYXJlLycpKSB7CiAgICBlLnJlc3BvbmRXaXRoKHJlc3BvbmRGb3JTaGFyZShlKSk7CiAgfQoKICBpZiAocHJvdG9jb2wgPT09ICdodHRwOicgfHwgcHJvdG9jb2wgPT09ICdodHRwczonKSB7CiAgICBpZiAocGF0aG5hbWUgPT09IHNjb3BlUGF0aG5hbWUgfHwgcGF0aG5hbWUubWF0Y2goUkVfTkVUV09SS19GSVJTVF9BU1NFVFMpKSB7CiAgICAgIGUucmVzcG9uZFdpdGgocmVzcG9uZFdpdGhDYWNoZU5ldHdvcmtGaXJzdChlKSk7CiAgICAgIHJldHVybiB0cnVlOwogICAgfQoKICAgIGlmIChwYXRobmFtZS5tYXRjaChSRV9DQUNIRV9GSVJTVF9BU1NFVFMpKSB7CiAgICAgIGUucmVzcG9uZFdpdGgocmVzcG9uZFdpdGhDYWNoZShlKSk7CiAgICAgIHJldHVybiB0cnVlOwogICAgfQogIH0KCiAgcmV0dXJuIGZhbHNlOwp9KTsKCnNlbGYuYWRkRXZlbnRMaXN0ZW5lcigncHVzaCcsIGhhbmRsZVB1c2gpOwpzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ25vdGlmaWNhdGlvbmNsaWNrJywgaGFuZGxlTm90aWZpY2F0aW9uQ2xpY2spOwpzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHsKICBoYW5kbGVOb3RpZmljYXRpb25NZXNzYWdlKGV2ZW50KTsKICBoYW5kbGVTaGFyZU1lc3NhZ2UoZXZlbnQpOwp9KTsK`,``+import.meta.url),{type:`module`}),await navigator.serviceWorker.ready,await navigator.serviceWorker.getRegistration(),navigator.serviceWorker.controller)ln();else{let e=window.location.hostname===`localhost`||window.location.hostname===`127.0.0.1`;!S&&!l&&!e&&G().showDialog?.({data:{type:`error`,message:`SERVICE_WORKER_DISABLED`,hasErrorKey:!0}})}}catch{}}),window.addEventListener(`focus`,async()=>{await navigator.serviceWorker.ready,ln()}));var un=120*1e3,dn=[],fn;Pe(e=>{let t=fn;fn=e;let n=N(e)?.isMasterTab,r=t&&N(t)?.isMasterTab;n!==r&&(n&&!r?pn(e):mn())}),Pe(e=>{N(e)?.isMasterTab&&Ut(e)});function pn(e){dn.length||(Wt(),dn.push(window.setInterval(hn,un)),Ut(e))}function mn(){Wt(),dn.forEach(e=>clearInterval(e)),dn=[]}function hn(){let e=Te();if(!e.isInited)return;let t=k();Object.values(e.stories.byPeerId).forEach(n=>{Object.values(n.byId).forEach(n=>{n[`@type`]===`story`&&(n.expireDate>t||n.isInProfile||(e=Et(e,n.peerId,n.id)))})}),et(e)}async function gn(e=!1,t){if(t||=Te(),!e&&`byTabId`in t)return;let n=Oe(Ee);await We();let r=await Jt(n),i=r||n,{hasPasscode:a,isScreenLocked:o}=i.passcode;if(a&&!o&&(i=St(i,{isScreenLocked:!0}),$t()),e&&(i.byTabId=t.byTabId),!r){let e=await Yt();e&&(i.sharedState=e)}et(i)}Qt(),Se(`initShared`,async(e,t,n)=>{let{force:r}=n||{};await gn(r,e)}),Se(`init`,(e,t,n)=>{let{tabId:r=Re(),isMasterTab:i}=n||{},o=Oe(Ae);o.id=r,o.audioPlayer.playbackRate=e.audioPlayer.lastPlaybackRate,o.audioPlayer.isPlaybackRateActive=e.audioPlayer.isLastPlaybackRateActive,o.mediaViewer.playbackRate=e.mediaViewer.lastPlaybackRate,e.lastIsChatInfoShown&&(o.chatInfo={isOpen:!0}),e={...e,byTabId:{...e.byTabId,[r]:o}},i&&(o.isMasterTab=!0),Fe&&o.isMasterTab&&qt(e.sharedState),Object.keys(e.messages.byChatId).forEach(t=>{let n=e.messages.byChatId[t].threadsById;Object.keys(n).forEach(n=>{let i=Number(n),o=He(e,t,i,`lastViewportIds`);if(!o?.every(n=>a(n)||e.messages.byChatId[t]?.byId[n])){e=Dt(e,t,i,`lastViewportIds`,void 0);return}e=Ct(e,t,i,r),e=Ot(e,t,i,`viewportIds`,o,r)})}),Object.keys(e.messages.byChatId).forEach(t=>{let n=e.messages.byChatId[t].threadsById,r=Object.keys(n).reduce((e,t)=>{let r=n[t];return r.localState?.lastViewportIds?(e[t]={...r,localState:{...r.localState,listedIds:r.localState.lastViewportIds}},e):(e[t]=r,e)},{});e={...e,messages:{...e.messages,byChatId:{...e.messages.byChatId,[t]:{...e.messages.byChatId[t],threadsById:r}}}}});let s=Lt(e.currentUserId);return e.auth.state!==`authorizationStateReady`&&!e.passcode.hasPasscode&&!e.passcode.isScreenLocked&&Object.values(e.byTabId).forEach(({id:t})=>{t!==r&&(e=Tt(e,{inactiveReason:`auth`},t))}),ft().then(t=>{e=Te(),e.isCacheApiSupported=t,et(e)}),e.peerColors&&be(e.peerColors.general),setTimeout(()=>{Zt()},100),Tt(e,{messageLists:s?[s]:o.messageLists},r)}),Se(`requestMasterAndCallAction`,async(e,t,n)=>{let{tabId:r=Re()}=n;if(N(e,r).isMasterTab){let{action:e,payload:r}=n;t[e](r);return}e.phoneCall||e.groupCalls.activeGroupCallId?(await lt(Ze.Calls),`hangUp`in t&&t.hangUp({tabId:r}),`leaveGroupCall`in t&&t.leaveGroupCall({tabId:r})):A(),e=Te(),e=Tt(e,{multitabNextAction:n},r),et(e)}),Se(`clearMultitabNextAction`,(e,t,n)=>{let{tabId:r=Re()}=n||{};return Tt(e,{multitabNextAction:void 0},r)});var _n=5e3,vn=10,yn=35,bn=!1;function xn(){if(!S)return;let e,t=Date.now();function n(){e||bn||(e=window.setInterval(Sn,_n))}window.addEventListener(`focus`,()=>{let e=Date.now();e-t<100||(t=e,n(),Sn())}),window.addEventListener(`blur`,()=>{clearInterval(e),e=void 0}),document.hasFocus()&&(n(),Sn())}async function Sn(){await Cn()<=yn&&wn()}function Cn(){return new Promise(e=>{let t=[],n=performance.now();P(()=>{let r=performance.now();if(t.push(r-n),n=r,t.length===vn){let n=t.sort()[Math.floor(t.length/2)];return e(Math.round(1e3/n)),!1}return!0},z)})}function wn(){bn=!0;let e=document.createElement(`div`);e.style.cssText=`position: absolute; top: 0; left: 0; width: 0; height: 100%; overflow: hidden;`;let t=document.createElement(`div`),n=window.screen.height*1.5;t.style.cssText=`width: 0; height: ${n}px; transform: translateX(100%); transition: transform 100ms;`,t.innerHTML=`&nbsp;`,e.appendChild(t),document.body.appendChild(e),requestAnimationFrame(()=>{t.addEventListener(`transitionend`,()=>{e.remove()}),t.style.transform=``})}function Tn(){let e=new BroadcastChannel(Ne);e.addEventListener(`message`,e=>{if(e.data!==`A`){let e=Te(),t=N(e);e=Tt(e,{inactiveReason:`otherClient`},t.id),et(e)}}),e.postMessage(`A`)}function En(){let e=ut(()=>import(`./shared-components-DeyUOUr6.js`).then(e=>e.xv),__vite__mapDeps([0,1,2]),import.meta.url);async function t(t){if(R)return(await e).invoke(`mark_title_bar_overlay`,{isOverlay:t})}async function n(t,n=!1){return(await e).invoke(`set_notifications_count`,{amount:t,isMuted:n})}async function r(t){return(await e).invoke(`open_new_window_cmd`,{url:t})}async function i(t){return(await e).invoke(`set_window_title`,{title:t})}window.tauri??={},Object.assign(window.tauri,{markTitleBarOverlay:t,setNotificationsCount:n,openNewWindow:r,relaunch:()=>ut(async()=>{let{relaunch:e}=await import(`./dist-js-BFuJbw7t.js`);return{relaunch:e}},__vite__mapDeps([3,0,1,2]),import.meta.url).then(({relaunch:e})=>e()),checkUpdate:()=>ut(async()=>{let{check:e}=await import(`./dist-js-DtFEljyc.js`);return{check:e}},__vite__mapDeps([4,0,1,2]),import.meta.url).then(({check:e})=>e()),getCurrentWindow:()=>ut(async()=>{let{getCurrentWindow:e}=await import(`./window-ttYlYFWR.js`);return{getCurrentWindow:e}},__vite__mapDeps([5,0,1,2,6]),import.meta.url).then(({getCurrentWindow:e})=>e()),setWindowTitle:i})}var Dn=!1;function On(){if(Dn)return;Dn=!0,document.addEventListener(`contextmenu`,e=>{e.preventDefault()}),ut(()=>import(`./event-WGnj0wHc.js`),__vite__mapDeps([6,0,1,2]),import.meta.url).then(({listen:e})=>{e(`download-finished`,e=>{e.payload.success||G().showNotification({message:{key:`NativeDownloadFailed`}})})}),document.addEventListener(`keydown`,e=>{if(e.key===`Backspace`||e.code===`Backspace`){let t=e.target;t?.tagName===`INPUT`||t?.tagName===`TEXTAREA`||t?.isContentEditable||e.preventDefault()}},!0),window.open=(e,t,n)=>(e&&kn(e),null);function e(e){let t=e.target?.closest(`a[href]`);t&&(t.target===`_blank`||e.ctrlKey||e.metaKey||e.button===_e.Auxiliary)&&(e.preventDefault(),kn(t.getAttribute(`href`)))}document.addEventListener(`click`,e),document.addEventListener(`auxclick`,e)}async function kn(e){try{let t=e instanceof URL?e:new URL(e,window.location.href);window.location.origin===t.origin?await window.tauri.openNewWindow(t.toString()):await(await ut(()=>import(`./dist-js-DN3ZVlXi.js`),__vite__mapDeps([7,0,1,2]),import.meta.url)).open(t.toString())}catch(e){console.error(`Failed to open link`,e)}}function An(){if(!R)return;let e=document.getElementById(`the-manifest-placeholder`);e&&e.setAttribute(`href`,`site_apple.webmanifest`)}var jn=`input, a, button`,Mn=()=>{let e=c(async e=>{e.target instanceof HTMLElement&&(e.target?.closest(jn)||e.target?.closest(`[data-tauri-drag-region]`)&&(await window.tauri?.getCurrentWindow())?.startDragging())},[]);W(()=>{if(Me&&R)return document.addEventListener(`mousedown`,e),()=>{document.removeEventListener(`mousedown`,e)}},[e])},Nn=()=>K(ye(Ze.Auth,`AuthCode`)||vt,{}),Pn=()=>K(ye(Ze.Auth,`AuthPassword`)||vt,{}),Fn=[`400 1em Roboto`,`500 1em Roboto`,`500 1em 'Numbers Rounded'`];function In(){if(`fonts`in document)return Promise.all(Fn.map(e=>document.fonts.load(e)))}function Ln(){let e=new URL(window.location.href),t=document.referrer?new URL(document.referrer):void 0;if(t?.origin===e.origin&&t.pathname===e.pathname&&t.searchParams.get(`account`)!==e.searchParams.get(`account`)){window.location.assign(t);return}let n=rt(1);window.location.href=n}function Rn(){let e=navigator.language.toLowerCase();return e&&e!==`pt-br`&&(e=e.substr(0,2)),e}function zn(e,t){let[n,r]=I(void 0),i=U(async()=>{if(!t)return;let n=(await s(`fetchLangStrings`,{langCode:t,langPack:bt,keys:[e]}))?.strings[e];if(!(!n||typeof n!=`string`))return n});return W(()=>{i().then(r)},[e,t]),n}var Bn=300,Vn=50,Hn=({id:e,value:t,isLoading:n,onChange:r,phoneCodeList:i})=>{let a=tt(),o=j(),[s,l]=I(),[u,f]=I([]),p=c(e=>{l(e),f(Un(i,e))},[i]);d(([e])=>{!e?.length&&i.length&&f(Un(i,s))},[i,s]);let m=c(e=>{r(e),setTimeout(()=>p(void 0),Bn)},[r,p]),h=c(e=>{p(e.currentTarget.value)},[p]),g=c(e=>{if(e.keyCode!==8)return;let n=e.currentTarget;t&&s===void 0&&(n.value=``),p(n.value)},[s,p,t]);return J(De,{className:`CountryCodeInput`,trigger:c(({onTrigger:r,isOpen:i})=>{let c=()=>{if(i)return;setTimeout(()=>{o.current.select()},Vn),r();let e=document.getElementById(`auth-phone-number-form`);e.scrollTo({top:e.scrollHeight,behavior:`smooth`})},l=e=>{h(e),c()},u=t&&Be&&yt(t.iso2),d=t?.name||t?.defaultName||``,f=s??[u,d].filter(Boolean).join(` `);return J(`div`,{className:H(`input-group`,t&&`touched`),children:[K(`input`,{ref:o,className:H(`form-control`,i&&`focus`),type:`text`,id:e,value:f,autoComplete:`off`,spellCheck:!Me&&void 0,onClick:c,onFocus:c,onInput:l,onKeyDown:g}),K(`label`,{children:a(`LoginSelectCountryTitle`)}),n?K(B,{color:`black`}):K(`i`,{onClick:c,className:H(`css-icon-down`,i&&`open`)})]})},[s,h,g,e,n,a,t]),children:[u.map(e=>J(v,{className:t&&e.iso2===t.iso2?`selected`:``,onClick:()=>m(e),children:[K(`span`,{className:`country-flag`,children:Je(yt(e.iso2),[`hq_emoji`])}),K(`span`,{className:`country-name`,children:e.name||e.defaultName}),J(`span`,{className:`country-code`,children:[`+`,e.countryCode]})]},`${e.iso2}-${e.countryCode}`)),!u.length&&K(v,{className:`no-results`,disabled:!0,children:K(`span`,{children:a(`CountryNone`)})},`no-results`)]})};function Un(e,t=``){if(!t.length)return e;let n=r(t);return e.filter(e=>n(e.defaultName)||e.name&&n(e.name))}var Wn=V(Ke(e=>{let{countryList:{phoneCodes:t}}=e;return{phoneCodeList:t}})(Hn)),Gn=``+new URL(`monkey-CiXkaML5.svg`,import.meta.url).href,Kn=7,qn=!1,Jn=V(Ke(e=>{let{sharedState:{settings:{language:t}},countryList:{phoneCodes:n},config:r,auth:i,connectionState:a}=e;return{auth:i,connectionState:a,language:t,phoneCodeList:n,isTestServer:r?.isTestServer}})(({auth:e,connectionState:t,phoneCodeList:r,language:i,isTestServer:a})=>{let{setAuthPhoneNumber:o,setAuthRememberMe:s,loadNearestCountry:c,loadCountryList:l,clearAuthErrorKey:u,goToAuthQrCode:d,setSharedSettingOption:f,loginWithPasskey:p}=G(),{state:m,phoneNumber:h,nearestCountry:_,isLoading:v,errorKey:y,rememberMe:b,isLoadingQrCode:S,passkeyOption:C}=e,w=tt(),T=j(),E=Rn(),D=t===`connectionStateReady`,k=zn(`AuthContinueOnThisLanguage`,E),[A,M]=I(),[N,P]=I(),[F,ee]=I(!1),[L,R]=I(),[z,B,te]=g(),V=Vt(),ne=Object.values(V).length>0,re=ze(()=>Object.entries(V).filter(([,e])=>e.isTest===a).reduce((e,[t,{phone:n}])=>(n&&(e[n]=Number(t)),e),{}),[V,a]),ie=A?`+${A.countryCode} ${N||``}`:N,ae=ie&&ie.replace(/[^\d]+/g,``).length>=Kn;W(()=>{me||T.current.focus()},[A]),W(()=>{D&&!_&&c()},[D,_]),W(()=>{D&&l({langCode:i})},[D,i]),W(()=>{_&&r&&!A&&!F&&M(ve(r,_))},[A,_,F,r]);let se=U(e=>{e.length||P(``);let t=r&&Xe(r,e),n=!A||t&&t.iso2!==A.iso2||!t&&e.length?t:A;(!A||!n||n&&n.iso2!==A.iso2)&&M(n),P(ct(e,n))}),ce=U(()=>{B(),gt(E,()=>{te(),f({language:E})})});W(()=>{N===void 0&&h&&se(h)},[h,N,se]),n(()=>{T.current&&L&&T.current.setSelectionRange(...L)},[L]);let le=j(!1),ue=U(()=>{le.current=!0,oe(()=>{le.current=!1})}),de=U(()=>{Ln()}),fe=U(e=>{M(e),P(``)}),pe=U(e=>{y&&u(),qn||(qn=!0,In(),x(Gn));let{value:t,selectionStart:n,selectionEnd:r}=e.target;R(n&&r&&r<t.length?[n,r]:void 0),ee(!0);let i=O&&A&&ie!==void 0&&t.length-ie.length>1&&!le.current;se(i?`${A.countryCode} ${t}`:t)}),H=U(e=>{s({value:e.target.checked})});function he(e){if(e.preventDefault(),v)return;let t=ie?.replace(/[^\d]/g,``);if(t&&re[t]){window.location.replace(rt(re[t]));return}ae&&o({phoneNumber:ie})}let ge=U(()=>{d()}),_e=U(()=>{p()}),ye=m===`authorizationStateWaitPhoneNumber`;return J(`div`,{id:`auth-phone-number-form`,className:`custom-scroll`,children:[ne&&K(q,{size:`smaller`,round:!0,color:`translucent`,className:`auth-close`,iconName:`close`,onClick:de}),J(`div`,{className:`auth-form`,children:[K(`div`,{id:`logo`}),K(`h1`,{children:w(`AuthTitle`)}),K(`p`,{className:`note`,children:w(`StartText`)}),J(`form`,{className:`form`,action:``,onSubmit:he,children:[K(Wn,{id:`sign-in-phone-code`,value:A,isLoading:!_&&!A,onChange:fe}),K(ke,{ref:T,id:`sign-in-phone-number`,label:w(`LoginPhonePlaceholder`),value:ie,error:y&&w.withRegular(y),inputMode:`tel`,onChange:pe,onPaste:O?ue:void 0}),K(nt,{id:`sign-in-keep-session`,label:w(`AuthKeepSignedIn`),checked:!!b,onChange:H}),ae&&(ye?K(q,{className:`auth-button`,type:`submit`,ripple:!0,isLoading:v,children:w(`LoginNext`)}):K(vt,{})),ye&&K(q,{className:`auth-button`,isText:!0,ripple:!0,isLoading:S,onClick:ge,children:w(`LoginQRLogin`)}),C&&K(q,{className:`auth-button`,isText:!0,onClick:_e,children:w(`LoginPasskey`)}),E&&E!==i&&k&&K(q,{className:`auth-button`,isText:!0,isLoading:z,onClick:ce,children:k})]})]})]})})),Yn=`tg://login?token=`,Xn=280,Zn=54,Qn;function $n(){return Qn||=ut(()=>import(`./qr-code-styling-hwPyLIAV.js`).then(t=>e(t.default,1)),__vite__mapDeps([8,1]),import.meta.url),Qn}var er=V(Ke(e=>{let{connectionState:t,auth:n}=e,{language:r}=ht(e);return{connectionState:t,auth:n,language:r}})(({connectionState:e,auth:t,language:r})=>{let{returnToAuthPhoneNumber:i,setSharedSettingOption:a,loginWithPasskey:o}=G(),{state:s,qrCode:c,passkeyOption:l}=t,u=Rn(),d=tt(),f=j(),p=e===`connectionStateReady`,m=zn(`AuthContinueOnThisLanguage`,u),[h,_,v]=g(),[y,b,x]=g(),S=Vt(),C=Object.values(S).length>0,{result:w}=Ue(async()=>{let e=(await $n()).default;return new e({width:Xn,height:Xn,image:dt,margin:10,type:`svg`,dotsOptions:{type:`rounded`},cornersSquareOptions:{type:`extra-rounded`},imageOptions:{imageSize:.4,margin:8},qrOptions:{errorCorrectionLevel:`M`}})},[]),T=kt(y);n(()=>{if(!c||!w)return()=>{x()};if(!p)return;let e=f.current,t=`${Yn}${c.token}`;w.update({data:t}),y||(w.append(e),b())},[p,c,y,w]);let E=U(()=>{Ln()}),D=U(()=>{_(),gt(u,()=>{v(),a({language:u})})}),O=U(()=>{i()}),k=U(()=>{o()}),A=s===`authorizationStateWaitQrCode`;return J(`div`,{id:`auth-qr-form`,className:`custom-scroll`,children:[C&&K(q,{size:`smaller`,round:!0,color:`translucent`,className:`auth-close`,iconName:`close`,onClick:E}),J(`div`,{className:`auth-form qr`,children:[J(`div`,{className:`qr-outer`,children:[J(`div`,{className:H(`qr-inner`,T),children:[K(`div`,{className:`qr-container`,ref:f,style:`width: ${Xn}px; height: ${Xn}px`},`qr-container`),K(Mt,{tgsUrl:Pt.QrPlane,size:Zn,className:`qr-plane`,nonInteractive:!0,noLoop:!1})]},`qr-inner`),!y&&K(`div`,{className:`qr-loading`,children:K(vt,{})})]}),K(`h1`,{children:d(`LoginQRTitle`)}),J(`ol`,{children:[K(`li`,{children:K(`span`,{children:d(`LoginQRHelp1`)})}),K(`li`,{children:K(`span`,{children:d(`LoginQRHelp2`,void 0,{withNodes:!0,withMarkdown:!0})})}),K(`li`,{children:K(`span`,{children:d(`LoginQRHelp3`)})})]}),A&&K(q,{className:`auth-button`,isText:!0,onClick:O,children:d(`LoginQRCancel`)}),l&&K(q,{className:`auth-button`,isText:!0,onClick:k,children:d(`LoginPasskey`)}),u&&u!==r&&m&&K(q,{className:`auth-button`,isText:!0,isLoading:h,onClick:D,children:m})]})]})})),tr=()=>K(ye(Ze.Auth,`AuthRegister`)||vt,{}),nr=V(Ke(e=>({authState:e.auth.state}))(({authState:e})=>{let{returnToAuthPhoneNumber:t,goToAuthQrCode:n}=G(),r=Ye===`iOS`||Ye===`Android`;he({isActive:!r&&e===`authorizationStateWaitPhoneNumber`||r&&e===`authorizationStateWaitQrCode`,onBack:()=>{r?t():n()}});let i=M(e===`authorizationStateReady`?void 0:e,!0);function a(){switch(i){case`authorizationStateWaitCode`:return K(Nn,{});case`authorizationStateWaitPassword`:return K(Pn,{});case`authorizationStateWaitRegistration`:return K(tr,{});case`authorizationStateWaitPhoneNumber`:return K(Jn,{});case`authorizationStateWaitQrCode`:return K(er,{});default:return K(r?Jn:er,{})}}function o(){switch(i){case`authorizationStateWaitCode`:return 0;case`authorizationStateWaitPassword`:return 1;case`authorizationStateWaitRegistration`:return 2;case`authorizationStateWaitPhoneNumber`:return 3;case`authorizationStateWaitQrCode`:return 4;default:return r?3:4}}return K(ie,{activeKey:o(),name:`fade`,className:`Auth`,"data-tauri-drag-region":Me&&R?!0:void 0,children:a()})})),Y=Uint8Array,rr=Uint16Array,ir=Int32Array,ar=new Y([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),or=new Y([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),sr=new Y([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),cr=function(e,t){for(var n=new rr(31),r=0;r<31;++r)n[r]=t+=1<<e[r-1];for(var i=new ir(n[30]),r=1;r<30;++r)for(var a=n[r];a<n[r+1];++a)i[a]=a-n[r]<<5|r;return{b:n,r:i}},lr=cr(ar,2),ur=lr.b,dr=lr.r;ur[28]=258,dr[258]=28;var fr=cr(or,0);fr.b;for(var pr=fr.r,mr=new rr(32768),X=0;X<32768;++X){var hr=(X&43690)>>1|(X&21845)<<1;hr=(hr&52428)>>2|(hr&13107)<<2,hr=(hr&61680)>>4|(hr&3855)<<4,mr[X]=((hr&65280)>>8|(hr&255)<<8)>>1}for(var gr=(function(e,t,n){for(var r=e.length,i=0,a=new rr(t);i<r;++i)e[i]&&++a[e[i]-1];var o=new rr(t);for(i=1;i<t;++i)o[i]=o[i-1]+a[i-1]<<1;var s;if(n){s=new rr(1<<t);var c=15-t;for(i=0;i<r;++i)if(e[i])for(var l=i<<4|e[i],u=t-e[i],d=o[e[i]-1]++<<u,f=d|(1<<u)-1;d<=f;++d)s[mr[d]>>c]=l}else for(s=new rr(r),i=0;i<r;++i)e[i]&&(s[i]=mr[o[e[i]-1]++]>>15-e[i]);return s}),_r=new Y(288),X=0;X<144;++X)_r[X]=8;for(var X=144;X<256;++X)_r[X]=9;for(var X=256;X<280;++X)_r[X]=7;for(var X=280;X<288;++X)_r[X]=8;for(var vr=new Y(32),X=0;X<32;++X)vr[X]=5;var yr=gr(_r,9,0),br=gr(vr,5,0),xr=function(e){return(e+7)/8|0},Sr=function(e,t,n){return(t==null||t<0)&&(t=0),(n==null||n>e.length)&&(n=e.length),new Y(e.subarray(t,n))},Cr=[`unexpected EOF`,`invalid block type`,`invalid length/literal`,`invalid distance`,`stream finished`,`no stream handler`,,`no callback`,`invalid UTF-8 data`,`extra field too long`,`date not in range 1980-2099`,`filename too long`,`stream finishing`,`invalid zip data`],wr=function(e,t,n){var r=Error(t||Cr[e]);if(r.code=e,Error.captureStackTrace&&Error.captureStackTrace(r,wr),!n)throw r;return r},Tr=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8},Er=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8,e[r+2]|=n>>16},Dr=function(e,t){for(var n=[],r=0;r<e.length;++r)e[r]&&n.push({s:r,f:e[r]});var i=n.length,a=n.slice();if(!i)return{t:Pr,l:0};if(i==1){var o=new Y(n[0].s+1);return o[n[0].s]=1,{t:o,l:1}}n.sort(function(e,t){return e.f-t.f}),n.push({s:-1,f:25001});var s=n[0],c=n[1],l=0,u=1,d=2;for(n[0]={s:-1,f:s.f+c.f,l:s,r:c};u!=i-1;)s=n[n[l].f<n[d].f?l++:d++],c=n[l!=u&&n[l].f<n[d].f?l++:d++],n[u++]={s:-1,f:s.f+c.f,l:s,r:c};for(var f=a[0].s,r=1;r<i;++r)a[r].s>f&&(f=a[r].s);var p=new rr(f+1),m=Or(n[u-1],p,0);if(m>t){var r=0,h=0,g=m-t,_=1<<g;for(a.sort(function(e,t){return p[t.s]-p[e.s]||e.f-t.f});r<i;++r){var v=a[r].s;if(p[v]>t)h+=_-(1<<m-p[v]),p[v]=t;else break}for(h>>=g;h>0;){var y=a[r].s;p[y]<t?h-=1<<t-p[y]++-1:++r}for(;r>=0&&h;--r){var b=a[r].s;p[b]==t&&(--p[b],++h)}m=t}return{t:new Y(p),l:m}},Or=function(e,t,n){return e.s==-1?Math.max(Or(e.l,t,n+1),Or(e.r,t,n+1)):t[e.s]=n},kr=function(e){for(var t=e.length;t&&!e[--t];);for(var n=new rr(++t),r=0,i=e[0],a=1,o=function(e){n[r++]=e},s=1;s<=t;++s)if(e[s]==i&&s!=t)++a;else{if(!i&&a>2){for(;a>138;a-=138)o(32754);a>2&&(o(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(o(i),--a;a>6;a-=6)o(8304);a>2&&(o(a-3<<5|8208),a=0)}for(;a--;)o(i);a=1,i=e[s]}return{c:n.subarray(0,r),n:t}},Ar=function(e,t){for(var n=0,r=0;r<t.length;++r)n+=e[r]*t[r];return n},jr=function(e,t,n){var r=n.length,i=xr(t+2);e[i]=r&255,e[i+1]=r>>8,e[i+2]=e[i]^255,e[i+3]=e[i+1]^255;for(var a=0;a<r;++a)e[i+a+4]=n[a];return(i+4+r)*8},Mr=function(e,t,n,r,i,a,o,s,c,l,u){Tr(t,u++,n),++i[256];for(var d=Dr(i,15),f=d.t,p=d.l,m=Dr(a,15),h=m.t,g=m.l,_=kr(f),v=_.c,y=_.n,b=kr(h),x=b.c,S=b.n,C=new rr(19),w=0;w<v.length;++w)++C[v[w]&31];for(var w=0;w<x.length;++w)++C[x[w]&31];for(var T=Dr(C,7),E=T.t,D=T.l,O=19;O>4&&!E[sr[O-1]];--O);var k=l+5<<3,A=Ar(i,_r)+Ar(a,vr)+o,j=Ar(i,f)+Ar(a,h)+o+14+3*O+Ar(C,E)+2*C[16]+3*C[17]+7*C[18];if(c>=0&&k<=A&&k<=j)return jr(t,u,e.subarray(c,c+l));var M,N,P,F;if(Tr(t,u,1+(j<A)),u+=2,j<A){M=gr(f,p,0),N=f,P=gr(h,g,0),F=h;var ee=gr(E,D,0);Tr(t,u,y-257),Tr(t,u+5,S-1),Tr(t,u+10,O-4),u+=14;for(var w=0;w<O;++w)Tr(t,u+3*w,E[sr[w]]);u+=3*O;for(var I=[v,x],L=0;L<2;++L)for(var R=I[L],w=0;w<R.length;++w){var z=R[w]&31;Tr(t,u,ee[z]),u+=E[z],z>15&&(Tr(t,u,R[w]>>5&127),u+=R[w]>>12)}}else M=yr,N=_r,P=br,F=vr;for(var w=0;w<s;++w){var B=r[w];if(B>255){var z=B>>18&31;Er(t,u,M[z+257]),u+=N[z+257],z>7&&(Tr(t,u,B>>23&31),u+=ar[z]);var te=B&31;Er(t,u,P[te]),u+=F[te],te>3&&(Er(t,u,B>>5&8191),u+=or[te])}else Er(t,u,M[B]),u+=N[B]}return Er(t,u,M[256]),u+N[256]},Nr=new ir([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),Pr=new Y(0),Fr=function(e,t,n,r,i,a){var o=a.z||e.length,s=new Y(r+o+5*(1+Math.ceil(o/7e3))+i),c=s.subarray(r,s.length-i),l=a.l,u=(a.r||0)&7;if(t){u&&(c[0]=a.r>>3);for(var d=Nr[t-1],f=d>>13,p=d&8191,m=(1<<n)-1,h=a.p||new rr(32768),g=a.h||new rr(m+1),_=Math.ceil(n/3),v=2*_,y=function(t){return(e[t]^e[t+1]<<_^e[t+2]<<v)&m},b=new ir(25e3),x=new rr(288),S=new rr(32),C=0,w=0,T=a.i||0,E=0,D=a.w||0,O=0;T+2<o;++T){var k=y(T),A=T&32767,j=g[k];if(h[A]=j,g[k]=A,D<=T){var M=o-T;if((C>7e3||E>24576)&&(M>423||!l)){u=Mr(e,c,0,b,x,S,w,E,O,T-O,u),E=C=w=0,O=T;for(var N=0;N<286;++N)x[N]=0;for(var N=0;N<30;++N)S[N]=0}var P=2,F=0,ee=p,I=A-j&32767;if(M>2&&k==y(T-I))for(var L=Math.min(f,M)-1,R=Math.min(32767,T),z=Math.min(258,M);I<=R&&--ee&&A!=j;){if(e[T+P]==e[T+P-I]){for(var B=0;B<z&&e[T+B]==e[T+B-I];++B);if(B>P){if(P=B,F=I,B>L)break;for(var te=Math.min(I,B-2),V=0,N=0;N<te;++N){var ne=T-I+N&32767,re=ne-h[ne]&32767;re>V&&(V=re,j=ne)}}}A=j,j=h[A],I+=A-j&32767}if(F){b[E++]=268435456|dr[P]<<18|pr[F];var ie=dr[P]&31,ae=pr[F]&31;w+=ar[ie]+or[ae],++x[257+ie],++S[ae],D=T+P,++C}else b[E++]=e[T],++x[e[T]]}}for(T=Math.max(T,D);T<o;++T)b[E++]=e[T],++x[e[T]];u=Mr(e,c,l,b,x,S,w,E,O,T-O,u),l||(a.r=u&7|c[u/8|0]<<3,u-=7,a.h=g,a.p=h,a.i=T,a.w=D)}else{for(var T=a.w||0;T<o+l;T+=65535){var oe=T+65535;oe>=o&&(c[u/8|0]=l,oe=o),u=jr(c,u+1,e.subarray(T,oe))}a.i=o}return Sr(s,0,r+xr(u)+i)},Ir=(function(){for(var e=new Int32Array(256),t=0;t<256;++t){for(var n=t,r=9;--r;)n=(n&1&&-306674912)^n>>>1;e[t]=n}return e})(),Lr=function(){var e=-1;return{p:function(t){for(var n=e,r=0;r<t.length;++r)n=Ir[n&255^t[r]]^n>>>8;e=n},d:function(){return~e}}},Rr=function(e,t,n,r,i){if(!i&&(i={l:1},t.dictionary)){var a=t.dictionary.subarray(-32768),o=new Y(a.length+e.length);o.set(a),o.set(e,a.length),e=o,i.w=a.length}return Fr(e,t.level==null?6:t.level,t.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+t.mem,n,r,i)},zr=function(e,t){var n={};for(var r in e)n[r]=e[r];for(var r in t)n[r]=t[r];return n},Z=function(e,t,n){for(;n;++t)e[t]=n,n>>>=8};function Br(e,t){return Rr(e,t||{},0,0)}var Vr=function(e,t,n,r){for(var i in e){var a=e[i],o=t+i,s=r;Array.isArray(a)&&(s=zr(r,a[1]),a=a[0]),ArrayBuffer.isView(a)?n[o]=[a,s]:(n[o+=`/`]=[new Y(0),s],Vr(a,o,n,r))}},Hr=typeof TextEncoder<`u`&&new TextEncoder,Ur=typeof TextDecoder<`u`&&new TextDecoder;try{Ur.decode(Pr,{stream:!0})}catch{}function Wr(e,t){if(t){for(var n=new Y(e.length),r=0;r<e.length;++r)n[r]=e.charCodeAt(r);return n}if(Hr)return Hr.encode(e);for(var i=e.length,a=new Y(e.length+(e.length>>1)),o=0,s=function(e){a[o++]=e},r=0;r<i;++r){if(o+5>a.length){var c=new Y(o+8+(i-r<<1));c.set(a),a=c}var l=e.charCodeAt(r);l<128||t?s(l):l<2048?(s(192|l>>6),s(128|l&63)):l>55295&&l<57344?(l=65536+(l&1047552)|e.charCodeAt(++r)&1023,s(240|l>>18),s(128|l>>12&63),s(128|l>>6&63),s(128|l&63)):(s(224|l>>12),s(128|l>>6&63),s(128|l&63))}return Sr(a,0,o)}var Gr=function(e){var t=0;if(e)for(var n in e){var r=e[n].length;r>65535&&wr(9),t+=r+4}return t},Kr=function(e,t,n,r,i,a,o,s){var c=r.length,l=n.extra,u=s&&s.length,d=Gr(l);Z(e,t,o==null?67324752:33639248),t+=4,o!=null&&(e[t++]=20,e[t++]=n.os),e[t]=20,t+=2,e[t++]=n.flag<<1|(a<0&&8),e[t++]=i&&8,e[t++]=n.compression&255,e[t++]=n.compression>>8;var f=new Date(n.mtime==null?Date.now():n.mtime),p=f.getFullYear()-1980;if((p<0||p>119)&&wr(10),Z(e,t,p<<25|f.getMonth()+1<<21|f.getDate()<<16|f.getHours()<<11|f.getMinutes()<<5|f.getSeconds()>>1),t+=4,a!=-1&&(Z(e,t,n.crc),Z(e,t+4,a<0?-a-2:a),Z(e,t+8,n.size)),Z(e,t+12,c),Z(e,t+14,d),t+=16,o!=null&&(Z(e,t,u),Z(e,t+6,n.attrs),Z(e,t+10,o),t+=14),e.set(r,t),t+=c,d)for(var m in l){var h=l[m],g=h.length;Z(e,t,+m),Z(e,t+2,g),e.set(h,t+4),t+=4+g}return u&&(e.set(s,t),t+=u),t},qr=function(e,t,n,r,i){Z(e,t,101010256),Z(e,t+8,n),Z(e,t+10,n),Z(e,t+12,r),Z(e,t+16,i)};function Jr(e,t){t||={};var n={},r=[];Vr(e,``,n,t);var i=0,a=0;for(var o in n){var s=n[o],c=s[0],l=s[1],u=l.level==0?0:8,d=Wr(o),f=d.length,p=l.comment,m=p&&Wr(p),h=m&&m.length,g=Gr(l.extra);f>65535&&wr(11);var _=u?Br(c,l):c,v=_.length,y=Lr();y.p(c),r.push(zr(l,{size:c.length,crc:y.d(),c:_,f:d,m,u:f!=o.length||m&&p.length!=h,o:i,compression:u})),i+=30+f+g+v,a+=76+2*(f+g)+(h||0)+v}for(var b=new Y(a+22),x=i,S=a-i,C=0;C<r.length;++C){var d=r[C];Kr(b,d.o,d,d.f,d.u,d.c.length);var w=30+d.f.length+Gr(d.extra);b.set(d.c,d.o+w),Kr(b,i,d,d.f,d.u,d.c.length,d.o,d.m),i+=16+w+(d.m?d.m.length:0)}return qr(b,i,r.length,S,x),b}var Q={modal:`y0fjrMGR`,container:`cjCItgv9`,description:`OzfjLh6L`,optionsSection:`iUe4mLjo`,sectionHeader:`v2duXS6q`,rangeSelector:`l18waSTN`,rangeButton:`enZbcoe6`,rangeButtonActive:`cGd2-4bp`,dateContainer:`_8LtzfcIh`,slideDown:`sjK1ffUy`,dateField:`gu1CveG5`,dateLabel:`jAAsrs6m`,dateInput:`ajyqkmsb`,checkboxes:`iYIPwgJZ`,progressContainer:`-jNGq5bf`,progressLabel:`ZFWxA4QW`,progressBar:`MjzfMlJh`,progressFill:`nbFZlZ0c`,statusLog:`e2eIKms2`,errorBanner:`_1wu8hgoX`};function Yr(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var Xr=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="plane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#bg-grad)" stroke="url(#accent-grad)" stroke-width="1.5"/>
  <circle cx="60" cy="60" r="38" fill="#172554" opacity="0.3" filter="url(#glow)"/>
  <g transform="translate(18, 16)">
    <path d="M72.26 21.05L21.72 40.54C18.28 41.87 18.3 43.78 21.09 44.64L34.05 48.68L64.04 29.77C65.46 28.91 66.75 29.37 65.68 30.32L41.38 52.26L40.44 65.5C41.74 65.5 42.31 64.9 43.04 64.2L49.28 58.13L62.24 67.7C64.63 69.02 66.35 68.34 66.95 65.48L75.44 25.43C76.31 21.87 74.06 20.25 72.26 21.05Z" fill="url(#plane-grad)"/>
    <path d="M40.44 65.5L42.2 59.8L34.05 48.68L40.44 65.5Z" fill="#1d4ed8" opacity="0.6"/>
  </g>
</svg>`,Zr=`:root {
  --bg-color: #0e1621;
  --bg-sidebar: #17212b;
  --bg-header: #242f3d;
  --bg-message-received: #182533;
  --bg-message-sent: #2b5278;
  --border-color: #101921;
  --text-primary: #f5f5f5;
  --text-secondary: #7f91a4;
  --text-sent: #fff;
  --accent-color: #5288c1;
  --accent-hover: #6299d1;
  --danger-color: #e53935;
  --transition-speed: 0.2s;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.5;
  height: 100vh;
  overflow: hidden;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}

.app-header {
  background-color: var(--bg-header);
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-logo {
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 2px 8px rgba(6, 182, 212, 0.4));
}

.chat-info h1 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.chat-info .subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

#search-input {
  width: 100%;
  padding: 10px 16px 10px 42px;
  background-color: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color var(--transition-speed);
}

#search-input:focus {
  border-color: var(--accent-color);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  background-color: var(--bg-sidebar);
  padding: 4px;
  border-radius: 20px;
}

.filter-tab {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.filter-tab:hover {
  color: var(--text-primary);
}

.filter-tab.active {
  background-color: var(--accent-color);
  color: var(--text-sent);
}

.chat-viewport {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;
  background-image: radial-gradient(circle at 50% 50%, #1c2738 0%, var(--bg-color) 100%);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.message-row {
  display: flex;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-row.sent {
  justify-content: flex-end;
}

.message-row.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

.message-row.sent .message-bubble {
  background-color: var(--bg-message-sent);
  color: var(--text-sent);
  border-bottom-right-radius: 4px;
}

.message-row.received .message-bubble {
  background-color: var(--bg-message-received);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.sender-name {
  font-size: 13px;
  color: var(--accent-color);
  font-weight: 600;
  margin-bottom: 4px;
}

.message-row.sent .sender-name {
  color: #a4c7ec;
}

.message-text {
  font-size: 14.5px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-meta {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: right;
  margin-top: 6px;
}

.message-row.sent .message-meta {
  color: rgba(255, 255, 255, 0.65);
}

.media-container {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
}

img, video {
  max-width: 100%;
  border-radius: 8px;
  max-height: 320px;
  object-fit: cover;
  transition: transform var(--transition-speed);
}

img:hover {
  transform: scale(1.02);
}

audio {
  width: 100%;
  margin-top: 6px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.25);
  padding: 12px;
  border-radius: 10px;
  margin-top: 8px;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(255,255,255,0.05);
  transition: background var(--transition-speed);
}

.file-card:hover {
  background: rgba(0, 0, 0, 0.35);
}

.file-icon {
  font-size: 28px;
  background-color: var(--accent-color);
  padding: 8px;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 13.5px;
  font-weight: 500;
  word-break: break-all;
}

.file-size {
  font-size: 11.5px;
  color: var(--text-secondary);
}

.message-row.sent .file-size {
  color: rgba(255, 255, 255, 0.7);
}

.chat-viewport::-webkit-scrollbar {
  width: 8px;
}

.chat-viewport::-webkit-scrollbar-track {
  background: transparent;
}

.chat-viewport::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.chat-viewport::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 16px;
  text-align: center;
}
`,Qr=`document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const messageRows = document.querySelectorAll('.message-row');
  const messagesList = document.getElementById('messages-list');

  let activeFilter = 'all';
  let searchQuery = '';

  const noResultsEl = document.createElement('div');
  noResultsEl.className = 'no-messages';
  noResultsEl.textContent = 'No messages match your criteria.';
  noResultsEl.style.display = 'none';
  messagesList.appendChild(noResultsEl);

  function applyFilters() {
    let visibleCount = 0;

    messageRows.forEach(row => {
      const textContent = (row.querySelector('.message-text')?.textContent || '').toLowerCase();
      const senderName = (row.querySelector('.sender-name')?.textContent || '').toLowerCase();
      const hasMedia = row.querySelector('.media-container, .file-card') !== null;

      const matchesSearch = textContent.includes(searchQuery) || senderName.includes(searchQuery);

      let matchesType = true;
      if (activeFilter === 'text') {
        matchesType = !hasMedia && textContent.trim().length > 0;
      } else if (activeFilter === 'media') {
        matchesType = hasMedia;
      }

      if (matchesSearch && matchesType) {
        row.style.display = 'flex';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (visibleCount === 0) {
      noResultsEl.style.display = 'flex';
    } else {
      noResultsEl.style.display = 'none';
    }
  }

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      applyFilters();
    });
  });
});
`,$r=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clashgram Chat Export: CHAT_TITLE</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="app-layout">
    <header class="app-header">
      <div class="logo-container">
        <img class="app-logo" src="assets/logo.svg" alt="Clashgram Logo">
        <div class="chat-info">
          <h1>CHAT_TITLE</h1>
          <p class="subtitle">Chat Export • MSG_COUNT Messages</p>
        </div>
      </div>
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" id="search-input" placeholder="Search messages...">
        </div>
        <div class="filter-tabs">
          <button class="filter-tab active" data-filter="all">{lang('ClashgramExportRangeAll')}</button>
          <button class="filter-tab" data-filter="text">Text</button>
          <button class="filter-tab" data-filter="media">Media</button>
        </div>
      </div>
    </header>
    
    <main class="chat-viewport">
      <div class="messages-list" id="messages-list">
        <!-- MESSAGES_HTML -->
      </div>
    </main>
  </div>
  <script src="js/app.js" defer><\/script>
</body>
</html>
`;function ei(e,t,n){let r=t.senderId,i=e.currentUserId?e.users.byId[e.currentUserId]:void 0;if(t.isOutgoing){if(i){let e=[i.firstName,i.lastName].filter(Boolean).join(` `);return e?`You (${e})`:`You`}return`You`}if(!r)return n.title||`Unknown Chat`;let a=e.users.byId[r];if(a)return[a.firstName,a.lastName].filter(Boolean).join(` `)||(a.username?`@${a.username}`:`User ${r}`);let o=e.chats.byId[r];return o?o.title||`Chat ${r}`:`User ${r}`}function ti(e){if(e===void 0||e===0)return`0 Bytes`;let t=1024,n=[`Bytes`,`KB`,`MB`,`GB`],r=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/t**r).toFixed(2))+` `+n[r]}function ni({isOpen:e,chatId:t,chat:n}){let{closeClashgramExportModal:r}=G(),i=tt(),[a,o]=I(`html`),[c,l]=I(!0),[u,d]=I(!0),[f,p]=I(!0),[m,h]=I(!0),[g,v]=I(!0),[y,b]=I(!0),[x,S]=I(`all`),[C,T]=I(``),[E,D]=I(``),[O,k]=I(``),[A,M]=I(!1),[N,P]=I(``),[F,ee]=I(0),[L,R]=I(``),z=j(!1);if(W(()=>{e&&(M(!1),P(``),ee(0),R(``),z.current=!1,S(`all`),T(``),D(``),k(``))},[e]),!e||!n)return null;let B=e=>{R(t=>t+`[${new Date().toLocaleTimeString()}] ${e}\n`)};return K(de,{isOpen:e,onClose:r,className:H(Q.modal,`narrow`),title:i(`ClashgramExportTitle`),children:J(`div`,{className:Q.container,children:[K(`p`,{className:Q.description,children:i(`ClashgramExportDesc`)}),!A&&F!==100&&J(ge,{children:[O&&J(`div`,{className:Q.errorBanner,children:[`⚠️ `,O]}),J(`div`,{className:Q.optionsSection,children:[K(`h4`,{className:Q.sectionHeader,children:i(`ClashgramExportRange`)}),J(`div`,{className:Q.rangeSelector,children:[K(`button`,{type:`button`,className:H(Q.rangeButton,x===`50`&&Q.rangeButtonActive),onClick:()=>{S(`50`),k(``)},children:i(`ClashgramExportRange50`)}),K(`button`,{type:`button`,className:H(Q.rangeButton,x===`100`&&Q.rangeButtonActive),onClick:()=>{S(`100`),k(``)},children:i(`ClashgramExportRange100`)}),K(`button`,{type:`button`,className:H(Q.rangeButton,x===`all`&&Q.rangeButtonActive),onClick:()=>{S(`all`),k(``)},children:`All`}),K(`button`,{type:`button`,className:H(Q.rangeButton,x===`date`&&Q.rangeButtonActive),onClick:()=>{S(`date`),k(``)},children:i(`ClashgramExportRangeDate`)})]})]}),x===`date`&&J(`div`,{className:Q.dateContainer,children:[J(`div`,{className:Q.dateField,children:[K(`label`,{className:Q.dateLabel,children:i(`ClashgramExportStartDate`)}),K(`input`,{type:`date`,className:Q.dateInput,value:C,onChange:e=>{T(e.target.value),k(``)}})]}),J(`div`,{className:Q.dateField,children:[K(`label`,{className:Q.dateLabel,children:i(`ClashgramExportEndDate`)}),K(`input`,{type:`date`,className:Q.dateInput,value:E,onChange:e=>{D(e.target.value),k(``)}})]})]}),J(`div`,{className:Q.optionsSection,children:[K(`h4`,{className:Q.sectionHeader,children:i(`ClashgramExportFormat`)}),K(w,{name:`export-format`,options:[{label:i(`ClashgramExportFormatHtml`),value:`html`},{label:i(`ClashgramExportFormatJson`),value:`json`}],selected:a,onChange:e=>o(e)})]}),J(`div`,{className:Q.optionsSection,children:[K(`h4`,{className:Q.sectionHeader,children:i(`ClashgramExportMedia`)}),J(`div`,{className:Q.checkboxes,children:[K(nt,{label:i(`ClashgramExportMediaPhotos`),checked:c,onCheck:l}),K(nt,{label:i(`ClashgramExportMediaVideos`),checked:u,onCheck:d}),K(nt,{label:i(`ClashgramExportMediaAudios`),checked:f,onCheck:p}),K(nt,{label:i(`ClashgramExportMediaVoices`),checked:m,onCheck:h}),K(nt,{label:i(`ClashgramExportMediaStickers`),checked:g,onCheck:v}),K(nt,{label:i(`ClashgramExportMediaDocs`),checked:y,onCheck:b})]})]})]}),(A||F>0)&&J(`div`,{className:Q.progressContainer,children:[K(`span`,{className:Q.progressLabel,children:N}),K(`div`,{className:Q.progressBar,children:K(`div`,{className:Q.progressFill,style:`width: ${F}%`})}),K(`pre`,{className:Q.statusLog,children:L})]}),K(`div`,{className:`dialog-buttons mt-4`,children:A?K(q,{type:`button`,color:`danger`,onClick:()=>{z.current=!0,P(i(`ClashgramExportProgressAborted`)),M(!1),B(`Export aborted by user.`)},children:i(`ClashgramExportButtonCancel`)}):J(ge,{children:[K(q,{type:`button`,color:`translucent`,onClick:()=>r(),children:i(`ClashgramExportButtonClose`)}),K(q,{type:`button`,color:`primary`,onClick:async()=>{if(k(``),x===`date`){if(!C||!E){k(i(`ClashgramExportErrBothDates`));return}if(new Date(C)>new Date(E)){k(i(`ClashgramExportErrDateRange`));return}}M(!0),z.current=!1,ee(5),P(i(`ClashgramExportProgressFetch`)),B(`Starting export for chat: ${n.title}`);try{let e=0,t=[],r=new Set,o=C?Math.floor(new Date(C).getTime()/1e3):0,l=E?Math.floor(new Date(E).getTime()/1e3)+86399:1/0;for(B(i(`ClashgramExportProgressHistory`));!z.current;){let a=await s(`fetchMessages`,{chat:n,threadId:-1,offsetId:e,limit:100});if(!a||!a.messages||a.messages.length===0)break;let c=0,u=!1;for(let e of a.messages)if(!r.has(e.id)){if(r.add(e.id),x===`date`){if(e.date<o){u=!0;continue}if(e.date>l)continue}t.push(e),c++}if(u){B(`Reached specified start date limit.`);break}if(c===0)break;if(x===`50`&&t.length>=50){t=t.slice(0,50);break}if(x===`100`&&t.length>=100){t=t.slice(0,100);break}P(`${i(`ClashgramExportProgressHistory`)} ${t.length}...`),e=a.messages[a.messages.length-1].id,await new Promise(e=>setTimeout(e,50))}if(z.current){B(`Export cancelled by user.`),M(!1);return}B(`Fetched ${t.length} total messages.`),ee(30),P(i(`ClashgramExportProgressMedia`));let d={},p={},h=Te(),v=0,b=t.filter(e=>{let t=pt(h,e);return t?!!(t.mediaType===`photo`&&c||t.mediaType===`video`&&(t.isRound&&m||!t.isRound&&!t.isGif&&u||t.isGif&&u)||t.mediaType===`audio`&&f||t.mediaType===`voice`&&m||t.mediaType===`sticker`&&g||t.mediaType===`document`&&y):!1});B(`Found ${b.length} messages containing media to download.`);let S=0;if(await(async e=>{let t=[];for(let n of e){if(z.current)break;let e=n().then(()=>{t.splice(t.indexOf(e),1)});t.push(e),t.length>=5&&await Promise.race(t)}await Promise.all(t)})(b.map(e=>async()=>{if(z.current)return;let t=pt(h,e),n=_(t,`download`);if(n){B(`Downloading media for message ID ${e.id}...`);try{let r=await s(`downloadMedia`,{url:n,mediaFormat:st.BlobUrl});if(r&&r.dataBlob){let n=await(r.dataBlob instanceof Blob?r.dataBlob:new Blob([r.dataBlob])).arrayBuffer(),i=ae(t)||`media-${e.id}`,a=`${e.id}_${i}`;p[`media/${a}`]=new Uint8Array(n),d[e.id]=a,v++}}catch(t){B(`Error downloading media for msg ID ${e.id}: ${t}`)}}let r=++S;P(i(`ClashgramExportProgressMediaProgress`,{completed:r,total:b.length})),ee(Math.floor(30+r/b.length*50))})),z.current){B(`Export cancelled by user.`),M(!1);return}if(ee(80),P(i(`ClashgramExportProgressStructuring`)),B(`Downloaded ${v} media files.`),a===`json`){let e=t.map(e=>{let t={id:e.id,date:e.date,senderId:e.senderId,isOutgoing:e.isOutgoing,text:e.content.text?.text||``};return d[e.id]&&(t.media=`media/${d[e.id]}`),t}),n=JSON.stringify(e,null,2);p[`messages.json`]=new TextEncoder().encode(n)}else{p[`assets/logo.svg`]=new TextEncoder().encode(Xr),p[`css/style.css`]=new TextEncoder().encode(Zr),p[`js/app.js`]=new TextEncoder().encode(Qr);let e=``;for(let r=t.length-1;r>=0;r--){let i=t[r],a=i.isOutgoing?`sent`:`received`,o=ei(h,i,n),s=new Date(i.date*1e3).toLocaleString(),c=``;if(d[i.id]){let e=`media/${d[i.id]}`,t=pt(h,i);t&&(t.mediaType===`photo`?c=`<div class="media-container"><img src="${e}" /></div>`:t.mediaType===`video`?c=`<div class="media-container"><video src="${e}" controls></video></div>`:t.mediaType===`audio`||t.mediaType===`voice`?c=`<div class="media-container"><audio src="${e}" controls></audio></div>`:t.mediaType===`sticker`?c=`<div class="media-container"><img src="${e}" style="max-width:120px;" /></div>`:t.mediaType===`document`&&(c=`
                  <a href="${e}" download class="file-card">
                    <span class="file-icon">📁</span>
                    <div class="file-info">
                      <span class="file-name">${Yr(t.fileName||`Document`)}</span>
                      <span class="file-size">${ti(t.size)}</span>
                    </div>
                  </a>
                `))}let l=Yr(i.content.text?.text||``);e+=`
      <div class="message-row ${a}">
        <div class="message-bubble">
          <div class="sender-name">${Yr(o)}</div>
          ${l?`<div class="message-text">${l}</div>`:``}
          ${c}
          <div class="message-meta">${s}</div>
        </div>
      </div>`}let r=$r.replace(/CHAT_TITLE/g,()=>Yr(n.title)).replace(/MSG_COUNT/g,()=>String(t.length)).replace(/<!-- MESSAGES_HTML -->/,()=>e);p[`index.html`]=new TextEncoder().encode(r)}ee(90),P(i(`ClashgramExportProgressCompressing`)),B(i(`ClashgramExportProgressCompressing`));let w=Jr(p);ee(98),P(i(`ClashgramExportProgressTriggering`)),B(i(`ClashgramExportProgressTriggering`));let T=new Blob([w],{type:`application/zip`}),D=URL.createObjectURL(T),O=document.createElement(`a`);O.href=D,O.download=`Clashgram_Export_${n.title.replace(/\s+/g,`_`)}_${Date.now()}.zip`,document.body.appendChild(O),O.click(),document.body.removeChild(O),URL.revokeObjectURL(D),ee(100),P(i(`ClashgramExportProgressSuccess`)),B(i(`ClashgramExportProgressSuccess`))}catch(e){B(`Error during export: ${e}`),P(i(`ClashgramExportProgressFailed`))}finally{M(!1)}},children:i(`ClashgramExportButtonStart`)})]})})]})})}var ri=V(Ke(e=>{let t=N(e).clashgramExportModal,n=t?.chatId,r=n?i(e,n):void 0;return{isOpen:!!t?.isOpen,chatId:n,chat:r}})(ni)),$={modal:`g2DkJQyl`,buttonGroup:`CNlmA-C4`,container:`_3dwlC7Nq`,lockHeader:`qUviwp9m`,iconContainer:`Kpe40h71`,error:`RrBoFhol`,lockIcon:`rpURFURj`,iconRing:`_0EIhc3B4`,shake:`p0U-UNgw`,pulseRing:`EYIbAJwB`,title:`no2IjBcS`,description:`k0hhiTGY`,inputWrapper:`lDAgtCOf`,passcodeInput:`TryXvANJ`,dotsContainer:`_21EWB8Rr`,dotFilled:`dot0v2sy`,dot:`_05ryphhf`,dotActive:`CjexhuzX`,pulseCursor:`Ahl2Qbe2`,errorText:`M97Rrxz-`,fadeIn:`oORQ3Gdc`,forgotBtn:`_2BscDaxM`,warningIcon:`qoYyE0x3`};async function ii(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return Array.from(new Uint8Array(n)).map(e=>e.toString(16).padStart(2,`0`)).join(``)}function ai({isOpen:e,type:t,targetId:n,pendingAction:r}){let{closeClashgramPasscodeModal:i,openChat:a,setActiveChatFolder:o,signOut:s}=G(),c=tt(),[l,u]=I(``),[d,f]=I(!1),[p,m]=I(!1),[h,g]=I(!1),[_,v]=I(!1),[y,b]=I(!1),x=j();if(W(()=>{e&&(u(``),f(!1),m(!1),g(!1),v(!1),b(!1),x.current?.focus(),setTimeout(()=>{x.current?.focus()},100))},[e]),!e)return null;let S=()=>{if(t===`chat`&&n?nn().add(String(n)):t===`folder`&&n!==void 0&&tn().add(String(n)),i(),r){if(r.type===`openChat`)a(r.payload);else if(r.type===`setActiveChatFolder`)o(r.payload);else if(r.type===`clashgramUnlockChat`){let e=[];try{let t=JSON.parse(localStorage.getItem(`clashgramLockedChatIds`)||`[]`);Array.isArray(t)&&(e=t)}catch{}let t=e.filter(e=>e!==String(n));localStorage.setItem(`clashgramLockedChatIds`,JSON.stringify(t)),nn().delete(String(n)),G().setSharedSettingOption({})}else if(r.type===`clashgramUnlockFolder`){let e=[];try{let t=JSON.parse(localStorage.getItem(`clashgramLockedFolderIds`)||`[]`);Array.isArray(t)&&(e=t)}catch{}let t=e.filter(e=>e!==Number(n));localStorage.setItem(`clashgramLockedFolderIds`,JSON.stringify(t)),tn().delete(String(n)),G().setSharedSettingOption({})}}},C=async e=>{if(e&&e.preventDefault(),_)return;if(y){if(l.length<4){f(!0),m(!0),u(``),setTimeout(()=>{m(!1)},500);return}let e=await ii(l);localStorage.setItem(`clashgramPasscodeHash`,e),S();return}let t=h?localStorage.getItem(`clashgramRecoveryPasscodeHash`)||``:localStorage.getItem(`clashgramPasscodeHash`)||``;if(await ii(l)===t){if(h){b(!0),u(``),f(!1),setTimeout(()=>{x.current?.focus()},100);return}S()}else f(!0),m(!0),u(``),setTimeout(()=>{m(!1)},500)},w=()=>{i(),(t===`chat`?nn().has(String(n)):tn().has(String(n)))||(t===`chat`?a({id:void 0}):t===`folder`&&o({activeChatFolder:0}))};return K(de,{isOpen:e,onClose:w,className:H($.modal,`narrow`),noBackdropClose:!0,children:K(`form`,{onSubmit:C,className:$.container,onClick:e=>{e.target.tagName!==`BUTTON`&&x.current?.focus()},onTouchStart:e=>{e.target.tagName!==`BUTTON`&&x.current?.focus()},children:_?J(`div`,{className:$.lockHeader,children:[J(`div`,{className:H($.iconContainer,$.warningIcon),children:[K(`div`,{className:$.iconRing}),J(`svg`,{className:$.lockIcon,xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[K(`path`,{d:`M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z`}),K(`line`,{x1:`12`,y1:`9`,x2:`12`,y2:`13`}),K(`line`,{x1:`12`,y1:`17`,x2:`12.01`,y2:`17`})]})]}),K(`h2`,{className:$.title,children:c(`ClashgramPasscodeResetLogoutTitle`)}),K(`p`,{className:$.description,children:c(`ClashgramPasscodeResetLogoutDesc`)}),J(`div`,{className:$.buttonGroup,children:[K(q,{type:`button`,color:`translucent`,onClick:()=>{v(!1),u(``),f(!1),setTimeout(()=>{x.current?.focus()},100)},children:`Back`}),K(q,{type:`button`,color:`danger`,onClick:()=>{localStorage.removeItem(`clashgramPasscodeHash`),localStorage.removeItem(`clashgramRecoveryPasscodeHash`),localStorage.removeItem(`clashgramLockedChatIds`),localStorage.removeItem(`clashgramLockedFolderIds`),nn().clear(),tn().clear(),i(),s({forceInitApi:!0})},children:`Logout & Reset`})]})]}):J(ge,{children:[J(`div`,{className:$.lockHeader,children:[J(`div`,{className:H($.iconContainer,p&&$.shake,d&&$.error),children:[K(`div`,{className:$.iconRing}),J(`svg`,{className:$.lockIcon,xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[K(`rect`,{x:`3`,y:`11`,width:`18`,height:`11`,rx:`2`,ry:`2`}),K(`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`})]})]}),K(`h2`,{className:$.title,children:c(y?`ClashgramPasscodeResetPrimary`:h?`ClashgramPasscodeBypassLock`:t===`folder`?`ClashgramPasscodeUnlockFolder`:`ClashgramPasscodeUnlockChat`)}),K(`p`,{className:$.description,children:c(y?`ClashgramPasscodeRecoveryVerifiedSuccess`:h?`ClashgramPasscodeRecoveryBypassDesc`:t===`folder`?`ClashgramPasscodeFolderProtectedDesc`:`ClashgramPasscodeChatProtectedDesc`)})]}),J(`div`,{className:$.inputWrapper,children:[K(`input`,{ref:x,type:`text`,className:$.passcodeInput,style:{WebkitTextSecurity:`disc`,textSecurity:`disc`},autoComplete:`off`,autoCorrect:`off`,autoCapitalize:`off`,spellCheck:!1,value:l,onChange:e=>{f(!1),u(e.target.value)},maxLength:20,autoFocus:!0}),K(`div`,{className:H($.dotsContainer,p&&$.shake,d&&$.error),children:Array.from({length:Math.max(6,l.length)}).map((e,t)=>{let n=t<l.length,r=t===l.length;return K(`div`,{className:H($.dot,n&&$.dotFilled,r&&$.dotActive)},t)})})]}),d&&K(`p`,{className:$.errorText,children:c(y?`ClashgramPasscodeErrMinLength`:h?`ClashgramPasscodeErrIncorrectRecovery`:`ClashgramPasscodeErrIncorrectPrimary`)}),!y&&K(`button`,{type:`button`,className:$.forgotBtn,onClick:()=>{let e=!!localStorage.getItem(`clashgramRecoveryPasscodeHash`);!h&&e?(g(!0),u(``),f(!1),setTimeout(()=>{x.current?.focus()},100)):(v(!0),u(``),f(!1))},children:c(h?`ClashgramPasscodeForgotRecovery`:`ClashgramPasscodeForgot`)}),J(`div`,{className:$.buttonGroup,children:[K(q,{type:`button`,color:`translucent`,onClick:w,children:c(`ClashgramPasscodeButtonCancel`)}),K(q,{type:`submit`,color:`primary`,disabled:!l,children:c(y?`ClashgramPasscodeButtonSaveUnlock`:`ClashgramPasscodeButtonUnlock`)})]})]})})})}var oi=V(Ke(e=>{let t=N(e),n=t.clashgramPasscodeModal,r=t.clashgramPendingAction;return{isOpen:!!n?.isOpen,type:n?.type,targetId:n?.targetId,pendingAction:r}})(ai)),si=({children:e})=>e,ci=V(Ke(e=>Qe(N(e),[`notifications`]))(({notifications:e})=>{if(e.length)return K(`div`,{id:`Notifications`,role:`status`,"aria-live":`polite`,"aria-atomic":`false`,children:e.map(e=>K(E,{notification:e},e.localId))})})),li={bg:`Y7owXZmb`},ui={mask:`Q8l6Ks2K`,main:`dFN6ExCi`,foldersSidebarVisible:`iEADB-Wf`,foldersSidebar:`_1fA0v3-K`,left:`rQsyDQTJ`,middle:`_3Hfz46AV`,right:`j35St2Zy`,blank:`cUBlZo6h`},di=``+new URL(`mask-CZN7nqR6.svg`,import.meta.url).href,fi=700,pi=1e3,mi=10;function hi(){let{listIds:e,byId:t}=Te().chats;if(e.active)return Promise.all(e.active.slice(0,mi).map(async e=>{let n=t[e];if(!n)return;let r=mt(n);if(r)return u(r,st.BlobUrl)}))}var gi={main:()=>Promise.all([Ce(Ze.Main).then(In),hi(),x(di),x(pe),h]),authPhoneNumber:()=>Promise.all([In(),x(At)]),authCode:()=>x(Gn),authPassword:()=>x(Gn),authQrCode:In,lock:()=>Promise.all([In(),x(Ht)]),inactive:()=>{}},_i=Ke((e,{isMobile:t})=>{let n=N(e),{foldersPosition:r}=ht(e);return{shouldSkipHistoryAnimations:n.shouldSkipHistoryAnimations,uiReadyState:n.uiReadyState,isRightColumnShown:je(e,t),leftColumnWidth:e.leftColumnWidth,isFoldersSidebarShown:r===`left`&&!t&&L(e)}})(({page:e,children:t,isRightColumnShown:n,shouldSkipHistoryAnimations:r,leftColumnWidth:i,isFoldersSidebarShown:a})=>{let{setIsUiReady:o}=G(),[s,c]=g(),{shouldRender:l,transitionClassNames:u}=xt(!s,void 0,!0);return p(()=>{let t;return Promise.race([te(fi),e?(async()=>{try{await gi[e]()}catch{}})():Promise.resolve()]).then(()=>{c(),o({uiReadyState:1}),t=window.setTimeout(()=>{o({uiReadyState:2})},pi)}),()=>{t&&=(clearTimeout(t),void 0),o({uiReadyState:0})}}),J(ge,{children:[t,l&&!r&&!!e&&K(`div`,{className:H(ui.mask,u),children:e===`main`?J(`div`,{className:H(ui.main,a&&ui.foldersSidebarVisible),children:[a&&K(`div`,{className:ui.foldersSidebar}),K(`div`,{className:ui.left,style:i?`width: ${i}px`:void 0}),K(`div`,{className:H(ui.middle,li.bg)}),n&&K(`div`,{className:ui.right})]}):e===`inactive`||e===`lock`?K(`div`,{className:H(ui.blank,li.bg)}):K(`div`,{className:ui.blank})})]})}),vi=``+new URL(`app-inactive-BUTAE-4c.png`,import.meta.url).href,yi=({inactiveReason:e})=>{let t=tt(),n=U(()=>{window.location.reload()});return he({isActive:!0,onBack:n,shouldResetUrlHash:!0}),K(`div`,{id:`AppInactive`,children:J(`div`,{className:`content`,children:[K(`img`,{src:vi,alt:``}),K(`h3`,{className:`title`,children:t(e===`auth`?`AppInactiveAuthTitle`:`AppInactiveOtherClientTitle`)}),K(`div`,{className:`description`,children:Je(t(e===`auth`?`AppInactiveAuthDescription`:`AppInactiveOtherClientDescription`),[`br`])}),K(`div`,{className:`actions`,children:K(q,{isText:!0,ripple:!0,onClick:n,children:t(`AppInactiveReload`)})})]})})},bi=e=>{let{isLocked:t}=e,n=ye(Ze.Main,`LockScreen`,!t);return n?K(n,{...e}):void 0},xi=e=>{let t=ye(Ze.Main,`Main`);return t?K(t,{...e}):void 0},Si=function(e){return e[e.auth=0]=`auth`,e[e.main=1]=`main`,e[e.lock=2]=`lock`,e[e.inactive=3]=`inactive`,e}(Si||{}),Ci=Object.keys(Si).length/2,wi=Me?C:m,Ti=`${wi} ${Ie}`,Ei=Ke(e=>{let{state:t,hasWebAuthTokenFailed:n,hasWebAuthTokenPasswordRequired:r}=e.auth,{clashgramNativeGlass:i,clashgramNativeGlassColorValue:a,clashgramNativeGlassOpacityValue:o,clashgramCustomFont:s}=ht(e);return{currentUserId:e.currentUserId,authState:t,isScreenLocked:e.passcode?.isScreenLocked,hasPasscode:e.passcode?.hasPasscode,inactiveReason:N(e).inactiveReason,hasWebAuthTokenFailed:n||r,theme:re(e),isTestServer:e.config?.isTestServer,actionMessageBg:Le(e),clashgramNativeGlass:i,clashgramNativeGlassColorValue:a,clashgramNativeGlassOpacityValue:o,clashgramCustomFont:s}})(({currentUserId:e,authState:t,isScreenLocked:r,hasPasscode:i,inactiveReason:a,hasWebAuthTokenFailed:o,isTestServer:c,theme:l,actionMessageBg:u,clashgramNativeGlass:d,clashgramNativeGlassColorValue:p,clashgramNativeGlassOpacityValue:m,clashgramCustomFont:h})=>{let{isMobile:g}=$e(),_=Ye===`iOS`||Ye===`Android`;W(()=>{f&&Kt()},[]),W(()=>{(async()=>{let e=Bt();if(e.includes(`login`))return;let t=await fe();if(t!==void 0){let n=new URL(rt(t));e&&(n.hash=e),window.location.replace(n.toString());return}if(!en()&&!ce&&!e){let t=T();Object.keys(t).map(Number).sort((e,t)=>t-e).forEach(n=>{let r=Number(n);if(t[r]){let t=rt(r);window.location.replace(`${t}#${e||`login`}`)}})}})(),(async()=>{if(Gt()&&ce&&await y()){let e=rt(1);window.location.replace(e)}})()},[]),W(()=>{if(!e)return;function t(t){if(t.key&&!t.key.startsWith(`account`))return;let n=T(),r=Object.entries(n).find(([t,n])=>n.userId===e)?.[0];if(r){let e=Number(r);if(e!==(ce||1)){let t=new URL(rt(e));window.location.hash&&(t.hash=window.location.hash),window.location.replace(t.toString())}}}return window.addEventListener(`storage`,t),()=>{window.removeEventListener(`storage`,t)}},[e]),W(()=>{let e=document.body,t=e=>{e.preventDefault(),e.dataTransfer&&(e.target.dataset.dropzone?e.dataTransfer.dropEffect=`copy`:e.dataTransfer.dropEffect=`none`)},n=e=>{e.preventDefault()};return e.addEventListener(`drop`,n),e.addEventListener(`dragover`,t),e.addEventListener(`dragenter`,t),()=>{e.removeEventListener(`drop`,n),e.removeEventListener(`dragover`,t),e.removeEventListener(`dragenter`,t)}},[]);let v,b;if(a)v=3;else if(r)b=`lock`,v=2;else if(t)switch(t){case`authorizationStateWaitPhoneNumber`:b=`authPhoneNumber`,v=0;break;case`authorizationStateWaitCode`:b=`authCode`,v=0;break;case`authorizationStateWaitPassword`:b=`authPassword`,v=0;break;case`authorizationStateWaitRegistration`:v=0;break;case`authorizationStateWaitQrCode`:b=`authQrCode`,v=0;break;case`authorizationStateClosed`:case`authorizationStateClosing`:case`authorizationStateLoggingOut`:case`authorizationStateReady`:b=`main`,v=1;break}else en()?(b=`main`,v=1):i?v=2:(b=_?`authPhoneNumber`:`authQrCode`,v=0);v!==2&&v!==3&&v!==1&&zt()?.tgWebAuthToken&&!o&&(b=`main`,v=1),W(()=>{Ge()},[]),W(()=>{a?document.title=Ti:document.title=wi},[a]),W(()=>{let e,t=0,n=()=>{let n=Date.now();if(n-t<15e3)return;t=n;let r=Te(),i=G();if(!(r.auth.state&&r.auth.state!==`authorizationStateReady`&&!en())){if(r.connectionState===`connectionStateBroken`){i.apiUpdate({"@type":`requestReconnectApi`});return}r.connectionState!==`connectionStateConnecting`&&Promise.race([s(`fetchNearestCountry`),new Promise((t,n)=>{e=setTimeout(()=>n(Error(`timeout`)),1500)})]).then(()=>{e&&clearTimeout(e)}).catch(t=>{e&&clearTimeout(e),console.warn(`Zombie connection detected during focus/online, reconnecting...`,t),i.apiUpdate({"@type":`requestReconnectApi`})})}},r=()=>{document.visibilityState===`visible`&&n()};return window.addEventListener(`online`,n),window.addEventListener(`focus`,n),document.addEventListener(`visibilitychange`,r),()=>{window.removeEventListener(`online`,n),window.removeEventListener(`focus`,n),document.removeEventListener(`visibilitychange`,r),e&&clearTimeout(e)}},[]);let x=Nt(v);function S(){switch(v){case 0:return K(nr,{});case 1:return K(xi,{isMobile:g});case 2:return K(bi,{isLocked:r});case 3:return K(yi,{inactiveReason:a})}}Mn(),n(()=>{document.body.classList.add(li.bg)},[]),n(()=>{document.body.style.setProperty(`--theme-background-color`,l===`dark`?se:xe)},[l]),n(()=>{u&&document.body.style.setProperty(`--action-message-bg`,u)},[u]),n(()=>{Rt(d,p,m)},[d,p,m,l]),n(()=>{if(h&&h!=="default"){if(document.body.style.setProperty(`--font-family`,`"${h}", -apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Symbol", Roboto, Helvetica, Arial, sans-serif`),![`arial`,`helvetica`,`georgia`,`impact`,`segoe ui`,`trebuchet ms`,`courier new`,`consolas`,`lucida console`,`comic sans ms`,`avenir next`,`cabinet`,`clash display`,`clash grotesk`,`chillax`,`general sans`,`satoshi`,`telma`].includes(h.toLowerCase())){let e=`gfont-${h.replace(/\s+/g,`-`)}`;if(!document.getElementById(e)){let t=document.createElement(`link`);t.id=e,t.rel=`stylesheet`,t.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(h)}:wght@400;500;700&display=swap`,document.head.appendChild(t)}}}else document.body.style.removeProperty(`--font-family`)},[h]);let C=ne;return F(()=>{it(()=>{document.body.classList.toggle(`in-background`,C())},document.body)},[C]),J(_i,{page:b,isMobile:g,children:[K(si,{children:K(ie,{name:`fade`,activeKey:v,shouldCleanup:!0,className:H(`full-height`,(v===0||x===0)&&`is-auth`),renderCount:Ci,children:S})}),v===0&&c&&K(`div`,{className:`test-server-badge`,children:`Test server`}),K(ci,{}),K(oi,{}),K(ri,{})]})});Me&&(En(),On()),Di();async function Di(){await we(),window.isCompatTestPassed&&(Xt(),Tn(),ot(),await qe(`4.0.0`),await We(),localStorage.setItem(D,`1`),o(()=>{let e=Te();Object.keys(e.byTabId).length===1&&localStorage.removeItem(D)}),await gn(),G().init(),G().updateShouldEnableDebugLog(),G().updateShouldDebugExportedSenders(),le(ht(Te()).language,!0),ee(e=>{G().switchMultitabRole({isMasterTab:e},{forceSyncOnIOs:!0})}),Ve(Te().auth.state!==`authorizationStateReady`),b(()=>{An(),_t.render(K(jt,{children:K(Ei,{})}),document.getElementById(`root`)),xn()}))}o(()=>{let e=G();e.leaveGroupCall?.({isPageUnload:!0}),e.hangUp?.({isPageUnload:!0})});export{an as t};
//# sourceMappingURL=index-BEHTfruU.js.map