"use strict";(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[5215],{25215:(t,e,n)=>{n.d(e,{wG:()=>o,WZ:()=>p,GU:()=>z,dj:()=>c,ct:()=>M,Ny:()=>s});const o={CLOCKWISE:1,COUNTER_CLOCKWISE:-1};function s(t,e,n={}){const o=function(t,e={}){return Math.sign(function(t,e={}){const{start:n=0,end:o=t.length}=e,s=e.size||2;let l=0;for(let e=n,r=o-s;e<o;e+=s)l+=(t[e]-t[r])*(t[e+1]+t[r+1]),r=e;return l/2}(t,e))}(t,n);return o!==e&&(function(t,e){const{start:n=0,end:o=t.length,size:s=2}=e,l=(o-n)/s,r=Math.floor(l/2);for(let e=0;e<r;++e){const o=n+e*s,r=n+(l-1-e)*s;for(let e=0;e<s;++e){const n=t[o+e];t[o+e]=t[r+e],t[r+e]=n}}}(t,n),!0)}function l(t,e,n,o,s=[]){let l,r;if(8&n)l=(o[3]-t[1])/(e[1]-t[1]),r=3;else if(4&n)l=(o[1]-t[1])/(e[1]-t[1]),r=1;else if(2&n)l=(o[2]-t[0])/(e[0]-t[0]),r=2;else{if(!(1&n))return null;l=(o[0]-t[0])/(e[0]-t[0]),r=0}for(let n=0;n<t.length;n++)s[n]=(1&r)===n?o[r]:l*(e[n]-t[n])+t[n];return s}function r(t,e){let n=0;return t[0]<e[0]?n|=1:t[0]>e[2]&&(n|=2),t[1]<e[1]?n|=4:t[1]>e[3]&&(n|=8),n}function f(t,e){const n=e.length,o=t.length;if(o>0){let s=!0;for(let l=0;l<n;l++)if(t[o-n+l]!==e[l]){s=!1;break}if(s)return!1}for(let s=0;s<n;s++)t[o+s]=e[s];return!0}function i(t,e){const n=e.length;for(let o=0;o<n;o++)t[o]=e[o]}function u(t,e,n,o,s=[]){const l=o+e*n;for(let e=0;e<n;e++)s[e]=t[l+e];return s}function c(t,e={}){const{size:n=2,broken:o=!1,gridResolution:s=10,gridOffset:c=[0,0],startIndex:h=0,endIndex:p=t.length}=e,g=(p-h)/n;let y=[];const M=[y],z=u(t,0,n,h);let b,k;const C=a(z,s,c,[]),I=[];f(y,z);for(let e=1;e<g;e++){for(b=u(t,e,n,h,b),k=r(b,C);k;){l(z,b,k,C,I);const t=r(I,C);t&&(l(z,I,t,C,I),k=t),f(y,I),i(z,I),d(C,s,k),o&&y.length>n&&(y=[],M.push(y),f(y,z)),k=r(b,C)}f(y,b),i(z,b)}return o?M:M[0]}function h(t,e){for(let n=0;n<e.length;n++)t.push(e[n]);return t}function p(t,e,n={}){if(!t.length)return[];const{size:o=2,gridResolution:s=10,gridOffset:l=[0,0],edgeTypes:f=!1}=n,i=[],u=[{pos:t,types:f&&new Array(t.length/o).fill(1),holes:e||[]}],c=[[],[]];let p=[];for(;u.length;){const{pos:t,types:e,holes:n}=u.shift();y(t,o,n[0]||t.length,c),p=a(c[0],s,l,p);const d=r(c[1],p);if(d){let s=g(t,e,o,0,n[0]||t.length,p,d);const l={pos:s[0].pos,types:s[0].types,holes:[]},r={pos:s[1].pos,types:s[1].types,holes:[]};u.push(l,r);for(let i=0;i<n.length;i++)s=g(t,e,o,n[i],n[i+1]||t.length,p,d),s[0]&&(l.holes.push(l.pos.length),l.pos=h(l.pos,s[0].pos),f&&(l.types=h(l.types,s[0].types))),s[1]&&(r.holes.push(r.pos.length),r.pos=h(r.pos,s[1].pos),f&&(r.types=h(r.types,s[1].types)))}else{const o={positions:t};f&&(o.edgeTypes=e),n.length&&(o.holeIndices=n),i.push(o)}}return i}function g(t,e,n,o,s,r,c){const h=(s-o)/n,p=[],g=[],a=[],d=[],y=[];let M,z,b;const k=u(t,h-1,n,o);let C=Math.sign(8&c?k[1]-r[3]:k[0]-r[2]),I=e&&e[h-1],O=0,T=0;for(let s=0;s<h;s++)M=u(t,s,n,o,M),z=Math.sign(8&c?M[1]-r[3]:M[0]-r[2]),b=e&&e[o/n+s],z&&C&&C!==z&&(l(k,M,c,r,y),f(p,y)&&a.push(I),f(g,y)&&d.push(I)),z<=0?(f(p,M)&&a.push(b),O-=z):a.length&&(a[a.length-1]=0),z>=0?(f(g,M)&&d.push(b),T+=z):d.length&&(d[d.length-1]=0),i(k,M),C=z,I=b;return[O?{pos:p,types:e&&a}:null,T?{pos:g,types:e&&d}:null]}function a(t,e,n,o){const s=Math.floor((t[0]-n[0])/e)*e+n[0],l=Math.floor((t[1]-n[1])/e)*e+n[1];return o[0]=s,o[1]=l,o[2]=s+e,o[3]=l+e,o}function d(t,e,n){8&n?(t[1]+=e,t[3]+=e):4&n?(t[1]-=e,t[3]-=e):2&n?(t[0]+=e,t[2]+=e):1&n&&(t[0]-=e,t[2]-=e)}function y(t,e,n,o){let s=1/0,l=-1/0,r=1/0,f=-1/0;for(let o=0;o<n;o+=e){const e=t[o],n=t[o+1];s=e<s?e:s,l=e>l?e:l,r=n<r?n:r,f=n>f?n:f}return o[0][0]=s,o[0][1]=r,o[1][0]=l,o[1][1]=f,o}function M(t,e={}){const{size:n=2,startIndex:o=0,endIndex:s=t.length,normalize:l=!0}=e,r=t.slice(o,s);C(r,n,0,s-o);const f=c(r,{size:n,broken:!0,gridResolution:360,gridOffset:[-180,-180]});if(l)for(const t of f)I(t,n);return f}function z(t,e,n={}){const{size:o=2,normalize:s=!0,edgeTypes:l=!1}=n;e=e||[];const r=[],f=[];let i=0,u=0;for(let s=0;s<=e.length;s++){const l=e[s]||t.length,c=u,h=b(t,o,i,l);for(let e=h;e<l;e++)r[u++]=t[e];for(let e=i;e<h;e++)r[u++]=t[e];C(r,o,c,u),k(r,o,c,u,n.maxLatitude),i=l,f[s]=u}f.pop();const c=p(r,f,{size:o,gridResolution:360,gridOffset:[-180,-180],edgeTypes:l});if(s)for(const t of c)I(t.positions,o);return c}function b(t,e,n,o){let s=-1,l=-1;for(let r=n+1;r<o;r+=e){const e=Math.abs(t[r]);e>s&&(s=e,l=r-1)}return l}function k(t,e,n,o,s=85.051129){const l=t[n],r=t[o-e];if(Math.abs(l-r)>180){const o=u(t,0,e,n);o[0]+=360*Math.round((r-l)/360),f(t,o),o[1]=Math.sign(o[1])*s,f(t,o),o[0]=l,f(t,o)}}function C(t,e,n,o){let s,l=t[0];for(let r=n;r<o;r+=e){s=t[r];const e=s-l;(e>180||e<-180)&&(s-=360*Math.round(e/360)),t[r]=l=s}}function I(t,e){let n;const o=t.length/e;for(let s=0;s<o&&(n=t[s*e],(n+180)%360==0);s++);const s=360*-Math.round(n/360);if(0!==s)for(let n=0;n<o;n++)t[n*e]+=s}}}]);
//# sourceMappingURL=29b91d6854c5e405ce45.chunk.js.map
