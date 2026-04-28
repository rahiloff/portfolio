/**
 * Three.js Hero Scene — Wireframe Globe with Orbiting Nodes, Starfield,
 * Orbit Rings, Shooting Stars & Globe Pulse
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
    camera.position.x = 4;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // === Wireframe Globe ===
    const globeGeometry = new THREE.IcosahedronGeometry(4.5, 3);
    const globeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Inner globe for depth
    const innerGeometry = new THREE.IcosahedronGeometry(4.2, 2);
    const innerMaterial = new THREE.MeshBasicMaterial({
        color: 0x39ff14,
        wireframe: true,
        transparent: true,
        opacity: 0.06
    });
    const innerGlobe = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerGlobe);

    // === Orbiting Nodes ===
    const nodeCount = 35;
    const nodes = [];
    const nodeGroup = new THREE.Group();

    for (let i = 0; i < nodeCount; i++) {
        const size = 0.04 + Math.random() * 0.06;
        const nodeGeometry = new THREE.SphereGeometry(size, 8, 8);
        const color = Math.random() > 0.5 ? 0x00f5ff : 0x39ff14;
        const nodeMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 5.2 + Math.random() * 2.5;

        node.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        node.userData = {
            theta, phi, radius,
            speed: 0.0008 + Math.random() * 0.0015,
            originalRadius: radius
        };

        nodeGroup.add(node);
        nodes.push(node);
    }
    scene.add(nodeGroup);

    // === Connection Lines ===
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.08
    });

    let connectionLines = [];

    function updateConnections() {
        connectionLines.forEach(line => {
            line.geometry.dispose();
            scene.remove(line);
        });
        connectionLines = [];

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = nodes[i].position.distanceTo(nodes[j].position);
                if (dist < 3.5) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        nodes[i].position.clone(),
                        nodes[j].position.clone()
                    ]);
                    const line = new THREE.Line(geometry, linesMaterial);
                    scene.add(line);
                    connectionLines.push(line);
                }
            }
        }
    }

    // === Starfield ===
    const starsCount = 2500;
    const starsPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
        starsPositions[i * 3] = (Math.random() - 0.5) * 120;
        starsPositions[i * 3 + 1] = (Math.random() - 0.5) * 120;
        starsPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.12,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // === Orbit Rings (Saturn-style) ===
    const ringGroup = new THREE.Group();
    const ringConfigs = [
        { radius: 6.2, tube: 0.015, color: 0x00f5ff, opacity: 0.12, rotX: 1.2, rotZ: 0.3 },
        { radius: 7.0, tube: 0.01, color: 0x39ff14, opacity: 0.08, rotX: 0.8, rotZ: -0.5 },
        { radius: 7.8, tube: 0.01, color: 0x00f5ff, opacity: 0.06, rotX: 1.5, rotZ: 0.7 }
    ];

    ringConfigs.forEach(cfg => {
        const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({
            color: cfg.color,
            transparent: true,
            opacity: cfg.opacity
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = cfg.rotX;
        ring.rotation.z = cfg.rotZ;
        ringGroup.add(ring);
    });
    scene.add(ringGroup);

    // === Shooting Stars / Comets ===
    const comets = [];
    const cometCount = 5;

    function createComet() {
        const trailLen = 30;
        const positions = new Float32Array(trailLen * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: Math.random() > 0.5 ? 0x00f5ff : 0x39ff14,
            size: 0.08,
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
        comet.material.opacity = 0.9;
    }

    function updateComets() {
        comets.forEach(comet => {
            const d = comet.userData;
            if (!d.active) {
                if (Math.random() < 0.003) launchComet(comet);
                return;
            }

            d.life++;
            const positions = comet.geometry.attributes.position.array;

            // Shift trail backward
            for (let i = d.trailLen - 1; i > 0; i--) {
                positions[i * 3] = positions[(i - 1) * 3];
                positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
                positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
            }

            // New head position
            positions[0] = d.startX + d.dirX * d.life * d.speed;
            positions[1] = d.startY + d.dirY * d.life * d.speed;
            positions[2] = d.startZ + d.dirZ * d.life * d.speed;

            comet.geometry.attributes.position.needsUpdate = true;

            // Fade out
            comet.material.opacity = (1 - d.life / d.maxLife) * 0.8;

            if (d.life >= d.maxLife) {
                d.active = false;
                comet.material.opacity = 0;
            }
        });
    }

    // === Globe Pulse Phase ===
    let pulsePhase = 0;

    // === Mouse Parallax ===
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // === Animation Loop ===
    let frameCount = 0;
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        frameCount++;

        // Globe rotation
        globe.rotation.y += 0.002;
        globe.rotation.x += 0.0005;
        innerGlobe.rotation.y -= 0.0015;
        innerGlobe.rotation.x -= 0.0008;

        // Globe pulse — breathing opacity
        pulsePhase += 0.015;
        globe.material.opacity = 0.15 + Math.sin(pulsePhase) * 0.05;

        // Orbit rings slow rotation
        ringGroup.rotation.y += 0.001;
        ringGroup.rotation.x += 0.0003;

        // Node orbiting
        nodes.forEach(node => {
            const d = node.userData;
            d.theta += d.speed;
            node.position.set(
                d.radius * Math.sin(d.phi) * Math.cos(d.theta),
                d.radius * Math.sin(d.phi) * Math.sin(d.theta) + Math.sin(elapsed + d.theta) * 0.3,
                d.radius * Math.cos(d.phi)
            );
        });

        // Update connections every 10 frames
        if (frameCount % 10 === 0) {
            updateConnections();
        }

        // Shooting stars
        updateComets();

        // Stars subtle rotation
        stars.rotation.y += 0.0001;
        stars.rotation.x += 0.00005;

        // Mouse parallax
        targetRotation.x = mouse.y * 0.15;
        targetRotation.y = mouse.x * 0.15;
        camera.rotation.x += (targetRotation.x - camera.rotation.x) * 0.03;
        camera.rotation.y += (targetRotation.y - camera.rotation.y) * 0.03;

        renderer.render(scene, camera);
    }

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
