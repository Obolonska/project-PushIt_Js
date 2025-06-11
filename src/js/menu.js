(() => {
  const refs = {
    body: document.body,
    openModalBtn: document.querySelector('[data-menu-open]'),
    closeModalBtn: document.querySelector('[data-menu-close]'),
    links: document.querySelectorAll('.mobile-menu-link'),
    modal: document.querySelector('[data-modal]'),
  };

  refs.openModalBtn.addEventListener('click', openModal);
  refs.closeModalBtn.addEventListener('click', closeModal);
  refs.links.forEach(link => {
    link.addEventListener('click', closeModal);
  });

  function openModal() {
    refs.modal.classList.remove('is-hidden');
    refs.body.classList.add('menu-open');
  }

  function closeModal() {
    refs.modal.classList.add('is-hidden');
    refs.body.classList.remove('menu-open');
  }
})();
