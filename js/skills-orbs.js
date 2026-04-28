/**
 * Three.js Skills Background — Floating Glowing Orbs
 */
(function () {
    const canvas = document.getElementById('skills-canvas');
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const section = canvas.parentElement;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, section.offsetWidth / section.offsetHeight, 0.1, 100);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(section.offsetWidth, section.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Skill orbs data
    const skillColors = [
        0x00f5ff, // cyan
        0x39ff14  // green
    ];

    const orbs = [];
    const orbCount = 25;

    for (let i = 0; i < orbCount; i++) {
        const radius = 0.15 + Math.random() * 0.35;
        const color = skillColors[Math.floor(Math.random() * skillColors.length)];

        // Core orb
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.3
        });
        const orb = new THREE.Mesh(geometry, material);

        // Outer glow ring
        const ringGeometry = new THREE.RingGeometry(radius * 1.3, radius * 1.6, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        orb.add(ring);

        // Random position spread across the section
        orb.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 10
        );

        orb.userData = {
            baseY: orb.position.y,
            baseX: orb.position.x,
            speed: 0.3 + Math.random() * 0.7,
            amplitude: 0.5 + Math.random() * 1.5,
            phase: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02
        };

        scene.add(orb);
        orbs.push(orb);
    }

    // Animation
    const clock = new THREE.Clock();
    let isVisible = false;

    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;

        const elapsed = clock.getElapsedTime();

        orbs.forEach(orb => {
            const d = orb.userData;
            orb.position.y = d.baseY + Math.sin(elapsed * d.speed + d.phase) * d.amplitude;
            orb.position.x = d.baseX + Math.cos(elapsed * d.speed * 0.5 + d.phase) * d.amplitude * 0.3;
            orb.rotation.z += d.rotSpeed;

            // Ring rotation
            if (orb.children[0]) {
                orb.children[0].rotation.x += 0.01;
                orb.children[0].rotation.y += 0.005;
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    // Visibility observer — only animate when in viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    }, { threshold: 0.1 });

    observer.observe(section);

    // Resize
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            renderer.setSize(0, 0);
            return;
        }
        const w = section.offsetWidth;
        const h = section.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
})();
