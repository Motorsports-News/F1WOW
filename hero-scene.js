/* Homepage hero — 3D track ribbon.
 *
 * A perspective ribbon of track segments receding to the horizon, with the
 * camera flying forward. Scroll drives the camera on desktop; on phones the
 * scene runs simplified and the camera holds still (decision M1).
 *
 * Built on OGL (~30KB, ES module from CDN, no build step) to stay inside the
 * repo's vanilla-only rule. Fails silently to the page background if WebGL is
 * unavailable, the module fails to load, or reduced motion is requested --
 * in every one of those cases the canvas removes itself and the hero still
 * reads correctly from its type alone.
 */
(function () {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // M1: phones get fewer segments, a capped pixel ratio and no scroll-scrub.
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

        const camera = new Camera(gl, { fov: 62, near: 0.1, far: 90 });
        const scene = new Transform();

        // --- the ribbon: paired rails receding into depth --------------------
        const SEG = isPhone ? 44 : 90;   // segments down the track
        const SPACING = 1.15;            // distance between rungs
        const HALF = 3.6;                // track half-width

        // Real triangle geometry, not gl.LINES: a 1px GL line on a hi-DPI
        // canvas renders as an almost-invisible hairline, so the rails and
        // rungs are built as thin quads with actual width instead.
        const pos = [];
        const aDepth = [];
        const aSide = [];

        function quad(x0, z0, x1, z1, depth, side) {
            // two triangles, flat on the y=0 plane
            pos.push(x0, 0, z0,  x1, 0, z0,  x1, 0, z1,
                     x0, 0, z0,  x1, 0, z1,  x0, 0, z1);
            for (let k = 0; k < 6; k++) { aDepth.push(depth); aSide.push(side); }
        }

        const RAIL_W = 0.09;   // rail half-width
        const RUNG_W = 0.05;   // rung half-depth

        for (let i = 0; i < SEG; i++) {
            const z = -i * SPACING;
            const zEnd = z - SPACING * 0.62;   // dashed, not continuous
            const d = i / SEG;
            quad(-HALF - RAIL_W, z, -HALF + RAIL_W, zEnd, d, -1);
            quad(HALF - RAIL_W, z, HALF + RAIL_W, zEnd, d, 1);
            if (i % 3 === 0) {
                quad(-HALF, z, HALF, z - RUNG_W * 2, d, 0);
            }
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: new Float32Array(pos) },
            aDepth: { size: 1, data: new Float32Array(aDepth) },
            aSide: { size: 1, data: new Float32Array(aSide) }
        });

        const program = new Program(gl, {
            vertex: `
                attribute vec3 position;
                attribute float aDepth;
                attribute float aSide;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float uTime;
                varying float vFade;
                varying float vSide;
                void main() {
                    vec3 p = position;
                    // gentle lateral sway so the track feels like it curves.
                    // Scaled by depth so the near end stays centred under the
                    // camera and only the distance bends away.
                    float t = clamp(-p.z / 60.0, 0.0, 1.0);
                    p.x += sin(p.z * 0.035 + uTime * 0.16) * 5.0 * t;
                    p.y += cos(p.z * 0.028 + uTime * 0.11) * 1.1 * t;
                    vec4 mv = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mv;
                    // fade out toward the horizon and right at the camera
                    vFade = smoothstep(0.0, 0.06, aDepth) * (1.0 - smoothstep(0.62, 1.0, aDepth));
                    vSide = aSide;
                }
            `,
            fragment: `
                precision mediump float;
                varying float vFade;
                varying float vSide;
                uniform vec3 uAccent;
                uniform vec3 uInk;
                void main() {
                    // rails carry the accent, cross-rungs stay bone and dimmer
                    vec3 c = mix(uInk, uAccent, abs(vSide));
                    float a = vFade * (abs(vSide) > 0.5 ? 1.0 : 0.42);
                    gl_FragColor = vec4(c, a);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uAccent: { value: [0.357, 0.561, 0.780] }, // #5B8FC7 steel blue
                uInk:    { value: [0.929, 0.929, 0.910] }  // #EDEDE8 bone
            },
            transparent: true,
            depthTest: false
        });

        const ribbon = new Mesh(gl, { geometry, program });
        ribbon.setParent(scene);

        // --- particle field ---------------------------------------------------
        // The track alone reads as a flat diagram. Depth only becomes legible
        // when there are things at MANY different distances: near particles
        // sweep past quickly, far ones barely move, and that differential
        // parallax is what actually sells three dimensions.
        const PCOUNT = isPhone ? 260 : 900;
        const ppos = new Float32Array(PCOUNT * 3);
        const psize = new Float32Array(PCOUNT);
        for (let i = 0; i < PCOUNT; i++) {
            ppos[i * 3]     = (Math.random() - 0.5) * 46;              // spread wide
            ppos[i * 3 + 1] = Math.pow(Math.random(), 1.6) * 16 - 1.6; // denser low
            ppos[i * 3 + 2] = -Math.random() * 95;                     // through depth
            psize[i] = Math.random() * 2.4 + 0.7;
        }
        const pGeo = new Geometry(gl, {
            position: { size: 3, data: ppos },
            aSize: { size: 1, data: psize }
        });
        const pProg = new Program(gl, {
            vertex: `
                attribute vec3 position;
                attribute float aSize;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float uTime;
                varying float vA;
                void main(){
                    vec3 p = position;
                    p.y += sin(uTime * 0.35 + p.x * 0.6) * 0.16;   // slow drift
                    vec4 mv = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mv;
                    float dist = -mv.z;
                    // perspective scaling is the depth cue: near = big, far = small
                    gl_PointSize = aSize * (150.0 / max(dist, 1.0));
                    vA = smoothstep(95.0, 12.0, dist) * smoothstep(0.6, 5.0, dist);
                }
            `,
            fragment: `
                precision mediump float;
                varying float vA;
                uniform vec3 uAccent;
                void main(){
                    vec2 uv = gl_PointCoord - 0.5;
                    float d = length(uv);
                    if (d > 0.5) discard;
                    gl_FragColor = vec4(uAccent, smoothstep(0.5, 0.0, d) * vA * 0.85);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uAccent: { value: [0.62, 0.72, 0.85] }
            },
            transparent: true,
            depthTest: false
        });
        const dust = new Mesh(gl, { mode: gl.POINTS, geometry: pGeo, program: pProg });
        dust.setParent(scene);

        function resize() {
            const r = hero.getBoundingClientRect();
            renderer.setSize(r.width, r.height);
            camera.perspective({ aspect: r.width / Math.max(r.height, 1) });
        }
        window.addEventListener('resize', resize, { passive: true });
        resize();

        // --- camera: scroll-driven on desktop, static on phones (M1) --------
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
            scrollNow += (scrollTarget - scrollNow) * 0.06;      // lerp, never snaps
            const secs = t * 0.001;
            // Constant forward travel. The track loops on SPACING so it reads
            // as endless; the particles do NOT loop, so they stream past at
            // their own rate and the two together give the depth away.
            const drift = (secs * 1.6) % SPACING;
            const push = secs * 1.6;

            camera.position.set(0, 2.4, 4.2 - drift - scrollNow * 26);
            camera.rotation.x = -0.30 - scrollNow * 0.14;
            program.uniforms.uTime.value = secs;

            // Recycle particles that fall behind the camera back to the far
            // plane, so the field is infinite without ever reallocating.
            dust.position.z = push % 95;
            pProg.uniforms.uTime.value = secs;

            renderer.render({ scene, camera });
        }
        raf = requestAnimationFrame(frame);

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(frame);
        });
    }
})();
