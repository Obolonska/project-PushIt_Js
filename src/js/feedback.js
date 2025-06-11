import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import '../css/feedback.css';
import iconsUrl from '../img/icons.svg?url';

const swiperWrapper = document.querySelector('.swiper-wrapper');

let currentPage = 1;
const limit = 5;
let totalSlides = 0;
let isFetching = false;
let swiper;

async function getFeedbacks() {
  try {
    const res = await fetch(`https://sound-wave.b.goit.study/api/feedbacks?limit=${limit}&page=${currentPage}`);
    const data = await res.json();
    totalSlides = parseInt(data.total, 10);

    const markup = renderSlides(data.data);
    swiperWrapper.innerHTML = markup;

    swiper = new Swiper('.swiper', {
      loop: false,
      centeredSlides: false,
      spaceBetween: 0,
      slidesPerView: 1,
      pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
      navigation: { nextEl: '.right_btn', prevEl: '.left_btn' },
      scrollbar: { el: '.swiper-scrollbar' },

      on: {
        reachEnd: async () => {
          if (isFetching) return;
          if ((currentPage * limit) >= totalSlides) return;

          isFetching = true;
          currentPage++;

          try {
            const res = await fetch(`https://sound-wave.b.goit.study/api/feedbacks?limit=${limit}&page=${currentPage}`);
            const data = await res.json();
            const newMarkup = renderSlides(data.data);

            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = newMarkup;
            const newSlides = Array.from(tempContainer.children);
            swiper.appendSlide(newSlides);
          } catch (error) {
            console.error('Error fetching more feedbacks:', error);
          }

          isFetching = false;
        }
      }
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
    const iconId = i <= rating ? 'icon-purple-star' : 'icon-white-star';

    starsMarkup += `
      <svg width="20" height="20">
        <use href="${iconsUrl}#${iconId}"></use>
      </svg>
    `;
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

