/**
 * Three.js Hero Scene — Wireframe Globe with Orbiting Nodes & Starfield
 */
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return; // Skip heavy 3D on mobile

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
        // Remove old and dispose geometries to prevent memory leak
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
