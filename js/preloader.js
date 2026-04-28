/**
 * Terminal Boot Preloader — Authentic DevOps Server Boot Sequence
 * Displays a realistic Linux boot sequence before revealing the portfolio.
 */
(function () {
    'use strict';

    const isMobile = window.innerWidth < 768;
    const isReturning = sessionStorage.getItem('rahil_visited');

    // Boot messages — authentic DevOps/Linux boot sequence
    // Each entry: [text, colorClass, delay(ms)]
    const fullBootSequence = [
        ['BIOS POST: System memory check... 32768 MB OK', 'boot-white', 40],
        ['Initializing UEFI firmware v2.4.1-rahil...', 'boot-muted', 30],
        ['', '', 60],
        ['[    0.000000] Linux version 6.8.0-devops (rahil@cloud-builder)', 'boot-white', 35],
        ['[    0.012441] Command line: BOOT_IMAGE=/vmlinuz root=/dev/sda1 quiet', 'boot-muted', 25],
        ['[    0.034891] DMI: Rahil DevOps Workstation v1.0, BIOS 2026.04', 'boot-muted', 25],
        ['[    0.052100] Memory: 32768MB available', 'boot-white', 20],
        ['', '', 40],
        ['[  OK  ] Started systemd-journald.service — Journal Service', 'boot-ok', 45],
        ['[  OK  ] Started systemd-networkd.service — Network Configuration', 'boot-ok', 40],
        ['[  OK  ] Reached target network-online.target', 'boot-ok', 35],
        ['', '', 50],
        ['[ INFO ] Loading DevOps toolkit configuration...', 'boot-cyan', 30],
        ['[  OK  ] Docker Engine v27.5.1 .......................... active (running)', 'boot-ok', 55],
        ['[  OK  ] containerd.io v1.7.24 ......................... active (running)', 'boot-ok', 40],
        ['[  OK  ] Kubernetes kubelet v1.31.0 .................... active (running)', 'boot-ok', 50],
        ['[ INFO ] └── kubectl context: production-cluster (3 nodes)', 'boot-cyan', 35],
        ['', '', 30],
        ['[ INFO ] Bootstrapping cloud providers...', 'boot-cyan', 40],
        ['[  OK  ] AWS CLI v2.22 — Region: ap-south-1 ........... configured', 'boot-ok', 50],
        ['[  OK  ] Terraform v1.9.8 ............................. initialized', 'boot-ok', 40],
        ['[ INFO ] └── State backend: s3://rahil-tfstate/prod', 'boot-cyan', 30],
        ['', '', 30],
        ['[  OK  ] Nginx v1.27.3 — reverse proxy ................ active', 'boot-ok', 45],
        ['[  OK  ] GitLab Runner v17.8 — CI/CD executor ......... registered', 'boot-ok', 40],
        ['[  OK  ] GitHub Actions — self-hosted runner ........... online', 'boot-ok', 35],
        ['', '', 30],
        ['[ INFO ] Initializing monitoring stack...', 'boot-cyan', 35],
        ['[  OK  ] Prometheus v2.54 — metrics collector ......... scraping', 'boot-ok', 45],
        ['[  OK  ] Grafana v11.4 — dashboard server ............. port 3000', 'boot-ok', 40],
        ['[  OK  ] CloudWatch Agent ............................. streaming', 'boot-ok', 35],
        ['', '', 30],
        ['[  OK  ] Bash v5.2.37 — automation engine ............. loaded', 'boot-ok', 30],
        ['[  OK  ] SSH Agent — 3 keys loaded .................... ready', 'boot-ok', 30],
        ['[  OK  ] UFW firewall — 22/tcp, 80, 443 ............... active', 'boot-ok', 25],
        ['', '', 40],
        ['[ INFO ] Running pre-flight checks...', 'boot-cyan', 50],
        ['         ├── SSL certificates ............. ✓ valid (365 days)', 'boot-muted', 35],
        ['         ├── DNS resolution ............... ✓ rahiloff.github.io', 'boot-muted', 30],
        ['         ├── Container health ............. ✓ all containers healthy', 'boot-muted', 30],
        ['         ├── Disk usage ................... ✓ 34% used', 'boot-muted', 25],
        ['         └── Load average ................. ✓ 0.42 0.38 0.31', 'boot-muted', 25],
        ['', '', 50],
        ['[  OK  ] All 15 services initialized successfully', 'boot-ok', 60],
        ['', '', 40],
        ['████████████████████████████████████████ 100%', 'boot-green-bold', 80],
        ['', '', 60],
        ['[ READY ] Portfolio server online — Welcome.', 'boot-success', 120],
    ];

    // Shorter sequence for mobile
    const mobileBootSequence = [
        ['BIOS POST: Memory check... 32768 MB OK', 'boot-white', 40],
        ['[    0.000000] Linux version 6.8.0-devops (rahil@cloud-builder)', 'boot-white', 30],
        ['', '', 40],
        ['[  OK  ] Docker Engine v27.5.1 ............. active', 'boot-ok', 50],
        ['[  OK  ] Kubernetes kubelet v1.31.0 ........ active', 'boot-ok', 45],
        ['[  OK  ] AWS CLI v2.22 — ap-south-1 ........ configured', 'boot-ok', 40],
        ['[  OK  ] Terraform v1.9.8 .................. initialized', 'boot-ok', 35],
        ['', '', 30],
        ['[  OK  ] Nginx v1.27.3 ..................... active', 'boot-ok', 35],
        ['[  OK  ] GitLab Runner v17.8 ............... registered', 'boot-ok', 30],
        ['[  OK  ] Prometheus v2.54 .................. scraping', 'boot-ok', 30],
        ['[  OK  ] Grafana v11.4 ..................... port 3000', 'boot-ok', 25],
        ['', '', 30],
        ['[ INFO ] Pre-flight checks ................ ✓ all passed', 'boot-cyan', 40],
        ['[  OK  ] All services initialized', 'boot-ok', 50],
        ['', '', 40],
        ['████████████████████████████████ 100%', 'boot-green-bold', 70],
        ['', '', 50],
        ['[ READY ] Portfolio server online.', 'boot-success', 100],
    ];

    const bootSequence = isMobile ? mobileBootSequence : fullBootSequence;

    // Speed multiplier for returning visitors
    const speedMultiplier = isReturning ? 0.65 : 1;

    const preloader = document.getElementById('preloader');
    const bootOutput = document.getElementById('boot-output');
    const mainContent = document.getElementById('main-content');

    if (!preloader || !bootOutput || !mainContent) return;

    // Prevent scrolling during preloader
    document.body.style.overflow = 'hidden';

    // Render boot lines with staggered timing
    let currentLine = 0;
    let totalDelay = 0;

    // Create an audio-visual "cursor" at the bottom
    const cursor = document.createElement('span');
    cursor.className = 'boot-cursor';
    cursor.textContent = '█';

    function typeLine() {
        if (currentLine >= bootSequence.length) {
            finishBoot();
            return;
        }

        const [text, colorClass, delay] = bootSequence[currentLine];
        const line = document.createElement('div');
        line.className = 'boot-line';

        if (text === '') {
            line.innerHTML = '&nbsp;';
        } else {
            // Apply color formatting
            line.innerHTML = formatBootLine(text, colorClass);
        }

        // Remove cursor from previous position
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);

        bootOutput.appendChild(line);
        bootOutput.appendChild(cursor);

        // Auto-scroll to bottom
        bootOutput.scrollTop = bootOutput.scrollHeight;

        // Trigger fade-in animation
        requestAnimationFrame(() => {
            line.classList.add('visible');
        });

        currentLine++;
        const nextDelay = delay * speedMultiplier;
        setTimeout(typeLine, nextDelay);
    }

    function formatBootLine(text, colorClass) {
        // Highlight [  OK  ], [ INFO ], [ READY ], [ WARN ] markers
        let formatted = escapeHtml(text);

        formatted = formatted.replace(/\[  OK  \]/g, '<span class="boot-ok-badge">[  OK  ]</span>');
        formatted = formatted.replace(/\[ INFO \]/g, '<span class="boot-info-badge">[ INFO ]</span>');
        formatted = formatted.replace(/\[ READY \]/g, '<span class="boot-ready-badge">[ READY ]</span>');
        formatted = formatted.replace(/\[ WARN \]/g, '<span class="boot-warn-badge">[ WARN ]</span>');

        // Highlight timestamps like [    0.034891]
        formatted = formatted.replace(/\[\s+[\d.]+\]/g, (match) => `<span class="boot-timestamp">${match}</span>`);

        // Highlight the checkmarks
        formatted = formatted.replace(/✓/g, '<span class="boot-checkmark">✓</span>');

        // Highlight the progress bar
        formatted = formatted.replace(/(█+)/g, '<span class="boot-progress-bar">$1</span>');

        // Highlight percentages
        formatted = formatted.replace(/(\d+%)/g, '<span class="boot-percent">$1</span>');

        // Apply the base color class
        return `<span class="${colorClass}">${formatted}</span>`;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function finishBoot() {
        // Remove cursor
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);

        // Mark as visited
        sessionStorage.setItem('rahil_visited', '1');

        const scanlines = document.querySelector('.preloader-scanlines');

        // Wait a beat, then transition
        setTimeout(() => {
            preloader.classList.add('boot-fade-out');
            if (scanlines) scanlines.style.opacity = '0';

            // Reveal main content
            setTimeout(() => {
                mainContent.classList.add('content-revealed');
                document.body.style.overflow = '';

                // Remove preloader from DOM after animation
                setTimeout(() => {
                    preloader.style.display = 'none';
                    if (scanlines) scanlines.style.display = 'none';

                    // Dispatch custom event so main.js can initialize
                    window.dispatchEvent(new CustomEvent('preloaderComplete'));
                }, 600);
            }, 300);
        }, 400);
    }

    // Start the boot sequence after a tiny initial delay
    setTimeout(typeLine, 200);
})();
