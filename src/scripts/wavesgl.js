/* Fazefactory® waves on the graphics card.
   The star sends out its own outline: echoes that keep the place, size and tilt it had when they left, widen a
   little and fade (the logic stays in star.js). Drawn here in WebGL instead of SVG, so the main thread never
   touches the page for them: one canvas, one tiny draw call per wave, nothing for the browser to lay out.
   A thin line at any size: the mark's outline is turned once into a distance field (exact Euclidean distance
   transform of the six pieces, 512 px), and the shader draws a stroke of constant width in screen pixels,
   like SVG's non-scaling stroke, coloured with the star's own living gradient.
   API (window.FF_WAVES): colors(c0, c1, c2 as 0–1 rgb, angle deg); draw([x, y, scale, rot, opacity, …]). */
(() => {
  const cv = document.getElementById('wv');
  if (!cv) return;
  const gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return;

  // ---- distance field of the outline (CPU, once) ----
  const N = 512, R = 32;                                            // texture size; distances kept up to 32 units
  const c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d'); x.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) { const e = document.getElementById('p' + i); if (e) x.fill(new Path2D(e.getAttribute('d'))); }
  const px = x.getImageData(0, 0, N, N).data, inside = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) inside[i] = px[i * 4 + 3] > 127 ? 1 : 0;
  const INF = 1e20, f = new Float64Array(N * N);
  for (let y = 0; y < N; y++) for (let k = 0; k < N; k++) {        // seeds: pixels on the boundary
    const i = y * N + k, a = inside[i];
    const edge = (k > 0 && inside[i - 1] !== a) || (k < N - 1 && inside[i + 1] !== a) || (y > 0 && inside[i - N] !== a) || (y < N - 1 && inside[i + N] !== a);
    f[i] = edge ? 0 : INF;
  }
  // Felzenszwalb & Huttenlocher: exact squared distance, one dimension at a time
  const d1 = (g, n) => {
    const d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1); let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s = ((g[q] + q * q) - (g[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((g[q] + q * q) - (g[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0; for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + g[v[k]]; }
    return d;
  };
  const col = new Float64Array(N);
  for (let k = 0; k < N; k++) { for (let y = 0; y < N; y++) col[y] = f[y * N + k]; const d = d1(col, N); for (let y = 0; y < N; y++) f[y * N + k] = d[y]; }
  for (let y = 0; y < N; y++) { const d = d1(f.subarray(y * N, y * N + N), N); f.set(d, y * N); }
  const sdf = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) sdf[i] = Math.min(255, Math.sqrt(f[i]) / R * 255);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, N, N, 0, gl.RED, gl.UNSIGNED_BYTE, sdf);
  for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, b);

  // ---- shaders: a quad over the mark's 512-unit drawing, placed like the star ----
  const VS = `#version 300 es
in vec2 a;uniform vec2 sz,ctr;uniform float sc,rot;out vec2 l;
void main(){l=a*512.;vec2 p=(l-vec2(255.,257.5))*sc;float c=cos(rot),s=sin(rot);p=vec2(c*p.x-s*p.y,s*p.x+c*p.y)+ctr;
gl_Position=vec4(p.x/sz.x*2.-1.,1.-p.y/sz.y*2.,0.,1.);}`;
  const FS = `#version 300 es
precision highp float;in vec2 l;uniform sampler2D u;uniform float sc,op,w,ang;uniform vec3 c0,c1,c2;out vec4 o;
void main(){float d=texture(u,l/512.).r*${R}.*sc;                   // distance to the outline, in screen px
float a=1.-smoothstep(w-.6,w+.6,d);if(a<=0.)discard;
vec2 q=l-vec2(257.,255.);float cs=cos(-ang),sn=sin(-ang);float t=clamp((cs*q.x-sn*q.y+223.)/446.,0.,1.);   // the star's gradient axis
vec3 c=t<.55?mix(c0,c1,t/.55):mix(c1,c2,(t-.55)/.45);a*=op;o=vec4(c*a,a);}`;
  const sh = (t, s) => { const z = gl.createShader(t); gl.shaderSource(z, s); gl.compileShader(z); return z; };
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
  gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return;
  gl.useProgram(p);
  const U = {}; for (const k of ['sz', 'ctr', 'sc', 'rot', 'op', 'w', 'ang', 'c0', 'c1', 'c2', 'u']) U[k] = gl.getUniformLocation(p, k);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform1i(U.u, 0); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);

  let dpr = 1;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr | 0; cv.height = innerHeight * dpr | 0; gl.viewport(0, 0, cv.width, cv.height); };
  size(); addEventListener('resize', size);

  let drawn = false;
  window.FF_WAVES = {
    colors(a, b, d, deg) { gl.uniform3fv(U.c0, a); gl.uniform3fv(U.c1, b); gl.uniform3fv(U.c2, d); gl.uniform1f(U.ang, deg * Math.PI / 180); },
    // list: x, y (CSS px), scale (px per unit), rotation (deg), opacity — five numbers per wave
    draw(L) {
      if (!L.length && !drawn) return;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); drawn = L.length > 0;
      gl.uniform2f(U.sz, innerWidth * dpr, innerHeight * dpr); gl.uniform1f(U.w, .6 * dpr);   // stroke ≈ 1.2 CSS px wide
      for (let i = 0; i < L.length; i += 5) {
        gl.uniform2f(U.ctr, L[i] * dpr, L[i + 1] * dpr); gl.uniform1f(U.sc, L[i + 2] * dpr); gl.uniform1f(U.rot, L[i + 3] * Math.PI / 180);
        gl.uniform1f(U.op, L[i + 4]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
  };
})();
