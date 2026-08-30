/* Homepage hero -- a real 3D circuit.
 *
 * WHAT THIS IS
 * A closed racing circuit, extruded into a banked ribbon with actual width and
 * thickness, rendered as solid geometry and orbiting slowly in space. A light
 * marker runs the racing line. Depth comes from FORM -- surfaces catching light
 * at different angles, near parts of the loop passing in front of far parts,
 * the silhouette changing as it turns -- not from a parallax trick.
 *
 * WHY IT WAS REBUILT
 * The previous versions were a flat dashed ribbon on the y=0 plane, and then
 * that plus a particle field. Both were legitimately criticised as "not 3D":
 * a single plane has no volume, and particles only give you depth cues, never
 * shape. You cannot rotate a particle cloud and learn anything about it. You
 * can rotate a solid and see it is solid -- that is the difference, and it is
 * why this version is built as a closed swept mesh with normals and shading.
 *
 * Built on OGL (~30KB, ES module from CDN, no build step) to stay inside the
 * repo's vanilla-only rule. Fails silently to the page background if WebGL is
 * unavailable, the module fails to load, or reduced motion is requested -- in
 * every one of those cases the canvas removes itself and the hero still reads
 * correctly from its type alone.
 */
(function () {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // M1: phones get a coarser mesh, fewer particles and a capped pixel ratio.
    const isPhone = window.matchMedia('(max-width: 760px)').matches;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-scene-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);

    import('https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js')
        .then(init)
        .catch(() => canvas.remove());

    function init({ Renderer, Camera, Transform, Geometry, Program, Mesh }) {
        let renderer;
        try {
            renderer = new Renderer({
                canvas, alpha: true, antialias: !isPhone,
                dpr: Math.min(window.devicePixelRatio, isPhone ? 1.5 : 2)
            });
        } catch (e) { canvas.remove(); return; }

        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);          // real occlusion: near track hides far track

        const camera = new Camera(gl, { fov: 42, near: 0.1, far: 260 });
        const scene = new Transform();

        // ---- circuit centre line -------------------------------------------
        // Control points of a generic road course: two long straights, a
        // hairpin, a fast sweeper and a chicane. Deliberately not a copy of a
        // real licensed circuit map -- it just has to read as a racing circuit.
        const CTRL = [
            [0.00, -1.00], [0.42, -0.94], [0.72, -0.66], [0.78, -0.28],
            [0.60, -0.05], [0.86,  0.22], [0.80,  0.58], [0.46,  0.74],
            [0.10,  0.62], [-0.06, 0.80], [-0.42, 0.86], [-0.76, 0.60],
            [-0.82, 0.18], [-0.58, -0.06], [-0.86, -0.34], [-0.66, -0.80]
        ];

        // Closed Catmull-Rom through the control points, sampled fine enough
        // that the extruded ribbon has smooth curvature.
        function catmull(p0, p1, p2, p3, t) {
            const t2 = t * t, t3 = t2 * t;
            return 0.5 * ((2 * p1) + (-p0 + p2) * t +
                (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
        }

        const STEPS = isPhone ? 6 : 12;    // samples per control segment
        const path = [];
        for (let i = 0; i < CTRL.length; i++) {
            const p0 = CTRL[(i - 1 + CTRL.length) % CTRL.length];
            const p1 = CTRL[i];
            const p2 = CTRL[(i + 1) % CTRL.length];
            const p3 = CTRL[(i + 2) % CTRL.length];
            for (let s = 0; s < STEPS; s++) {
                const t = s / STEPS;
                path.push([catmull(p0[0], p1[0], p2[0], p3[0], t),
                           catmull(p0[1], p1[1], p2[1], p3[1], t)]);
            }
        }

        const SCALE = 15.0;
        const N = path.length;

        // Elevation change, so the circuit is not flat -- a real gradient over
        // the lap makes the form legible the moment it turns.
        const elev = (i) => Math.sin(i / N * Math.PI * 2) * 1.9
                          + Math.sin(i / N * Math.PI * 6 + 0.8) * 0.55;

        // ---- sweep the ribbon ----------------------------------------------
        // At each sample: tangent -> normal -> four corners of a banked,
        // thick road section. Consecutive sections are stitched into quads,
        // giving a closed solid with a top, an underside and two edges.
        const HALF_W = 0.62;               // road half-width
        const THICK  = 0.20;               // slab thickness

        const pos = [], nrm = [], along = [], across = [];

        function sample(i) {
            const a = path[i % N], b = path[(i + 1) % N];
            const x = a[0] * SCALE, z = a[1] * SCALE, y = elev(i);
            let tx = (b[0] - a[0]) * SCALE, tz = (b[1] - a[1]) * SCALE;
            const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
            // normal in the ground plane, perpendicular to the tangent
            const nx = -tz, nz = tx;
            // bank into the corner: compare this tangent with the next one
            const c = path[(i + 2) % N];
            let ux = (c[0] - b[0]) * SCALE, uz = (c[1] - b[1]) * SCALE;
            const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
            const curl = tx * uz - tz * ux;               // signed curvature
            const bank = Math.max(-0.42, Math.min(0.42, curl * 5.0));
            return { x, y, z, nx, nz, bank };
        }

        function corners(s) {
            const dy = s.bank * HALF_W;                   // banking lifts one edge
            return {
                // top surface, outer and inner edge
                to: [s.x + s.nx * HALF_W, s.y + dy, s.z + s.nz * HALF_W],
                ti: [s.x - s.nx * HALF_W, s.y - dy, s.z - s.nz * HALF_W],
                // underside
                bo: [s.x + s.nx * HALF_W, s.y + dy - THICK, s.z + s.nz * HALF_W],
                bi: [s.x - s.nx * HALF_W, s.y - dy - THICK, s.z - s.nz * HALF_W]
            };
        }

        function face(a, b, c, d, n, u0, u1) {
            // two triangles, with a shared face normal and a u coordinate that
            // says how far across the road we are (0 = centre, 1 = edge)
            pos.push(...a, ...b, ...c, ...a, ...c, ...d);
            for (let k = 0; k < 6; k++) nrm.push(...n);
            across.push(u0, u1, u1, u0, u1, u0);
        }

        function norm3(ax, ay, az, bx, by, bz) {
            const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
            const l = Math.hypot(nx, ny, nz) || 1;
            return [nx / l, ny / l, nz / l];
        }

        for (let i = 0; i < N; i++) {
            const s0 = sample(i), s1 = sample(i + 1);
            const c0 = corners(s0), c1 = corners(s1);
            const t0 = i / N, t1 = (i + 1) / N;

            // road surface -- normal from its own two edges
            const nTop = norm3(
                c1.to[0] - c0.to[0], c1.to[1] - c0.to[1], c1.to[2] - c0.to[2],
                c0.ti[0] - c0.to[0], c0.ti[1] - c0.to[1], c0.ti[2] - c0.to[2]);
            face(c0.to, c1.to, c1.ti, c0.ti, nTop, 1, 0);

            // Outer and inner walls -- these are what make it read as a slab.
            // aAcross 0.45 keeps them below the kerb threshold so they take the
            // accent; tagging them 1 made every wall render bone-grey.
            face(c0.to, c1.to, c1.bo, c0.bo, [s0.nx, 0, s0.nz], 0.45, 0.45);
            face(c0.ti, c1.ti, c1.bi, c0.bi, [-s0.nx, 0, -s0.nz], 0.45, 0.45);
            // underside, darkest of the four
            face(c0.bo, c1.bo, c1.bi, c0.bi, [0, -1, 0], 0.12, 0.12);

            // 4 faces x 6 vertices; lap position is per-segment, which is
            // resolution enough for the marker at ~190 segments.
            for (let k = 0; k < 24; k++) along.push(t0);
            void t1;
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: new Float32Array(pos) },
            aNormal:  { size: 3, data: new Float32Array(nrm) },
            aAcross:  { size: 1, data: new Float32Array(across) },
            aAlong:   { size: 1, data: new Float32Array(along) }
        });

        const program = new Program(gl, {
            vertex: `
                attribute vec3 position;
                attribute vec3 aNormal;
                attribute float aAcross;
                attribute float aAlong;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform mat3 normalMatrix;
                varying vec3 vN;
                varying float vAcross;
                varying float vAlong;
                varying float vDepth;
                void main() {
                    vec4 mv = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mv;
                    vN = normalize(normalMatrix * aNormal);
                    vAcross = aAcross;
                    vAlong = aAlong;
                    vDepth = -mv.z;
                }
            `,
            fragment: `
                precision mediump float;
                varying vec3 vN;
                varying float vAcross;
                varying float vAlong;
                varying float vDepth;
                uniform vec3 uAccent;
                uniform vec3 uInk;
                uniform float uCar;
                void main() {
                    // Two lights at different angles. Directional shading is
                    // what tells the eye this is a solid and not a flat map --
                    // each face of the slab catches a different amount.
                    vec3 n = normalize(vN);
                    float key  = max(dot(n, normalize(vec3(-0.4, 0.85, 0.35))), 0.0);
                    float fill = max(dot(n, normalize(vec3(0.7, 0.25, -0.5))), 0.0);
                    float lit = 0.16 + key * 0.85 + fill * 0.28;

                    // edge of the road reads brighter, like a kerb line
                    float edge = smoothstep(0.72, 0.99, vAcross);
                    vec3 base = mix(uAccent * 0.9, uInk, edge * 0.8);

                    // the marker running the racing line
                    float d = abs(fract(vAlong - uCar + 0.5) - 0.5);
                    float car = smoothstep(0.035, 0.0, d);
                    base = mix(base, uInk, car * (1.0 - edge * 0.5));
                    lit += car * 1.4;

                    // fade the far side of the loop into the background so the
                    // silhouette stays clean against the dark hero
                    float fog = 1.0 - smoothstep(24.0, 78.0, vDepth);
                    float a = (0.46 + edge * 0.44 + car * 0.6) * fog;
                    gl_FragColor = vec4(base * lit, a);
                }
            `,
            uniforms: {
                uAccent: { value: [0.357, 0.561, 0.780] }, // #5B8FC7 steel blue
                uInk:    { value: [0.929, 0.929, 0.910] }, // #EDEDE8 bone
                uCar:    { value: 0 }
            },
            transparent: true,
            cullFace: null                 // the loop is seen from both sides
        });

        const circuit = new Mesh(gl, { geometry, program });
        circuit.setParent(scene);

        // ---- sparse dust, for scale ----------------------------------------
        // Kept deliberately thin. It is atmosphere around the object, not the
        // subject -- the circuit is the subject.
        const PCOUNT = isPhone ? 90 : 260;
        const ppos = new Float32Array(PCOUNT * 3);
        const psize = new Float32Array(PCOUNT);
        for (let i = 0; i < PCOUNT; i++) {
            const r = 16 + Math.random() * 40, a = Math.random() * Math.PI * 2;
            ppos[i * 3]     = Math.cos(a) * r;
            ppos[i * 3 + 1] = (Math.random() - 0.5) * 26;
            ppos[i * 3 + 2] = Math.sin(a) * r;
            psize[i] = Math.random() * 1.8 + 0.5;
        }
        const dust = new Mesh(gl, {
            mode: gl.POINTS,
            geometry: new Geometry(gl, {
                position: { size: 3, data: ppos },
                aSize: { size: 1, data: psize }
            }),
            program: new Program(gl, {
                vertex: `
                    attribute vec3 position;
                    attribute float aSize;
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    varying float vA;
                    void main(){
                        vec4 mv = modelViewMatrix * vec4(position, 1.0);
                        gl_Position = projectionMatrix * mv;
                        float dist = -mv.z;
                        gl_PointSize = aSize * (90.0 / max(dist, 1.0));
                        vA = smoothstep(110.0, 20.0, dist) * 0.5;
                    }
                `,
                fragment: `
                    precision mediump float;
                    varying float vA;
                    uniform vec3 uAccent;
                    void main(){
                        float d = length(gl_PointCoord - 0.5);
                        if (d > 0.5) discard;
                        gl_FragColor = vec4(uAccent, smoothstep(0.5, 0.0, d) * vA);
                    }
                `,
                uniforms: { uAccent: { value: [0.62, 0.72, 0.85] } },
                transparent: true,
                depthTest: false
            })
        });
        dust.setParent(scene);

        function resize() {
            const r = hero.getBoundingClientRect();
            renderer.setSize(r.width, r.height);
            camera.perspective({ aspect: r.width / Math.max(r.height, 1) });
        }
        window.addEventListener('resize', resize, { passive: true });
        resize();

        // ---- camera ---------------------------------------------------------
        // Orbits the circuit. Scroll tips the view from a low, near-horizon
        // angle toward a higher one, so the loop opens out as the page moves
        // (M1: phones hold a fixed angle).
        let scrollTarget = 0, scrollNow = 0;
        if (!isPhone) {
            window.addEventListener('scroll', function () {
                const r = hero.getBoundingClientRect();
                const total = r.height + window.innerHeight;
                scrollTarget = Math.min(Math.max((window.innerHeight - r.top) / total, 0), 1);
            }, { passive: true });
        }

        let raf, visible = true;
        new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(hero);

        function frame(t) {
            raf = requestAnimationFrame(frame);
            if (!visible) return;
            const secs = t * 0.001;
            scrollNow += (scrollTarget - scrollNow) * 0.06;   // lerp, never snaps

            // Slow orbit. This is the whole point: a solid seen from a moving
            // viewpoint reads as a solid.
            const ang = secs * 0.11 + scrollNow * 1.1;
            const height = 7.5 + scrollNow * 16.0;
            const dist = 30.0 - scrollNow * 4.0;
            camera.position.set(Math.sin(ang) * dist, height, Math.cos(ang) * dist);
            camera.lookAt([0, 0, 0]);

            circuit.rotation.y = secs * 0.035;                // gentle counter-turn
            dust.rotation.y = -secs * 0.012;
            program.uniforms.uCar.value = (secs * 0.085) % 1.0;

            renderer.render({ scene, camera });
        }
        raf = requestAnimationFrame(frame);

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(frame);
        });
    }
})();
