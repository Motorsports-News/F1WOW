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
 * ORIENTATION is baked into the data, and getting it right needed a handedness
 * fix that is easy to get wrong. The ground plane (x, z) under a y-up camera is
 * LEFT-handed when seen from above, while geographic (east, north) is right-
 * handed. Mapping one to the other with what looks like a proper rotation
 * therefore renders the circuit MIRRORED -- correct coordinates, reflected
 * picture. Caught by comparing the on-screen traversal direction of the named
 * corners against the published map: opposite signs meant a reflection, not a
 * rotation. The build step now uses world x = -north, z = -east, whose
 * determinant is -1, so on screen north falls to the LEFT and east points UP --
 * the orientation of the circuit map everyone recognises.
 *
 * ONE HONEST EXAGGERATION: elevation is scaled 2.2x. An earlier pass used 5x,
 * which made the climb obvious but visibly warped the plan outline once the
 * camera was off axis -- the shape stopped matching the map. 2.2x still shows
 * Eau Rouge and Raidillon climbing without distorting the silhouette. The road
 * is drawn at its real ~14 m width, and the plan shape, corner sequence and
 * relative gradients are all true to the survey.
 *
 * VERIFIED against three independent checks, not just eyeballed: the stitched
 * lap measures 7.003 km against the official 7.004 km; the corner order matches
 * the circuit's own published list; and the shoelace signed area is negative,
 * i.e. clockwise, which is the direction Spa actually runs -- so the projection
 * is not mirrored.
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
        const SPA = [-16.531,2.106,5.978,-16.776,2.162,6.094,-17.0,2.153,5.976,-16.963,2.086,5.715,-16.855,2.042,5.463,-16.743,2.025,5.213,-16.631,2.008,4.963,-16.512,1.992,4.715,-16.391,1.975,4.469,-16.27,1.958,4.223,-16.136,1.937,3.984,-15.999,1.916,3.746,-15.871,1.885,3.504,-15.741,1.853,3.263,-15.601,1.822,3.027,-15.453,1.79,2.796,-15.299,1.761,2.57,-15.136,1.737,2.349,-14.969,1.7,2.132,-14.795,1.645,1.92,-14.617,1.573,1.711,-14.434,1.506,1.507,-14.247,1.449,1.307,-14.046,1.405,1.12,-13.845,1.365,0.934,-13.637,1.35,0.756,-13.429,1.335,0.577,-13.221,1.321,0.398,-13.013,1.306,0.219,-12.805,1.291,0.041,-12.597,1.277,-0.138,-12.387,1.265,-0.315,-12.178,1.254,-0.492,-11.969,1.242,-0.669,-11.759,1.231,-0.846,-11.55,1.219,-1.023,-11.34,1.208,-1.2,-11.131,1.196,-1.377,-10.921,1.171,-1.553,-10.711,1.101,-1.729,-10.502,1.061,-1.907,-10.295,0.997,-2.087,-10.113,0.921,-2.291,-9.959,0.911,-2.517,-9.817,0.915,-2.752,-9.67,0.941,-2.984,-9.508,0.991,-3.205,-9.317,1.068,-3.399,-9.094,1.168,-3.559,-8.854,1.269,-3.691,-8.601,1.35,-3.795,-8.34,1.415,-3.878,-8.071,1.491,-3.932,-7.799,1.575,-3.97,-7.528,1.645,-4.009,-7.259,1.752,-4.058,-7.004,1.866,-4.159,-6.766,2.029,-4.295,-6.532,2.099,-4.439,-6.302,2.133,-4.587,-6.071,2.167,-4.736,-5.84,2.189,-4.883,-5.609,2.201,-5.031,-5.378,2.212,-5.178,-5.147,2.224,-5.326,-4.915,2.236,-5.473,-4.684,2.247,-5.621,-4.453,2.259,-5.768,-4.222,2.27,-5.915,-3.992,2.295,-6.065,-3.765,2.344,-6.219,-3.54,2.421,-6.375,-3.31,2.512,-6.524,-3.072,2.584,-6.661,-2.829,2.645,-6.787,-2.579,2.721,-6.9,-2.323,2.778,-6.998,-2.06,2.831,-7.075,-1.794,2.882,-7.142,-1.531,2.905,-7.217,-1.267,2.928,-7.292,-1.003,2.95,-7.367,-0.74,2.973,-7.442,-0.476,2.986,-7.517,-0.212,2.994,-7.592,0.051,3.001,-7.668,0.315,3.009,-7.743,0.579,3.016,-7.818,0.842,3.024,-7.893,1.106,3.031,-7.969,1.37,3.038,-8.044,1.633,3.046,-8.119,1.897,3.053,-8.194,2.161,3.061,-8.27,2.424,3.068,-8.345,2.688,3.076,-8.42,2.952,3.083,-8.496,3.215,3.091,-8.571,3.479,3.098,-8.646,3.743,3.104,-8.721,4.006,3.11,-8.796,4.27,3.116,-8.871,4.534,3.122,-8.946,4.798,3.128,-9.021,5.061,3.134,-9.096,5.325,3.14,-9.171,5.589,3.146,-9.246,5.853,3.151,-9.321,6.116,3.157,-9.396,6.38,3.163,-9.471,6.644,3.169,-9.545,6.908,3.175,-9.62,7.171,3.181,-9.695,7.435,3.187,-9.77,7.699,3.193,-9.845,7.963,3.199,-9.92,8.227,3.204,-9.995,8.49,3.21,-10.07,8.754,3.216,-10.145,9.017,3.252,-10.222,9.279,3.335,-10.303,9.542,3.416,-10.381,9.806,3.5,-10.453,10.078,3.598,-10.479,10.342,3.618,-10.41,10.564,3.623,-10.25,10.72,3.617,-10.027,10.863,3.598,-9.794,11.063,3.581,-9.609,11.311,3.566,-9.495,11.583,3.602,-9.475,11.852,3.663,-9.523,12.119,3.672,-9.589,12.385,3.68,-9.656,12.651,3.689,-9.722,12.917,3.697,-9.788,13.184,3.726,-9.848,13.456,3.775,-9.868,13.719,3.813,-9.797,13.95,3.769,-9.651,14.129,3.676,-9.445,14.286,3.621,-9.22,14.441,3.588,-8.994,14.598,3.583,-8.769,14.754,3.578,-8.544,14.911,3.574,-8.319,15.067,3.569,-8.094,15.224,3.564,-7.869,15.38,3.56,-7.643,15.537,3.555,-7.418,15.693,3.551,-7.193,15.85,3.546,-6.968,16.007,3.541,-6.743,16.163,3.537,-6.518,16.32,3.532,-6.293,16.476,3.527,-6.068,16.633,3.523,-5.843,16.789,3.516,-5.617,16.932,3.414,-5.384,17.0,3.287,-5.121,16.974,3.214,-4.849,16.865,3.169,-4.599,16.676,3.116,-4.404,16.433,3.053,-4.279,16.162,2.983,-4.246,15.894,2.922,-4.293,15.659,2.874,-4.431,15.477,2.821,-4.635,15.334,2.775,-4.869,15.187,2.765,-5.101,15.04,2.756,-5.332,14.894,2.747,-5.564,14.748,2.733,-5.796,14.603,2.717,-6.029,14.462,2.675,-6.264,14.298,2.642,-6.483,14.075,2.613,-6.64,13.812,2.574,-6.712,13.541,2.479,-6.696,13.28,2.405,-6.613,13.02,2.375,-6.526,12.76,2.351,-6.439,12.5,2.327,-6.352,12.239,2.302,-6.268,11.977,2.276,-6.185,11.716,2.251,-6.101,11.455,2.218,-6.019,11.193,2.167,-5.938,10.93,2.098,-5.86,10.665,1.994,-5.789,10.397,1.908,-5.733,10.127,1.858,-5.686,9.857,1.822,-5.637,9.587,1.808,-5.587,9.318,1.793,-5.536,9.048,1.778,-5.486,8.779,1.763,-5.436,8.509,1.749,-5.385,8.24,1.734,-5.335,7.97,1.718,-5.286,7.699,1.7,-5.24,7.429,1.682,-5.194,7.159,1.664,-5.149,6.888,1.645,-5.103,6.618,1.627,-5.057,6.35,1.535,-5.001,6.087,1.438,-4.925,5.843,1.35,-4.802,5.623,1.288,-4.639,5.435,1.228,-4.439,5.275,1.159,-4.217,5.155,1.095,-3.971,5.091,1.008,-3.705,5.066,0.977,-3.432,5.044,0.962,-3.159,5.023,0.946,-2.886,5.004,0.88,-2.612,5.014,0.808,-2.339,5.058,0.766,-2.068,5.128,0.725,-1.803,5.229,0.686,-1.549,5.356,0.654,-1.306,5.507,0.617,-1.077,5.689,0.582,-0.872,5.888,0.551,-0.685,6.108,0.528,-0.521,6.349,0.507,-0.39,6.598,0.497,-0.276,6.852,0.495,-0.173,7.106,0.493,-0.071,7.36,0.491,0.032,7.614,0.489,0.135,7.868,0.487,0.238,8.122,0.487,0.341,8.377,0.486,0.444,8.631,0.486,0.548,8.885,0.485,0.651,9.139,0.485,0.754,9.393,0.484,0.857,9.647,0.484,0.96,9.901,0.484,1.063,10.155,0.483,1.166,10.409,0.483,1.269,10.663,0.482,1.373,10.917,0.482,1.476,11.173,0.48,1.575,11.418,0.483,1.696,11.638,0.487,1.859,11.817,0.486,2.066,11.943,0.485,2.309,12.014,0.483,2.572,12.028,0.476,2.845,11.978,0.463,3.114,11.876,0.447,3.367,11.729,0.431,3.599,11.586,0.421,3.832,11.479,0.412,4.084,11.44,0.404,4.355,11.458,0.399,4.628,11.536,0.393,4.89,11.668,0.383,5.128,11.849,0.372,5.335,12.074,0.364,5.491,12.304,0.362,5.639,12.535,0.36,5.787,12.766,0.359,5.936,12.996,0.357,6.084,13.226,0.353,6.233,13.456,0.349,6.383,13.688,0.345,6.529,13.921,0.342,6.674,14.153,0.338,6.819,14.385,0.333,6.965,14.616,0.321,7.113,14.819,0.299,7.296,14.955,0.267,7.533,15.01,0.227,7.8,14.978,0.181,8.071,14.85,0.131,8.313,14.691,0.114,8.536,14.529,0.108,8.757,14.368,0.101,8.979,14.206,0.095,9.201,14.045,0.089,9.422,13.884,0.075,9.644,13.722,0.036,9.865,13.532,0.009,10.062,13.315,0.0,10.23,13.073,0.008,10.357,12.814,0.034,10.445,12.542,0.064,10.479,12.268,0.093,10.475,11.999,0.13,10.427,11.739,0.153,10.34,11.483,0.161,10.243,11.226,0.168,10.146,10.97,0.176,10.048,10.718,0.196,9.941,10.472,0.222,9.821,10.234,0.243,9.684,10.006,0.266,9.533,9.776,0.28,9.382,9.554,0.294,9.222,9.339,0.307,9.052,9.133,0.323,8.871,8.933,0.337,8.684,8.734,0.351,8.495,8.54,0.368,8.301,8.346,0.385,8.107,8.157,0.404,7.909,7.967,0.422,7.711,7.78,0.468,7.51,7.602,0.517,7.302,7.438,0.563,7.083,7.285,0.601,6.855,7.14,0.634,6.623,7.006,0.675,6.383,6.879,0.681,6.14,6.753,0.687,5.897,6.626,0.692,5.654,6.5,0.697,5.41,6.373,0.702,5.167,6.246,0.706,4.924,6.118,0.71,4.682,5.991,0.715,4.439,5.863,0.722,4.196,5.734,0.73,3.954,5.603,0.743,3.713,5.46,0.766,3.48,5.305,0.794,3.253,5.138,0.827,3.037,4.954,0.855,2.834,4.762,0.878,2.637,4.562,0.901,2.45,4.349,0.933,2.278,4.124,0.969,2.122,3.892,1.0,1.975,3.651,1.019,1.845,3.406,1.028,1.723,3.157,1.034,1.607,2.907,1.038,1.495,2.656,1.041,1.383,2.406,1.044,1.271,2.156,1.048,1.159,1.905,1.052,1.048,1.654,1.057,0.938,1.403,1.063,0.828,1.151,1.077,0.72,0.89,1.093,0.636,0.621,1.115,0.585,0.347,1.155,0.572,0.074,1.206,0.591,-0.194,1.259,0.645,-0.454,1.31,0.732,-0.711,1.327,0.828,-0.967,1.332,0.926,-1.223,1.337,1.023,-1.48,1.342,1.12,-1.736,1.347,1.217,-1.992,1.352,1.315,-2.249,1.357,1.412,-2.505,1.362,1.509,-2.761,1.367,1.607,-3.018,1.372,1.704,-3.274,1.378,1.801,-3.53,1.383,1.899,-3.791,1.407,1.982,-4.055,1.442,2.058,-4.322,1.478,2.121,-4.59,1.521,2.177,-4.861,1.569,2.22,-5.132,1.601,2.259,-5.404,1.623,2.298,-5.677,1.638,2.322,-5.95,1.65,2.343,-6.223,1.659,2.365,-6.497,1.663,2.386,-6.77,1.667,2.407,-7.043,1.671,2.428,-7.317,1.673,2.453,-7.59,1.676,2.477,-7.863,1.678,2.501,-8.136,1.679,2.52,-8.375,1.598,2.413,-8.408,1.512,2.148,-8.389,1.485,1.874,-8.432,1.446,1.61,-8.673,1.452,1.507,-8.92,1.608,1.615,-9.146,1.67,1.769,-9.384,1.681,1.905,-9.622,1.691,2.041,-9.86,1.702,2.177,-10.098,1.713,2.313,-10.337,1.724,2.449,-10.575,1.735,2.585,-10.813,1.745,2.721,-11.051,1.756,2.857,-11.289,1.768,2.993,-11.527,1.781,3.129,-11.765,1.795,3.265,-12.003,1.808,3.4,-12.241,1.821,3.536,-12.48,1.835,3.672,-12.718,1.848,3.808,-12.956,1.862,3.944,-13.194,1.871,4.079,-13.433,1.879,4.215,-13.671,1.887,4.35,-13.91,1.895,4.486,-14.148,1.903,4.621,-14.386,1.912,4.757,-14.625,1.92,4.892,-14.863,1.928,5.028,-15.102,1.936,5.163,-15.34,1.944,5.298,-15.578,1.952,5.434,-15.817,1.963,5.569,-16.055,1.989,5.705,-16.293,2.015,5.841];
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

        // ---- framing --------------------------------------------------------
        // Fit the whole lap on screen by MEASURING it, not by guessing a camera
        // distance. Hand-picked distances kept clipping the near side off the
        // bottom of the hero, because a 40deg view magnifies whatever is closest
        // and the amount depends on the viewport's aspect ratio -- which differs
        // on every phone. This projects all 420 centreline points through the
        // real projection matrix and binary-searches the smallest distance that
        // still keeps every one of them inside the frame.
        const BASE_RADIUS = 33.0, BASE_HEIGHT = 27.0;   // sets the ~40deg angle
        let fitScale = 1;

        function worstNdc(k, targetY) {
            // Check the sway extremes as well as centre: whichever angle pushes
            // the lap furthest out is the one that has to fit.
            let worst = 0;
            for (const ang of [-0.68, 0, 0.68]) {
                camera.position.set(Math.sin(ang) * BASE_RADIUS * k,
                                    BASE_HEIGHT * k,
                                    Math.cos(ang) * BASE_RADIUS * k);
                camera.lookAt([0, targetY, 0]);
                camera.updateMatrixWorld();
                const m = camera.projectionViewMatrix;
                for (let i = 0; i < N; i++) {
                    const p = P(i);
                    const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
                    if (w <= 0.0001) return Infinity;      // behind the camera
                    const x = (m[0] * p[0] + m[4] * p[1] + m[8]  * p[2] + m[12]) / w;
                    const y = (m[1] * p[0] + m[5] * p[1] + m[9]  * p[2] + m[13]) / w;
                    worst = Math.max(worst, Math.abs(x), Math.abs(y));
                }
            }
            return worst;
        }

        function fit() {
            // 0.90 leaves a little breathing room at the edges of the hero.
            let lo = 0.4, hi = 3.5;
            for (let i = 0; i < 22; i++) {
                const mid = (lo + hi) / 2;
                if (worstNdc(mid, 0) <= 0.90) hi = mid; else lo = mid;
            }
            fitScale = hi;
        }

        function resize() {
            const r = hero.getBoundingClientRect();
            renderer.setSize(r.width, r.height);
            camera.perspective({ aspect: r.width / Math.max(r.height, 1) });
            fit();                          // aspect changed, so refit
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

            // A SWAY, not a full orbit. Circling all the way round spends most
            // of the time on angles where the lap is edge-on and unrecognisable;
            // the point of using the real circuit is lost if you can never tell
            // which circuit it is. +-19deg keeps the canonical silhouette legible
            // the whole time while still moving the viewpoint enough for the
            // parallax to read as solid.
            const ang = Math.sin(secs * 0.085) * 0.33 + scrollNow * 0.35;

            // Framing: the lap is 34 units on its long axis (now horizontal) and
            // 21 deep. Elevation ~40deg shows the plan shape and the slab edges
            // at the same time; lower reads as a sliver, higher flattens to a map.
            // Scroll tilts DOWN, not up. At rest the view sits high enough that
            // the lap reads as the circuit map you recognise; scrolling drops the
            // eye toward the horizon, where the slab edges and the Eau Rouge /
            // Raidillon climb are what you see instead. Radius grows as height
            // falls so the eye never gets closer than the fit was computed for.
            const radius = BASE_RADIUS * fitScale * (1 + scrollNow * 0.35);
            const height = BASE_HEIGHT * fitScale * (1 - scrollNow * 0.55);
            camera.position.set(Math.sin(ang) * radius, height, Math.cos(ang) * radius);
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
