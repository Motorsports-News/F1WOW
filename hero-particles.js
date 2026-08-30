/* Hero 3D particle field — OGL (lightweight WebGL, ~30KB, loaded as a plain
 * ES module from a CDN, no build step). Renders a field of points behind the
 * hero content, mouse-reactive via lerp-smoothed pointer tracking (the
 * "Hello Monday" reference pattern). Fails silently (canvas just never
 * appears, dark gradient background shows through) if WebGL is unavailable
 * or the OGL module fails to load. Skipped entirely under
 * prefers-reduced-motion, per the sitewide motion discipline used
 * everywhere else on this site.
 */
(function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = document.querySelector('.hero-section');
    if (!hero || prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particle-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);

    import('https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js')
        .then((OGL) => initScene(OGL))
        .catch(() => {
            // OGL failed to load (offline, CDN blocked, etc.) — remove the
            // empty canvas and let the existing dark gradient/track show.
            canvas.remove();
        });

    function initScene({ Renderer, Camera, Transform, Geometry, Program, Mesh }) {
        let renderer;
        try {
            renderer = new Renderer({ canvas, alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 2) });
        } catch (e) {
            canvas.remove();
            return;
        }
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl, { fov: 45 });
        camera.position.set(0, 0, 7);

        const scene = new Transform();

        const COUNT = 900;
        const positions = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 14;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
            sizes[i] = Math.random() * 2.4 + 0.6;
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: positions },
            size: { size: 1, data: sizes }
        });

        const program = new Program(gl, {
            vertex: `
                attribute vec3 position;
                attribute float size;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float uTime;
                varying float vAlpha;
                void main() {
                    vec3 pos = position;
                    pos.y += sin(uTime * 0.15 + position.x) * 0.15;
                    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPos;
                    gl_PointSize = size * (60.0 / -mvPos.z);
                    vAlpha = clamp(1.0 - (-mvPos.z / 10.0), 0.15, 0.9);
                }
            `,
            fragment: `
                precision mediump float;
                varying float vAlpha;
                uniform vec3 uColorA;
                uniform vec3 uColorB;
                void main() {
                    vec2 uv = gl_PointCoord.xy - 0.5;
                    float d = length(uv);
                    if (d > 0.5) discard;
                    float glow = smoothstep(0.5, 0.0, d);
                    vec3 color = mix(uColorA, uColorB, uv.x + 0.5);
                    gl_FragColor = vec4(color, glow * vAlpha);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                // Signal magenta + electric blue duotone — matches --f1-red / --f1-blue.
                uColorA: { value: [0.91, 0.12, 0.55] },
                uColorB: { value: [0.23, 0.51, 0.96] }
            },
            transparent: true,
            depthTest: false
        });

        const points = new Mesh(gl, { mode: gl.POINTS, geometry, program });
        points.setParent(scene);

        const mouse = { x: 0, y: 0 };
        const target = { x: 0, y: 0 };
        hero.addEventListener('pointermove', (e) => {
            const r = hero.getBoundingClientRect();
            target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
            target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        }, { passive: true });

        function resize() {
            const r = hero.getBoundingClientRect();
            renderer.setSize(r.width, r.height);
            camera.perspective({ aspect: r.width / r.height });
        }
        window.addEventListener('resize', resize, { passive: true });
        resize();

        let raf;
        let visible = true;
        const observer = new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
        });
        observer.observe(hero);

        function animate(t) {
            raf = requestAnimationFrame(animate);
            if (!visible) return;
            mouse.x += (target.x - mouse.x) * 0.05;
            mouse.y += (target.y - mouse.y) * 0.05;
            scene.rotation.y = mouse.x * 0.15;
            scene.rotation.x = -mouse.y * 0.1;
            program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene, camera });
        }
        raf = requestAnimationFrame(animate);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(animate);
        });
    }
})();
