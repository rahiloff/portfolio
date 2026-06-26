/**
 * Three.js Hero Scene — Floating 3D Geometric Shapes, Starfield & Shooting Stars
 * Globe removed to keep video clearly visible.
 * Shapes positioned at the edges so the center video is unobstructed.
 */
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 14;
    camera.position.x = 0;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    // === Floating 3D Geometric Shapes (edges only — avoid center) ===
    const floatingShapes = [];
    const shapeGroup = new THREE.Group();

    const shapeConfigs = [
        // Far LEFT edge shapes (behind text content area)
        { type: 'icosahedron', size: 0.6, x: -14, y: 4, z: -8, color: 0x00f5ff, opacity: 0.10, rotSpeed: { x: 0.003, y: 0.005, z: 0.002 }, floatAmp: 0.8, floatSpeed: 0.5 },
        { type: 'octahedron', size: 0.45, x: -12, y: -3, z: -5, color: 0x39ff14, opacity: 0.08, rotSpeed: { x: 0.004, y: 0.003, z: 0.006 }, floatAmp: 1.0, floatSpeed: 0.7 },
        { type: 'tetrahedron', size: 0.35, x: -16, y: 0, z: -10, color: 0xbd00ff, opacity: 0.06, rotSpeed: { x: 0.005, y: 0.002, z: 0.004 }, floatAmp: 0.6, floatSpeed: 0.4 },

        // TOP edge shapes
        { type: 'dodecahedron', size: 0.5, x: -5, y: 8, z: -12, color: 0x00f5ff, opacity: 0.07, rotSpeed: { x: 0.002, y: 0.004, z: 0.003 }, floatAmp: 0.7, floatSpeed: 0.6 },
        { type: 'torusKnot', size: 0.35, x: 5, y: 9, z: -14, color: 0x39ff14, opacity: 0.05, rotSpeed: { x: 0.003, y: 0.006, z: 0.002 }, floatAmp: 0.5, floatSpeed: 0.3 },

        // BOTTOM edge shapes
        { type: 'tetrahedron', size: 0.5, x: -8, y: -7, z: -9, color: 0x00f5ff, opacity: 0.07, rotSpeed: { x: 0.004, y: 0.005, z: 0.001 }, floatAmp: 0.6, floatSpeed: 0.55 },
        { type: 'octahedron', size: 0.4, x: 6, y: -8, z: -7, color: 0xbd00ff, opacity: 0.08, rotSpeed: { x: 0.003, y: 0.002, z: 0.007 }, floatAmp: 0.5, floatSpeed: 0.65 },

        // RIGHT edge shapes (subtle, don't block video subject)
        { type: 'icosahedron', size: 0.5, x: 16, y: 5, z: -10, color: 0xbd00ff, opacity: 0.06, rotSpeed: { x: 0.002, y: 0.003, z: 0.005 }, floatAmp: 1.0, floatSpeed: 0.35 },
        { type: 'torus', size: 0.4, x: 18, y: -3, z: -8, color: 0x00f5ff, opacity: 0.07, rotSpeed: { x: 0.006, y: 0.002, z: 0.003 }, floatAmp: 0.5, floatSpeed: 0.8 },

        // FAR BACKGROUND (very subtle depth fill)
        { type: 'icosahedron', size: 1.2, x: -20, y: 10, z: -30, color: 0x00f5ff, opacity: 0.03, rotSpeed: { x: 0.001, y: 0.002, z: 0.001 }, floatAmp: 1.5, floatSpeed: 0.2 },
        { type: 'octahedron', size: 1.5, x: 22, y: -8, z: -35, color: 0x39ff14, opacity: 0.02, rotSpeed: { x: 0.002, y: 0.001, z: 0.002 }, floatAmp: 2.0, floatSpeed: 0.15 },
        { type: 'dodecahedron', size: 1.0, x: 0, y: -12, z: -25, color: 0xbd00ff, opacity: 0.03, rotSpeed: { x: 0.001, y: 0.003, z: 0.002 }, floatAmp: 1.0, floatSpeed: 0.25 },
    ];

    shapeConfigs.forEach(cfg => {
        let geometry;
        switch (cfg.type) {
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(cfg.size, 1);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(cfg.size, 0);
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(cfg.size, 0);
                break;
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(cfg.size, 0);
                break;
            case 'torusKnot':
                geometry = new THREE.TorusKnotGeometry(cfg.size, cfg.size * 0.3, 64, 8, 2, 3);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(cfg.size, cfg.size * 0.25, 12, 24);
                break;
            default:
                geometry = new THREE.IcosahedronGeometry(cfg.size, 1);
        }

        const material = new THREE.MeshBasicMaterial({
            color: cfg.color,
            wireframe: true,
            transparent: true,
            opacity: cfg.opacity
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(cfg.x, cfg.y, cfg.z);
        mesh.userData = {
            rotSpeed: cfg.rotSpeed,
            floatAmp: cfg.floatAmp,
            floatSpeed: cfg.floatSpeed,
            baseY: cfg.y,
            phaseOffset: Math.random() * Math.PI * 2
        };

        shapeGroup.add(mesh);
        floatingShapes.push(mesh);
    });

    scene.add(shapeGroup);

    // === Starfield (subtle background stars) ===
    const starsCount = 800;
    const starsPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
        starsPositions[i * 3] = (Math.random() - 0.5) * 140;
        starsPositions[i * 3 + 1] = (Math.random() - 0.5) * 140;
        starsPositions[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }

    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.08,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // === Shooting Stars / Comets ===
    const comets = [];
    const cometCount = 4;

    function createComet() {
        const trailLen = 25;
        const positions = new Float32Array(trailLen * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: Math.random() > 0.5 ? 0x00f5ff : 0x39ff14,
            size: 0.06,
            transparent: true,
            opacity: 0
        });

        const comet = new THREE.Points(geometry, material);
        comet.userData = {
            active: false,
            speed: 0.3 + Math.random() * 0.4,
            life: 0,
            maxLife: 80 + Math.random() * 60,
            startX: 0, startY: 0, startZ: 0,
            dirX: 0, dirY: 0, dirZ: 0,
            trailLen: trailLen
        };

        scene.add(comet);
        return comet;
    }

    for (let i = 0; i < cometCount; i++) {
        comets.push(createComet());
    }

    function launchComet(comet) {
        const d = comet.userData;
        d.active = true;
        d.life = 0;
        d.startX = (Math.random() - 0.5) * 60;
        d.startY = (Math.random() - 0.5) * 40 + 15;
        d.startZ = (Math.random() - 0.5) * 30 - 10;
        d.dirX = (Math.random() - 0.5) * 0.8;
        d.dirY = -(0.5 + Math.random() * 0.5);
        d.dirZ = (Math.random() - 0.5) * 0.3;
        comet.material.opacity = 0.7;
    }

    function updateComets() {
        comets.forEach(comet => {
            const d = comet.userData;
            if (!d.active) {
                if (Math.random() < 0.002) launchComet(comet);
                return;
            }

            d.life++;
            const positions = comet.geometry.attributes.position.array;

            for (let i = d.trailLen - 1; i > 0; i--) {
                positions[i * 3] = positions[(i - 1) * 3];
                positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
                positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
            }

            positions[0] = d.startX + d.dirX * d.life * d.speed;
            positions[1] = d.startY + d.dirY * d.life * d.speed;
            positions[2] = d.startZ + d.dirZ * d.life * d.speed;

            comet.geometry.attributes.position.needsUpdate = true;
            comet.material.opacity = (1 - d.life / d.maxLife) * 0.6;

            if (d.life >= d.maxLife) {
                d.active = false;
                comet.material.opacity = 0;
            }
        });
    }

    // === Mouse Parallax ===
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // === Animation Loop ===
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        const elapsed = clock.getElapsedTime();

        // === Floating 3D Shapes Animation ===
        floatingShapes.forEach(shape => {
            const d = shape.userData;
            shape.rotation.x += d.rotSpeed.x;
            shape.rotation.y += d.rotSpeed.y;
            shape.rotation.z += d.rotSpeed.z;
            shape.position.y = d.baseY + Math.sin(elapsed * d.floatSpeed + d.phaseOffset) * d.floatAmp;
            shape.position.x += Math.sin(elapsed * d.floatSpeed * 0.5 + d.phaseOffset) * 0.001;
        });

        // Subtle parallax for floating shapes
        shapeGroup.rotation.x += (mouse.y * 0.015 - shapeGroup.rotation.x) * 0.008;
        shapeGroup.rotation.y += (mouse.x * 0.015 - shapeGroup.rotation.y) * 0.008;

        // Shooting stars
        updateComets();

        // Stars subtle rotation
        stars.rotation.y += 0.00008;
        stars.rotation.x += 0.00003;

        // Camera parallax
        targetRotation.x = mouse.y * 0.08;
        targetRotation.y = mouse.x * 0.08;
        camera.rotation.x += (targetRotation.x - camera.rotation.x) * 0.02;
        camera.rotation.y += (targetRotation.y - camera.rotation.y) * 0.02;

        renderer.render(scene, camera);
    }

    // === Visibility Observer — pause rendering when hero is off-screen ===
    let isVisible = true;
    const visibilityObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    visibilityObserver.observe(canvas.parentElement);

    animate();

    // === Resize ===
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            renderer.setSize(0, 0);
            return;
        }
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
