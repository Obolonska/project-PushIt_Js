
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import '../css/feedback.css'

document.addEventListener('DOMContentLoaded', () => {
  new Swiper('.swiper', {
    loop: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.right_btn', prevEl: '.left_btn' },
    scrollbar: { el: '.swiper-scrollbar' },
  });
});

const leftBtn = document.querySelector('.left_btn');
const rightBtn = document.querySelector('.right_btn');

function toggleNavButtons() {
  const show = window.innerWidth >= 768;

  if (show) {
    leftBtn.style.display = 'flex';
    rightBtn.style.display = 'flex';
  } else {
    leftBtn.style.display = 'none';
    rightBtn.style.display = 'none';
  }
}

toggleNavButtons();
window.addEventListener('resize', toggleNavButtons);



