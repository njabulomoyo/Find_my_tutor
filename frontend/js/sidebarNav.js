export function initSidebarNav() {
  const sidebar = document.getElementById('sidebar');
  const collapseToggle = document.getElementById('collapse-toggle');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

  collapseToggle.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');
    collapseToggle.textContent = collapsed ? '→' : '←';
    collapseToggle.setAttribute('aria-expanded', String(!collapsed));
    collapseToggle.setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
  });

  mobileMenuToggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('mobile-open');
    mobileMenuToggle.setAttribute('aria-expanded', String(open));
  });

  sidebar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    sidebar.querySelectorAll('a').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  }));
}
