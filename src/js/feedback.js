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
      starsMarkup += 
      `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.071 1.31791C9.41474 0.501451 10.5855 0.501452 10.9292 1.31791L12.958 6.1368C13.103 6.481 13.4307 6.71618
    13.8068 6.74597L19.0728 7.16304C19.965 7.23371 20.3268 8.3337 19.647 8.90897L15.6349 12.3042C15.3483 12.5468 15.2231 12.9273 15.3107
    13.2899L16.5365 18.3666C16.7441 19.2267 15.797 19.9066 15.0331 19.4457L10.5247 16.7251C10.2026 16.5308 9.79762 16.5308 9.4756 16.7251L4.96711
    19.4457C4.20323 19.9066 3.25608 19.2267 3.46376 18.3666L4.68954 13.2899C4.7771 12.9273 4.65194 12.5468 4.36538 12.3042L0.353184 8.90897C-0.326596
    8.3337 0.0351899 7.23371 0.927413 7.16304L6.19348 6.74597C6.56962 6.71618 6.89728 6.481 7.04219 6.1368L9.071 1.31791Z"
    fill="#764191" />
  </svg>
        `
      ;
    } else {
      starsMarkup += `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9.07082 1.31791C9.41456 0.501451 10.5853 0.501452 10.9291 1.31791L12.9578 6.1368C13.1028 6.481 13.4305 6.71618 13.8066 6.74597L19.0726 7.16304C19.9648 7.23371 20.3266 8.3337
  19.6468 8.90897L15.6347 12.3042C15.3482 12.5468 15.2229 12.9273 15.3105 13.2899L16.5363 18.3666C16.7439 19.2267 15.7968 19.9066 15.0329 19.4457L10.5245
  16.7251C10.2024 16.5308 9.79744 16.5308 9.47542 16.7251L4.96693 19.4457C4.20305 19.9066 3.25589 19.2267 3.46357 18.3666L4.68936 13.2899C4.77692 12.9273 4.65176 12.5468 4.36519
  12.3042L0.353001 8.90897C-0.326779 8.3337 0.0350068 7.23371 0.92723 7.16304L6.19329 6.74597C6.56944 6.71618 6.89709 6.481 7.04201 6.1368L9.07082 1.31791Z"
  fill="white" />
</svg>`;
    }
  }
  return starsMarkup;
}



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