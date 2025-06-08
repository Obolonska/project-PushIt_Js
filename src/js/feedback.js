import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import '../css/feedback.css';

const swiperWrapper = document.querySelector('.swiper-wrapper');

async function getFeedbacks() {
  try {
    const res = await fetch('https://sound-wave.b.goit.study/api/feedbacks?limit=3&page=2');
    const data = await res.json();
    console.log('API response:', data);

    const markup = renderSlides(data.data);
    swiperWrapper.innerHTML = markup;

    new Swiper('.swiper', {
      loop: true,
      centeredSlides: false,
      spaceBetween: 0,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.right_btn', prevEl: '.left_btn' },
      scrollbar: { el: '.swiper-scrollbar' },
    });

  } catch (err) {
    console.error('Fetch error:', err);
  }
}



function slideTemplate(slide) {
  return `
    <div class="fb_item swiper-slide">
      <div class="stars">${createStars(slide.rating)}</div>
      <p class="fb_user_text">"${slide.descr}"</p>
      <p class="fb_user_name">${slide.name}</p>
    </div>
  `;
}

function renderSlides(slides) {
  return slides.map(slide => slideTemplate(slide)).join('');
}

function createStars(rating) {
  let starsMarkup = '';
  const totalStars = 5;

  for (let i = 1; i <= totalStars; i++) {
    if (i <= rating) {
      starsMarkup += `
        <svg class="star">
          <use href="/img/icons.svg#icon-purple-star"></use>
        </svg>
      `;
    } else {
      starsMarkup += `
        <svg class="star">
          <use href="/img/icons.svg#icon-white-star"></use>
        </svg>
      `;
    }
  }
  return starsMarkup;
}


// ... (the rest of your code)




document.addEventListener('DOMContentLoaded', () => {
  getFeedbacks();
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