/**
 * Command Palette — VS Code-style command launcher
 * Completely self-contained. No dependencies on other portfolio JS.
 * Trigger: Ctrl+K (desktop) or floating >_ button (mobile)
 */
(function () {
    'use strict';

    // ===== COMMAND DEFINITIONS =====
    const COMMANDS = [
        // Navigation
        { id: 'nav-about',      label: 'goto about',       icon: 'fas fa-user',          category: 'NAVIGATION', action: () => scrollTo('#about') },
        { id: 'nav-skills',     label: 'goto skills',      icon: 'fas fa-layer-group',   category: 'NAVIGATION', action: () => scrollTo('#skills') },
        { id: 'nav-experience', label: 'goto experience',  icon: 'fas fa-briefcase',     category: 'NAVIGATION', action: () => scrollTo('#experience') },
        { id: 'nav-projects',   label: 'goto projects',    icon: 'fas fa-code-branch',   category: 'NAVIGATION', action: () => scrollTo('#projects') },
        { id: 'nav-stats',      label: 'goto stats',       icon: 'fas fa-chart-bar',     category: 'NAVIGATION', action: () => scrollTo('#achievements') },
        { id: 'nav-contact',    label: 'goto contact',     icon: 'fas fa-envelope',      category: 'NAVIGATION', action: () => scrollTo('#contact') },
        // Actions
        { id: 'act-cv',         label: 'download cv',      icon: 'fas fa-download',      category: 'ACTIONS',    action: downloadCV },
        { id: 'act-github',     label: 'open github',      icon: 'fab fa-github',        category: 'ACTIONS',    action: () => window.open('https://github.com/rahiloff', '_blank') },
        { id: 'act-linkedin',   label: 'open linkedin',    icon: 'fab fa-linkedin-in',   category: 'ACTIONS',    action: () => window.open('https://linkedin.com/in/rahilt', '_blank') },
        { id: 'act-email',      label: 'send email',       icon: 'fas fa-paper-plane',   category: 'ACTIONS',    action: () => { window.location.href = 'mailto:rahilkkln@gmail.com'; } },
        // System
        { id: 'sys-top',        label: 'scroll to top',    icon: 'fas fa-arrow-up',      category: 'SYSTEM',     action: () => scrollTo('#hero') },
        { id: 'sys-theme',      label: 'toggle theme',     icon: 'fas fa-moon',          category: 'SYSTEM',     action: showThemeError },
    ];

    const CATEGORY_ORDER = ['RECENT', 'NAVIGATION', 'ACTIONS', 'SYSTEM'];
    const MAX_RECENT = 3;
    const STORAGE_KEY = 'rahil_cmd_recent';

    // ===== STATE =====
    let isOpen = false;
    let activeIndex = 0;
    let filteredCommands = [];
    let themeToastTimeout = null;

    // ===== BUILD DOM =====
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'cmd-backdrop';
    backdrop.className = 'cmd-backdrop';

    // Palette container
    const palette = document.createElement('div');
    palette.id = 'cmd-palette';
    palette.className = 'cmd-palette';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-label', 'Command Palette');

    palette.innerHTML = `
        <div class="cmd-search-wrap">
            <span class="cmd-prompt">$</span>
            <input type="text" id="cmd-input" class="cmd-input" placeholder="type a command..." autocomplete="off" spellcheck="false" />
            <kbd class="cmd-esc-badge">ESC</kbd>
        </div>
        <div class="cmd-list" id="cmd-list" role="listbox"></div>
        <div class="cmd-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> execute</span>
            <span><kbd>ESC</kbd> close</span>
        </div>
    `;

    // Mobile FAB button
    const fab = document.createElement('button');
    fab.id = 'cmd-fab';
    fab.className = 'cmd-fab';
    fab.setAttribute('aria-label', 'Open command palette');
    fab.innerHTML = '<span class="cmd-fab-icon">&gt;_</span>';

    // Toast for theme toggle
    const toast = document.createElement('div');
    toast.id = 'cmd-toast';
    toast.className = 'cmd-toast';

    // Append to body when DOM is ready
    function mountDOM() {
        document.body.appendChild(backdrop);
        document.body.appendChild(palette);
        document.body.appendChild(fab);
        document.body.appendChild(toast);

        // Bind navbar Ctrl+K hint badge click
        const kbdHint = document.getElementById('cmd-kbd-hint');
        if (kbdHint) {
            kbdHint.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openPalette();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountDOM);
    } else {
        mountDOM();
    }

    // ===== RECENT COMMANDS =====
    function getRecent() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(data) ? data.slice(0, MAX_RECENT) : [];
        } catch { return []; }
    }

    function pushRecent(id) {
        let recent = getRecent().filter(r => r !== id);
        recent.unshift(id);
        recent = recent.slice(0, MAX_RECENT);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    }

    // ===== RENDER =====
    function buildFilteredList(query) {
        const q = query.trim().toLowerCase();
        const recent = getRecent();

        let matched;
        if (q === '') {
            matched = [...COMMANDS];
        } else {
            matched = COMMANDS.filter(cmd =>
                cmd.label.toLowerCase().includes(q) ||
                cmd.category.toLowerCase().includes(q)
            );
        }

        // Build display list: recent first (only when no query), then by category
        const result = [];

        if (q === '' && recent.length > 0) {
            const recentCmds = recent
                .map(id => COMMANDS.find(c => c.id === id))
                .filter(Boolean);
            if (recentCmds.length > 0) {
                result.push({ type: 'header', category: 'RECENT' });
                recentCmds.forEach(cmd => result.push({ type: 'command', cmd, isRecent: true }));
            }
        }

        // Group remaining by category
        const seenRecent = new Set(q === '' ? recent : []);
        CATEGORY_ORDER.filter(c => c !== 'RECENT').forEach(cat => {
            const cmds = matched.filter(c => c.category === cat && !seenRecent.has(c.id));
            if (cmds.length > 0) {
                result.push({ type: 'header', category: cat });
                cmds.forEach(cmd => result.push({ type: 'command', cmd }));
            }
        });

        return result;
    }

    function renderList(query) {
        const list = document.getElementById('cmd-list');
        if (!list) return;

        filteredCommands = buildFilteredList(query);

        if (filteredCommands.length === 0 || filteredCommands.every(e => e.type === 'header')) {
            list.innerHTML = '<div class="cmd-empty"><i class="fas fa-search"></i> No commands found</div>';
            activeIndex = -1;
            return;
        }

        let html = '';
        let cmdIndex = 0;

        filteredCommands.forEach(entry => {
            if (entry.type === 'header') {
                html += `<div class="cmd-category">${entry.category}</div>`;
            } else {
                const isActive = cmdIndex === activeIndex;
                const recentDot = entry.isRecent ? '<span class="cmd-recent-dot"></span>' : '';
                html += `
                    <div class="cmd-item${isActive ? ' active' : ''}" data-index="${cmdIndex}" role="option" aria-selected="${isActive}">
                        <i class="${entry.cmd.icon} cmd-item-icon"></i>
                        <span class="cmd-item-label">${highlightMatch(entry.cmd.label, query)}</span>
                        ${recentDot}
                    </div>
                `;
                cmdIndex++;
            }
        });

        list.innerHTML = html;

        // Bind hover + click on items
        list.querySelectorAll('.cmd-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                activeIndex = parseInt(el.dataset.index);
                updateActiveHighlight();
            });
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                executeActive();
            });
        });

        scrollActiveIntoView();
    }

    function highlightMatch(label, query) {
        if (!query) return label;
        const q = query.trim().toLowerCase();
        if (!q) return label;
        const idx = label.toLowerCase().indexOf(q);
        if (idx === -1) return label;
        return label.slice(0, idx)
            + '<span class="cmd-match">' + label.slice(idx, idx + q.length) + '</span>'
            + label.slice(idx + q.length);
    }

    function updateActiveHighlight() {
        const list = document.getElementById('cmd-list');
        if (!list) return;
        list.querySelectorAll('.cmd-item').forEach(el => {
            const idx = parseInt(el.dataset.index);
            el.classList.toggle('active', idx === activeIndex);
            el.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');
        });
        scrollActiveIntoView();
    }

    function scrollActiveIntoView() {
        const active = document.querySelector('.cmd-item.active');
        if (active) {
            active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    function getCommandCount() {
        return filteredCommands.filter(e => e.type === 'command').length;
    }

    function getCommandAtIndex(idx) {
        let cmdIdx = 0;
        for (const entry of filteredCommands) {
            if (entry.type === 'command') {
                if (cmdIdx === idx) return entry.cmd;
                cmdIdx++;
            }
        }
        return null;
    }

    // ===== OPEN / CLOSE =====
    function openPalette() {
        if (isOpen) return;
        isOpen = true;
        activeIndex = 0;

        const input = document.getElementById('cmd-input');
        if (input) input.value = '';

        backdrop.classList.add('visible');
        palette.classList.add('visible');
        document.body.style.overflow = 'hidden';

        renderList('');

        // Focus input after animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (input) input.focus();
            });
        });
    }

    function closePalette() {
        if (!isOpen) return;
        isOpen = false;

        backdrop.classList.remove('visible');
        palette.classList.remove('visible');
        document.body.style.overflow = '';
    }

    // ===== EXECUTE =====
    function executeActive() {
        const cmd = getCommandAtIndex(activeIndex);
        if (!cmd) return;

        pushRecent(cmd.id);
        closePalette();

        // Small delay so close animation plays first
        setTimeout(() => {
            cmd.action();
        }, 150);
    }

    // ===== COMMAND ACTIONS =====
    function scrollTo(selector) {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    function downloadCV() {
        const a = document.createElement('a');
        a.href = 'Mohammed_Rahil_CV_v4.pdf';
        a.download = 'Mohammed_Rahil_CV.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function showThemeError() {
        toast.innerHTML = '<span class="cmd-toast-prompt">$</span> Error: Dark mode is the only mode. <span class="cmd-toast-blink">█</span>';
        toast.classList.add('visible');

        if (themeToastTimeout) clearTimeout(themeToastTimeout);
        themeToastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // ===== KEYBOARD EVENTS =====
    document.addEventListener('keydown', (e) => {
        // Ctrl+K to open
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            e.stopPropagation();
            if (isOpen) {
                closePalette();
            } else {
                openPalette();
            }
            return;
        }

        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                closePalette();
                break;

            case 'ArrowDown':
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, getCommandCount() - 1);
                updateActiveHighlight();
                break;

            case 'ArrowUp':
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, 0);
                updateActiveHighlight();
                break;

            case 'Enter':
                e.preventDefault();
                executeActive();
                break;
        }
    });

    // ===== SEARCH INPUT =====
    document.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'cmd-input') {
            activeIndex = 0;
            renderList(e.target.value);
        }
    });

    // ===== BACKDROP CLICK =====
    backdrop.addEventListener('click', closePalette);

    // ===== FAB CLICK =====
    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        openPalette();
    });

    // ===== STOP PROPAGATION inside palette =====
    palette.addEventListener('click', (e) => {
        e.stopPropagation();
    });

})();
