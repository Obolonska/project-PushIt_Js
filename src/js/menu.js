(() => {
  const refs = {
    openBtn: document.querySelector('[data-menu-open]'),
    closeBtn: document.querySelector('[data-menu-close]'),
    menu: document.querySelector('[data-modal]'),
    menuLinks: document.querySelectorAll('[data-menu-item]'),
  };

  refs.openBtn.addEventListener('click', onOpenMenu);
  refs.closeBtn.addEventListener('click', onCloseMenu);
  refs.menuLinks.forEach(link => {
    link.addEventListener('click', onCloseMenu);
  });

  function onOpenMenu() {
    refs.menu.classList.remove('is-hidden');
    refs.openBtn.classList.add('is-hidden');
    refs.closeBtn.classList.remove('is-hidden');
    document.body.classList.add('menu-open');
  }

  function onCloseMenu() {
    refs.menu.classList.add('is-hidden');
    refs.openBtn.classList.remove('is-hidden');
    refs.closeBtn.classList.add('is-hidden');
    document.body.classList.remove('menu-open');
  }
})();

