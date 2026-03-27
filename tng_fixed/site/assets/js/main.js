document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('.main-nav');
  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchBox = document.querySelector('.search-inline');
  const header = document.querySelector('.site-header');
  const yearEls = document.querySelectorAll('[data-current-year]');

  const syncMobileMenuOffset = () => {
    if (!header) return;
    const headerHeight = Math.round(header.getBoundingClientRect().height || 78);
    document.documentElement.style.setProperty('--mobile-menu-top', `${headerHeight}px`);
  };

  const closeDropdowns = () => {
    document.querySelectorAll('.has-dropdown.open').forEach((item) => item.classList.remove('open'));
  };

  const closeMenu = () => {
    if (!nav || !menuToggle) return;
    nav.classList.remove('open');
    document.body.classList.remove('nav-open', 'menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    closeDropdowns();
  };

  if (menuToggle && nav) {
    syncMobileMenuOffset();
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', () => {
      const willOpen = !nav.classList.contains('open');
      syncMobileMenuOffset();
      nav.classList.toggle('open', willOpen);
      document.body.classList.toggle('nav-open', willOpen);
      document.body.classList.toggle('menu-open', willOpen);
      menuToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (!willOpen) closeDropdowns();
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    nav.querySelectorAll('.has-dropdown > .nav-link').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (window.innerWidth > 860) return;
        const parent = link.parentElement;
        const href = link.getAttribute('href');
        if (!parent) return;
        event.preventDefault();
        const willOpen = !parent.classList.contains('open');
        closeDropdowns();
        parent.classList.toggle('open', willOpen);
        if (!willOpen && href) window.location.href = href;
      });
    });

    nav.querySelectorAll('.dropdown a, .main-nav > ul > li:not(.has-dropdown) a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    window.addEventListener('resize', () => {
      syncMobileMenuOffset();
      if (window.innerWidth > 860) closeMenu();
    });

    window.addEventListener('orientationchange', syncMobileMenuOffset);
    window.addEventListener('load', syncMobileMenuOffset);
  }

  if (searchToggle && searchBox) {
    searchToggle.addEventListener('click', () => {
      searchBox.classList.toggle('active');
      syncMobileMenuOffset();
    });
  }

  yearEls.forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
