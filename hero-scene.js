/* Homepage hero -- Spa-Francorchamps in 3D.
 *
 * WHAT THIS IS
 * The real Circuit de Spa-Francorchamps, swept into a banked road slab with
 * actual width, thickness and its real elevation profile, lit and orbited so
 * the form reads as a solid object rather than a flat map.
 *
 * WHERE THE TRACK COMES FROM -- it is not drawn by hand or traced by eye.
 * The centreline is OpenStreetMap data: every way tagged highway=raceway and
 * sport=motor within 2.5 km of the circuit, chained end to end into one closed
 * lap. The chain comes out in correct racing order -- La Source, Eau Rouge,
 * Raidillon, Kemmel, Les Combes, Malmedy, Bruxelles, Speaker's Corner,
 * Double Gauche (Pouhon), Fagnes, Campus, Courbe Paul Frere, Blanchimont and
 * the Bus Stop chicane -- and measures 7.003 km against the official 7.004 km,
 * which is the check that the stitch is right.
 *
 * Elevation is SRTM 30 m sampled along that centreline: 364 m to 469 m, a
 * 106 m range against Spa's real ~100 m. Smoothed twice to remove SRTM's
 * post-spacing jitter, then resampled to 240 evenly spaced points.
 *
 * ONE HONEST EXAGGERATION: elevation is scaled 5x. Spa's 106 m of climb and
 * drop is the circuit's signature -- Eau Rouge and Raidillon are the reason
 * anyone builds this track in 3D at all -- but 106 m spread over a 7 km lap is
 * close to invisible in true proportion at hero size. The road is drawn at its
 * real ~14 m width, and the plan shape, corner sequence and relative gradients
 * are all true to the survey.
 *
 * WHY IT IS BUILT THIS WAY
 * Earlier versions were a flat dashed ribbon, then that plus a particle field.
 * Both were fairly called "not 3D": a plane has no volume, and particles give
 * depth cues but never shape -- you can rotate a particle cloud and learn
 * nothing about it. Solid geometry with normals, lighting and depth testing is
 * what makes a form legible as a form.
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

    // M1: phones get fewer particles and a capped pixel ratio.
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
        gl.enable(gl.DEPTH_TEST);      // real occlusion: near track hides far track

        const camera = new Camera(gl, { fov: 40, near: 0.1, far: 400 });
        const scene = new Transform();

        // ---- Spa centreline (see header for provenance) ---------------------
        // Flat [x, y, z] triples, already centred, scaled and exaggerated by the
        // offline build step. Nothing is fitted or smoothed further here.
        const SPA = [-5.978,4.785,16.531,-6.094,4.914,16.776,-5.976,4.892,17.0,-5.715,4.742,16.963,-5.463,4.641,16.855,-5.213,4.603,16.743,-4.963,4.565,16.631,-4.715,4.527,16.512,-4.469,4.489,16.391,-4.223,4.451,16.27,-3.984,4.403,16.136,-3.746,4.354,15.999,-3.504,4.285,15.871,-3.263,4.211,15.741,-3.027,4.141,15.601,-2.796,4.068,15.453,-2.57,4.003,15.299,-2.349,3.947,15.136,-2.132,3.864,14.969,-1.92,3.738,14.795,-1.711,3.576,14.617,-1.507,3.422,14.434,-1.307,3.294,14.247,-1.12,3.193,14.046,-0.934,3.102,13.845,-0.756,3.069,13.637,-0.577,3.035,13.429,-0.398,3.002,13.221,-0.219,2.968,13.013,-0.041,2.935,12.805,0.138,2.902,12.597,0.315,2.876,12.387,0.492,2.849,12.178,0.669,2.823,11.969,0.846,2.797,11.759,1.023,2.771,11.55,1.2,2.745,11.34,1.377,2.718,11.131,1.553,2.661,10.921,1.729,2.503,10.711,1.907,2.412,10.502,2.087,2.266,10.295,2.291,2.094,10.113,2.517,2.07,9.959,2.752,2.08,9.817,2.984,2.139,9.67,3.205,2.252,9.508,3.399,2.426,9.317,3.559,2.654,9.094,3.691,2.883,8.854,3.795,3.068,8.601,3.878,3.215,8.34,3.932,3.388,8.071,3.97,3.579,7.799,4.009,3.738,7.528,4.058,3.981,7.259,4.159,4.241,7.004,4.295,4.611,6.766,4.439,4.77,6.532,4.587,4.848,6.302,4.736,4.926,6.071,4.883,4.976,5.84,5.031,5.002,5.609,5.178,5.028,5.378,5.326,5.055,5.147,5.473,5.081,4.915,5.621,5.107,4.684,5.768,5.133,4.453,5.915,5.16,4.222,6.065,5.217,3.992,6.219,5.327,3.765,6.375,5.503,3.54,6.524,5.709,3.31,6.661,5.872,3.072,6.787,6.012,2.829,6.9,6.183,2.579,6.998,6.314,2.323,7.075,6.435,2.06,7.142,6.55,1.794,7.217,6.602,1.531,7.292,6.654,1.267,7.367,6.705,1.003,7.442,6.757,0.74,7.517,6.787,0.476,7.592,6.804,0.212,7.668,6.821,-0.051,7.743,6.838,-0.315,7.818,6.855,-0.579,7.893,6.872,-0.842,7.969,6.889,-1.106,8.044,6.906,-1.37,8.119,6.923,-1.633,8.194,6.939,-1.897,8.27,6.956,-2.161,8.345,6.973,-2.424,8.42,6.99,-2.688,8.496,7.007,-2.952,8.571,7.024,-3.215,8.646,7.041,-3.479,8.721,7.055,-3.743,8.796,7.069,-4.006,8.871,7.082,-4.27,8.946,7.095,-4.534,9.021,7.109,-4.798,9.096,7.122,-5.061,9.171,7.136,-5.325,9.246,7.149,-5.589,9.321,7.162,-5.853,9.396,7.176,-6.116,9.471,7.189,-6.38,9.545,7.202,-6.644,9.62,7.216,-6.908,9.695,7.229,-7.171,9.77,7.243,-7.435,9.845,7.256,-7.699,9.92,7.269,-7.963,9.995,7.283,-8.227,10.07,7.296,-8.49,10.145,7.31,-8.754,10.222,7.391,-9.017,10.303,7.579,-9.279,10.381,7.763,-9.542,10.453,7.954,-9.806,10.479,8.178,-10.078,10.41,8.222,-10.342,10.25,8.234,-10.564,10.027,8.22,-10.72,9.794,8.178,-10.863,9.609,8.138,-11.063,9.495,8.106,-11.311,9.475,8.185,-11.583,9.523,8.326,-11.852,9.589,8.345,-12.119,9.656,8.365,-12.385,9.722,8.384,-12.651,9.788,8.403,-12.917,9.848,8.468,-13.184,9.868,8.579,-13.456,9.797,8.667,-13.719,9.651,8.566,-13.95,9.445,8.354,-14.129,9.22,8.229,-14.286,8.994,8.154,-14.441,8.769,8.143,-14.598,8.544,8.133,-14.754,8.319,8.122,-14.911,8.094,8.112,-15.067,7.869,8.101,-15.224,7.643,8.091,-15.38,7.418,8.08,-15.537,7.193,8.069,-15.693,6.968,8.059,-15.85,6.743,8.048,-16.007,6.518,8.038,-16.163,6.293,8.027,-16.32,6.068,8.017,-16.476,5.843,8.006,-16.633,5.617,7.991,-16.789,5.384,7.758,-16.932,5.121,7.47,-17.0,4.849,7.304,-16.974,4.599,7.201,-16.865,4.404,7.081,-16.676,4.279,6.94,-16.433,4.246,6.779,-16.162,4.293,6.641,-15.894,4.431,6.532,-15.659,4.635,6.411,-15.477,4.869,6.307,-15.334,5.101,6.284,-15.187,5.332,6.263,-15.04,5.564,6.243,-14.894,5.796,6.211,-14.748,6.029,6.175,-14.603,6.264,6.079,-14.462,6.483,6.005,-14.298,6.64,5.938,-14.075,6.712,5.849,-13.812,6.696,5.633,-13.541,6.613,5.467,-13.28,6.526,5.398,-13.02,6.439,5.343,-12.76,6.352,5.288,-12.5,6.268,5.231,-12.239,6.185,5.173,-11.977,6.101,5.115,-11.716,6.019,5.04,-11.455,5.938,4.924,-11.193,5.86,4.767,-10.93,5.789,4.532,-10.665,5.733,4.336,-10.397,5.686,4.222,-10.127,5.637,4.142,-9.857,5.587,4.108,-9.587,5.536,4.075,-9.318,5.486,4.041,-9.048,5.436,4.008,-8.779,5.385,3.974,-8.509,5.335,3.941,-8.24,5.286,3.905,-7.97,5.24,3.863,-7.699,5.194,3.822,-7.429,5.149,3.781,-7.159,5.103,3.739,-6.888,5.057,3.698,-6.618,5.001,3.488,-6.35,4.925,3.269,-6.087,4.802,3.069,-5.843,4.639,2.926,-5.623,4.439,2.791,-5.435,4.217,2.635,-5.275,3.971,2.488,-5.155,3.705,2.291,-5.091,3.432,2.221,-5.066,3.159,2.186,-5.044,2.886,2.151,-5.023,2.612,2.001,-5.004,2.339,1.837,-5.014,2.068,1.741,-5.058,1.803,1.647,-5.128,1.549,1.559,-5.229,1.306,1.487,-5.356,1.077,1.403,-5.507,0.872,1.322,-5.689,0.685,1.252,-5.888,0.521,1.199,-6.108,0.39,1.153,-6.349,0.276,1.13,-6.598,0.173,1.125,-6.852,0.071,1.121,-7.106,-0.032,1.116,-7.36,-0.135,1.111,-7.614,-0.238,1.107,-7.868,-0.341,1.106,-8.122,-0.444,1.105,-8.377,-0.548,1.104,-8.631,-0.651,1.103,-8.885,-0.754,1.102,-9.139,-0.857,1.101,-9.393,-0.96,1.1,-9.647,-1.063,1.099,-9.901,-1.166,1.098,-10.155,-1.269,1.097,-10.409,-1.373,1.096,-10.663,-1.476,1.095,-10.917,-1.575,1.091,-11.173,-1.696,1.099,-11.418,-1.859,1.107,-11.638,-2.066,1.104,-11.817,-2.309,1.101,-11.943,-2.572,1.098,-12.014,-2.845,1.081,-12.028,-3.114,1.051,-11.978,-3.367,1.015,-11.876,-3.599,0.979,-11.729,-3.832,0.957,-11.586,-4.084,0.936,-11.479,-4.355,0.918,-11.44,-4.628,0.907,-11.458,-4.89,0.892,-11.536,-5.128,0.871,-11.668,-5.335,0.846,-11.849,-5.491,0.827,-12.074,-5.639,0.823,-12.304,-5.787,0.819,-12.535,-5.936,0.815,-12.766,-6.084,0.811,-12.996,-6.233,0.802,-13.226,-6.383,0.793,-13.456,-6.529,0.785,-13.688,-6.674,0.777,-13.921,-6.819,0.767,-14.153,-6.965,0.757,-14.385,-7.113,0.729,-14.616,-7.296,0.68,-14.819,-7.533,0.606,-14.955,-7.8,0.516,-15.01,-8.071,0.412,-14.978,-8.313,0.299,-14.85,-8.536,0.259,-14.691,-8.757,0.244,-14.529,-8.979,0.23,-14.368,-9.201,0.216,-14.206,-9.422,0.202,-14.045,-9.644,0.171,-13.884,-9.865,0.081,-13.722,-10.062,0.021,-13.532,-10.23,0.0,-13.315,-10.357,0.018,-13.073,-10.445,0.077,-12.814,-10.479,0.146,-12.542,-10.475,0.211,-12.268,-10.427,0.295,-11.999,-10.34,0.348,-11.739,-10.243,0.365,-11.483,-10.146,0.383,-11.226,-10.048,0.4,-10.97,-9.941,0.446,-10.718,-9.821,0.504,-10.472,-9.684,0.553,-10.234,-9.533,0.604,-10.006,-9.382,0.637,-9.776,-9.222,0.667,-9.554,-9.052,0.698,-9.339,-8.871,0.733,-9.133,-8.684,0.766,-8.933,-8.495,0.799,-8.734,-8.301,0.837,-8.54,-8.107,0.876,-8.346,-7.909,0.918,-8.157,-7.711,0.96,-7.967,-7.51,1.064,-7.78,-7.302,1.175,-7.602,-7.083,1.279,-7.438,-6.855,1.365,-7.285,-6.623,1.442,-7.14,-6.383,1.533,-7.006,-6.14,1.548,-6.879,-5.897,1.561,-6.753,-5.654,1.573,-6.626,-5.41,1.585,-6.5,-5.167,1.595,-6.373,-4.924,1.605,-6.246,-4.682,1.615,-6.118,-4.439,1.624,-5.991,-4.196,1.64,-5.863,-3.954,1.658,-5.734,-3.713,1.689,-5.603,-3.48,1.74,-5.46,-3.253,1.805,-5.305,-3.037,1.88,-5.138,-2.834,1.942,-4.954,-2.637,1.996,-4.762,-2.45,2.048,-4.562,-2.278,2.12,-4.349,-2.122,2.202,-4.124,-1.975,2.272,-3.892,-1.845,2.315,-3.651,-1.723,2.337,-3.406,-1.607,2.35,-3.157,-1.495,2.358,-2.907,-1.383,2.366,-2.656,-1.271,2.374,-2.406,-1.159,2.381,-2.156,-1.048,2.391,-1.905,-0.938,2.403,-1.654,-0.828,2.415,-1.403,-0.72,2.448,-1.151,-0.636,2.484,-0.89,-0.585,2.534,-0.621,-0.572,2.624,-0.347,-0.591,2.741,-0.074,-0.645,2.861,0.194,-0.732,2.977,0.454,-0.828,3.017,0.711,-0.926,3.028,0.967,-1.023,3.039,1.223,-1.12,3.051,1.48,-1.217,3.062,1.736,-1.315,3.074,1.992,-1.412,3.085,2.249,-1.509,3.096,2.505,-1.607,3.108,2.761,-1.704,3.119,3.018,-1.801,3.131,3.274,-1.899,3.142,3.53,-1.982,3.199,3.791,-2.058,3.277,4.055,-2.121,3.358,4.322,-2.177,3.457,4.59,-2.22,3.565,4.861,-2.259,3.639,5.132,-2.298,3.689,5.404,-2.322,3.722,5.677,-2.343,3.75,5.95,-2.365,3.77,6.223,-2.386,3.779,6.497,-2.407,3.789,6.77,-2.428,3.798,7.043,-2.453,3.803,7.317,-2.477,3.808,7.59,-2.501,3.813,7.863,-2.52,3.816,8.136,-2.413,3.632,8.375,-2.148,3.437,8.408,-1.874,3.375,8.389,-1.61,3.286,8.432,-1.507,3.301,8.673,-1.615,3.654,8.92,-1.769,3.795,9.146,-1.905,3.819,9.384,-2.041,3.844,9.622,-2.177,3.869,9.86,-2.313,3.893,10.098,-2.449,3.918,10.337,-2.585,3.942,10.575,-2.721,3.967,10.813,-2.857,3.991,11.051,-2.993,4.017,11.289,-3.129,4.048,11.527,-3.265,4.078,11.765,-3.4,4.109,12.003,-3.536,4.139,12.241,-3.672,4.17,12.48,-3.808,4.2,12.718,-3.944,4.231,12.956,-4.079,4.252,13.194,-4.215,4.27,13.433,-4.35,4.289,13.671,-4.486,4.307,13.91,-4.621,4.326,14.148,-4.757,4.344,14.386,-4.892,4.363,14.625,-5.028,4.382,14.863,-5.163,4.4,15.102,-5.298,4.419,15.34,-5.434,4.437,15.578,-5.569,4.462,15.817,-5.705,4.521,16.055,-5.841,4.58,16.293];
        const N = SPA.length / 3;

        // Centre it vertically so the loop orbits about its own middle rather
        // than sitting entirely above the origin.
        let ySum = 0;
        for (let i = 0; i < N; i++) ySum += SPA[i * 3 + 1];
        const yMid = ySum / N;

        function P(i) {
            const j = (((i % N) + N) % N) * 3;
            return [SPA[j], SPA[j + 1] - yMid, SPA[j + 2]];
        }

        // ---- sweep the ribbon -----------------------------------------------
        // At each sample: tangent -> lateral normal -> four corners of a banked,
        // thick road section. Consecutive sections stitch into quads, giving a
        // closed solid with a top surface, an underside and two walls.
        const HALF_W = 0.115;          // ~14 m: Spa's real road width (1 unit = 61 m)
        const THICK  = 0.085;          // slab thickness, in proportion

        const pos = [], nrm = [], along = [], across = [];

        // Banking is derived from curvature, then smoothed along the whole lap
        // before any geometry is built. Taking it per-sample raw makes the
        // ribbon twist sharply between neighbouring samples through the tight
        // corners, and the swept walls read as a comb rather than a road.
        const rawBank = new Float32Array(N);
        for (let i = 0; i < N; i++) {
            const a = P(i), b = P(i + 1), c = P(i + 2);
            let tx = b[0] - a[0], tz = b[2] - a[2];
            const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
            let ux = c[0] - b[0], uz = c[2] - b[2];
            const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
            rawBank[i] = Math.max(-0.28, Math.min(0.28, (tx * uz - tz * ux) * 3.2));
        }
        const bankAt = new Float32Array(N);
        const W = 4;                               // +-4 samples, ~135 m of track
        for (let i = 0; i < N; i++) {
            let sum = 0;
            for (let k = -W; k <= W; k++) sum += rawBank[((i + k) % N + N) % N];
            bankAt[i] = sum / (2 * W + 1);
        }

        function sample(i) {
            const a = P(i), b = P(i + 1);
            let tx = b[0] - a[0], tz = b[2] - a[2];
            const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
            const nx = -tz, nz = tx;               // lateral, in the ground plane
            return { x: a[0], y: a[1], z: a[2], nx, nz,
                     bank: bankAt[((i % N) + N) % N] };
        }

        function corners(s) {
            const dy = s.bank * HALF_W;            // banking lifts the outside edge
            return {
                to: [s.x + s.nx * HALF_W, s.y + dy, s.z + s.nz * HALF_W],
                ti: [s.x - s.nx * HALF_W, s.y - dy, s.z - s.nz * HALF_W],
                bo: [s.x + s.nx * HALF_W, s.y + dy - THICK, s.z + s.nz * HALF_W],
                bi: [s.x - s.nx * HALF_W, s.y - dy - THICK, s.z - s.nz * HALF_W]
            };
        }

        function face(a, b, c, d, n, u, t) {
            pos.push(...a, ...b, ...c, ...a, ...c, ...d);
            for (let k = 0; k < 6; k++) { nrm.push(...n); along.push(t); }
            across.push(u[0], u[1], u[1], u[0], u[1], u[0]);
        }

        function norm3(ax, ay, az, bx, by, bz) {
            const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
            const l = Math.hypot(nx, ny, nz) || 1;
            return [nx / l, ny / l, nz / l];
        }

        for (let i = 0; i < N; i++) {
            const s0 = sample(i), s1 = sample(i + 1);
            const c0 = corners(s0), c1 = corners(s1);
            const t0 = i / N;

            // road surface -- normal taken from its own two edges, so gradient
            // and banking both show up in the shading
            const nTop = norm3(
                c1.to[0] - c0.to[0], c1.to[1] - c0.to[1], c1.to[2] - c0.to[2],
                c0.ti[0] - c0.to[0], c0.ti[1] - c0.to[1], c0.ti[2] - c0.to[2]);
            face(c0.to, c1.to, c1.ti, c0.ti, nTop, [1, 0], t0);

            // Walls: these are what make it read as a slab rather than a decal.
            // aAcross 0.45 keeps them under the kerb threshold so they take the
            // accent colour instead of the bone edge highlight.
            face(c0.to, c1.to, c1.bo, c0.bo, [s0.nx, 0, s0.nz], [0.45, 0.45], t0);
            face(c0.ti, c1.ti, c1.bi, c0.bi, [-s0.nx, 0, -s0.nz], [0.45, 0.45], t0);
            face(c0.bo, c1.bo, c1.bi, c0.bi, [0, -1, 0], [0.12, 0.12], t0);
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
                    // Two lights at different angles. Directional shading is what
                    // tells the eye this is solid -- each face of the slab, and
                    // each change of gradient, catches a different amount.
                    vec3 n = normalize(vN);
                    float key  = max(dot(n, normalize(vec3(-0.4, 0.85, 0.35))), 0.0);
                    float fill = max(dot(n, normalize(vec3(0.7, 0.25, -0.5))), 0.0);
                    float lit = 0.26 + key * 0.92 + fill * 0.34;

                    float edge = smoothstep(0.72, 0.99, vAcross);   // kerb line
                    vec3 base = mix(uAccent * 0.9, uInk, edge * 0.8);

                    // the marker running the racing line
                    float d = abs(fract(vAlong - uCar + 0.5) - 0.5);
                    float car = smoothstep(0.02, 0.0, d);
                    base = mix(base, uInk, car * (1.0 - edge * 0.5));
                    lit += car * 1.6;

                    // fade the far side of the loop into the hero background so
                    // the silhouette stays clean
                    float fog = 1.0 - smoothstep(42.0, 128.0, vDepth) * 0.88;
                    float a = (0.92 + edge * 0.08) * fog + car * 0.4;
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

        // ---- sparse dust, for scale ------------------------------------------
        // Deliberately thin. Atmosphere around the object, not the subject --
        // the circuit is the subject.
        const PCOUNT = isPhone ? 90 : 260;
        const ppos = new Float32Array(PCOUNT * 3);
        const psize = new Float32Array(PCOUNT);
        for (let i = 0; i < PCOUNT; i++) {
            const r = 20 + Math.random() * 46, a = Math.random() * Math.PI * 2;
            ppos[i * 3]     = Math.cos(a) * r;
            ppos[i * 3 + 1] = (Math.random() - 0.5) * 30;
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
                        vA = smoothstep(120.0, 24.0, dist) * 0.45;
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

        // ---- camera -----------------------------------------------------------
        // Orbits the circuit. Scroll lifts the view from a low, near-horizon
        // angle toward a plan-like one, so the lap opens out as the page moves
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
            const ang = secs * 0.10 + scrollNow * 1.0;
            // Framing: the lap is 34 world units across its long axis. At a
            // 40deg vertical fov the visible width is dist * 2 * tan(20) * aspect,
            // so anything nearer than ~30 lets perspective magnification push the
            // near side of the loop off-frame as it orbits. 33 keeps the whole
            // circuit inside the hero at every orbit angle.
            const height = 12.5 + scrollNow * 18.0;   // low enough that gradients read
            const dist = 33.0 - scrollNow * 2.0;
            camera.position.set(Math.sin(ang) * dist, height, Math.cos(ang) * dist);
            camera.lookAt([0, 0, 0]);

            program.uniforms.uCar.value = (secs * 0.07) % 1.0;   // a lap every ~14s
            dust.rotation.y = -secs * 0.012;

            renderer.render({ scene, camera });
        }
        raf = requestAnimationFrame(frame);

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(frame);
        });
    }
})();
