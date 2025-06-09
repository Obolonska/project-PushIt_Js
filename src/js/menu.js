(() => {
    const refs = {
      openModalBtn: document.querySelector('[data-menu-open]'),
      closeModalBtn: document.querySelector('[data-menu-close]'),
      links:document.querySelectorAll('.mob-navig .mobile-menu-link'),
      modal: document.querySelector('[data-modal]'),
    };
  
    console.log(refs.closeModalBtn);
    refs.openModalBtn.addEventListener('click', openModalBtn);
    refs.closeModalBtn.addEventListener('click', closeModalBtn);
    refs.links.forEach(link =>{
      console.log(link);
      link.addEventListener('click', onClickMenuItem);
    
    })

    function closeModalBtn() {
    refs.modal.classList.add('is-hidden')
    refs.openModalBtn.classList.remove('is-hidden')
    refs.closeModalBtn.classList.add('is-hidden')
    
  }
  
    function openModalBtn(){
        console.log(refs.modal)
        refs.modal.classList.remove('is-hidden')
        refs.openModalBtn.classList.add('is-hidden')
        refs.closeModalBtn.classList.remove('is-hidden')
    }

    function onClickMenuItem(event){
      refs.modal.classList.add('is-hidden')
      refs.openModalBtn.classList.remove('is-hidden')
      refs.closeModalBtn.classList.add('is-hidden')
    
      
    }
  })();