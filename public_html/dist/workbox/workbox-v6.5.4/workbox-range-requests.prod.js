this.workbox=this.workbox||{},this.workbox.rangeRequests=function(t,e,n){"use strict";try{self["workbox:range-requests:6.5.3"]&&_()}catch(t){}async function r(t,n){try{if(206===n.status)return n;const r=t.headers.get("range");if(!r)throw new e.WorkboxError("no-range-header");const s=function(t){const n=t.trim().toLowerCase();if(!n.startsWith("bytes="))throw new e.WorkboxError("unit-must-be-bytes",{normalizedRangeHeader:n});if(n.includes(","))throw new e.WorkboxError("single-range-only",{normalizedRangeHeader:n});const r=/(\d*)-(\d*)/.exec(n);if(!r||!r[1]&&!r[2])throw new e.WorkboxError("invalid-range-values",{normalizedRangeHeader:n});return{start:""===r[1]?void 0:Number(r[1]),end:""===r[2]?void 0:Number(r[2])}}(r),a=await n.blob(),o=function(t,n,r){const s=t.size;if(r&&r>s||n&&n<0)throw new e.WorkboxError("range-not-satisfiable",{size:s,end:r,start:n});let a,o;return void 0!==n&&void 0!==r?(a=n,o=r+1):void 0!==n&&void 0===r?(a=n,o=s):void 0!==r&&void 0===n&&(a=s-r,o=s),{start:a,end:o}}(a,s.start,s.end),i=a.slice(o.start,o.end),d=i.size,u=new Response(i,{status:206,statusText:"Partial Content",headers:n.headers});return u.headers.set("Content-Length",String(d)),u.headers.set("Content-Range",`bytes ${o.start}-${o.end-1}/`+a.size),u}catch(t){return new Response("",{status:416,statusText:"Range Not Satisfiable"})}}return t.RangeRequestsPlugin=class{constructor(){this.cachedResponseWillBeUsed=async({request:t,cachedResponse:e})=>e&&t.headers.has("range")?await r(t,e):e}},t.createPartialResponse=r,t}({},workbox.core._private,workbox.core._private);
//# sourceMappingURL=workbox-range-requests.prod.js.map
