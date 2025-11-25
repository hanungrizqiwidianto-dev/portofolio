// Sidebar Toggle
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Close sidebar when clicking outside (mobile)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Sidebar Collapse - Initialize function
function initializeSidebar() {
    const sidebarHeaders = document.querySelectorAll('.sidebar-header');

    // Function to detect current page and active section
    function getActiveSectionFromURL() {
        const currentPath = window.location.pathname;

        // Check which section the current page belongs to
        if (currentPath.includes('/patterns/')) return 'Design Patterns';
        if (currentPath.includes('/backend/')) return 'Backend Development';
        if (currentPath.includes('/docker/')) return 'Docker';
        if (currentPath.includes('/microservices/')) return 'Microservices';
        if (currentPath.includes('/architecture/')) return 'Software Architecture';
        if (currentPath.includes('/kubernetes/')) return 'Kubernetes';
        if (currentPath.includes('/dotnet/')) return '.NET Development';
        if (currentPath.includes('/python/')) return 'Python Development';
        if (currentPath.includes('/database/')) return 'Databases';
        if (currentPath.includes('/devops/')) return 'DevOps & CI/CD';

        // If on homepage or other pages, return null (collapse all)
        return null;
    }

    const activeSection = getActiveSectionFromURL();

    sidebarHeaders.forEach(header => {
        const collapseBtn = header.querySelector('.collapse-btn');
        if (collapseBtn) {
            const sectionText = header.querySelector('span').textContent.trim();

            // Collapse all sections by default
            header.classList.add('collapsed');
            const submenu = header.nextElementSibling;
            if (submenu && submenu.classList.contains('sidebar-submenu')) {
                submenu.classList.add('collapsed');
            }

            // Only open the section that matches current page
            if (activeSection && sectionText === activeSection) {
                header.classList.remove('collapsed');
                if (submenu && submenu.classList.contains('sidebar-submenu')) {
                    submenu.classList.remove('collapsed');
                }
            }

            // Event listener untuk toggle
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                const submenu = header.nextElementSibling;
                if (submenu && submenu.classList.contains('sidebar-submenu')) {
                    submenu.classList.toggle('collapsed');
                }
            });
        }
    });

    // Highlight active menu item
    highlightActiveMenuItem();
}

// Call on initial load
initializeSidebar();

// Listen for sidebar loaded event (for dynamically loaded sidebars)
document.addEventListener('sidebarLoaded', function () {
    console.log('🔄 Re-initializing after sidebar loaded...');
    initializeSidebar();
    initializeThemeToggle(); // Re-initialize theme toggle after sidebar loads
});

// Highlight active menu item based on current page
function highlightActiveMenuItem() {
    const currentPath = window.location.pathname;
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    sidebarItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Call on page load
highlightActiveMenuItem();

// Theme Toggle Function
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
        console.warn('⚠️ Theme toggle button not found');
        return;
    }

    const body = document.body;

    // Check for saved theme preference or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        body.classList.add('light-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Remove old event listeners by cloning (prevent duplicates)
    const newThemeToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);

    newThemeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        body.classList.toggle('light-theme');

        if (body.classList.contains('light-theme')) {
            newThemeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'light');
            console.log('✅ Switched to light theme');
        } else {
            newThemeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
            console.log('✅ Switched to dark theme');
        }
    });

    console.log('✅ Theme toggle initialized');
}

// Initialize theme toggle on page load
initializeThemeToggle();

// Search Functionality
const searchInput = document.getElementById('searchInput');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm.length < 2) {
        removeSearchHighlights();
        return;
    }

    searchTimeout = setTimeout(() => {
        performSearch(searchTerm);
    }, 300);
});

function performSearch(term) {
    // Remove previous highlights
    removeSearchHighlights();

    // Search in sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    let foundCount = 0;

    sidebarItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(term)) {
            item.classList.add('search-highlight');

            // Expand parent section if collapsed
            const parentSection = item.closest('.sidebar-section');
            if (parentSection) {
                const header = parentSection.querySelector('.sidebar-header');
                const submenu = parentSection.querySelector('.sidebar-submenu');
                if (header && submenu) {
                    header.classList.remove('collapsed');
                    submenu.classList.remove('collapsed');
                }
            }

            foundCount++;
        }
    });

    // Search in cards
    const cards = document.querySelectorAll('.article-card');
    cards.forEach(card => {
        const text = (card.querySelector('h3')?.textContent + ' ' + card.querySelector('p')?.textContent).toLowerCase();
        if (text.includes(term)) {
            card.classList.add('search-highlight');
            foundCount++;
        }
    });

    console.log(`Found ${foundCount} results for "${term}"`);
}

function removeSearchHighlights() {
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
    });
}

// Add search highlight style
const style = document.createElement('style');
style.textContent = `
    .search-highlight {
        background-color: rgba(76, 110, 245, 0.2) !important;
        border-left-color: var(--accent-blue) !important;
    }
`;
document.head.appendChild(style);

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active link highlighting based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }

    // Escape to close sidebar (mobile)
    if (e.key === 'Escape') {
        sidebar.classList.remove('active');
        searchInput.blur();
    }

    // Ctrl/Cmd + B to toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        sidebar.classList.toggle('active');
    }
});

// Copy code blocks (if any)
document.querySelectorAll('pre code').forEach(block => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '<i class="fas fa-copy"></i>';
    button.addEventListener('click', () => {
        navigator.clipboard.writeText(block.textContent);
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });

    const pre = block.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(button);
});

console.log('Wiki loaded successfully! 🚀');
console.log('Keyboard shortcuts:');
console.log('- Ctrl/Cmd + K: Focus search');
console.log('- Ctrl/Cmd + B: Toggle sidebar');
console.log('- Escape: Close sidebar/unfocus search');
