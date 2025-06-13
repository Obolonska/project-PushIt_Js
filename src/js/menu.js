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

  function openModal(e) {
    refs.modal.classList.remove('is-hidden');
    refs.body.classList.add('menu-open');
    refs.openModalBtn.classList.add('is-hidden');
    refs.closeModalBtn.classList.remove('is-hidden');
    console.log(e.target);
  }

  function closeModal() {
    refs.modal.classList.add('is-hidden');
    refs.body.classList.remove('menu-open');
    refs.openModalBtn.classList.remove('is-hidden');
    refs.closeModalBtn.classList.add('is-hidden');
  }
})();
