// import iziToast from 'izitoast';
// import 'izitoast/dist/css/iziToast.min.css';

import { getCards } from './soundWave-api';
import iconsUrl from '../img/icons.svg?url';

//main
const refs = {
  artistsList: document.querySelector('.artists-cards-list'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let page = 1;
let totalPages = 0;

firstLoad();

refs.loadMoreBtn.addEventListener('click', onLoadMore);
refs.artistsList.addEventListener('click', getArtistId);

function getArtistId(event) {
  if (event.target.classList.contains('artist-learn-more-btn')) {
    const artistCard = event.target.closest('.artist-card');
    const artlistId = artistCard.dataset.id;
    console.log('Clicked artist ID: ', artlistId);
  }
}
// refs.artistsList.addEventListener('click', event => {
//   if (event.target.classList.contains('artist-learn-more-btn')) {
//     const artistCard = event.target.closest('.artist-card');
//     const artlistId = artistCard.dataset.id;
//     console.log('Clicked artist ID: ', artlistId);
//   }
// });

// -----------async function----------------

async function createList(cardsArray) {
  const markup = cardsArray
    .map(({ genres, strArtist, strBiographyEN, strArtistThumb, _id }) => {
      //   const genresList = genres
      //     .map(genre => `<li class="artist-genre-item">${genre}</li>`)
      //     .join('');
      const genresList = Array.isArray(genres)
        ? genres
            .map(genre => `<li class="artist-genre-item">${genre}</li>`)
            .join('')
        : '';
      const shortened = shortenText(strBiographyEN);

      return `
        <li class="artist-card"  data-id="${_id}">
          <div class="artist-thumb">
      <img src="${strArtistThumb}" alt="${strArtist}" class="artist-img">
          </div>
          <ul class="aritist-genre-list">${genresList}</ul>
              <h3 class="artist-name">${strArtist}</h3>
              <p class="artist-bio">${shortened}</p>
            <button type="button" class="artist-learn-more-btn">Learn More
              <svg class="artist-btn-icon" width="24" height="24" fill="#fff">
                  <use href="${iconsUrl}#icon-learn-more"></use>
              </svg>
          </button>
         </li>     `;
    })
    .join('');

  refs.artistsList.insertAdjacentHTML('beforeend', markup);
}

async function firstLoad() {
  try {
    const data = await getCards(page);

    if (data.artists.length === 0) {
      hideLoadMoreButton();

      console.log('Порожній список!'); //х
      return;
    }

    createList(data.artists);

    totalPages = Math.ceil(data.totalArtists / 8);
    if (page >= totalPages) {
      //   iziToast.error({
      //     position: 'topRight',
      //     message: 'Error!', // here
      //     maxWidth: 432,
      //   });
      hideLoadMoreButton();

      console.log('Сторінок більше, ніж контенту!'); //х
      return;
    }
  } catch (error) {
    //   iziToast.error({
    //     position: 'topRight',
    //     message: 'Error!', // here
    //     maxWidth: 432,
    //   });
    console.log('Помилка:', error.message); //х
    hideLoadMoreButton();
    return;
  }
}

async function onLoadMore() {
  page += 1;

  try {
    const data = await getCards(page);
    if (data.artists.length === 0) {
      hideLoadMoreButton();
      //   iziToast.error({
      //     position: 'topRight',
      //     message: 'Error!', // here
      //     maxWidth: 432,
      //   });
      console.log('Список артистів порожній!'); //х
      return;
    }

    createList(data.artists);

    if (page >= totalPages) {
      //   iziToast.error({
      //     position: 'topRight',
      //     message: 'Error!', // here
      //     maxWidth: 432,
      //   });
      hideLoadMoreButton();

      console.log('Сторінок більше, ніж контенту!');
      return;
    }

    smoothScroll();
  } catch (error) {
    // iziToast.error({
    //   position: 'topRight',
    //   message: 'Error!', // here
    //   maxWidth: 432,
    // });
    console.log('Помилка:', error.message);
    return;
  }
}

// -------------function---------------
function smoothScroll() {
  if (!refs.artistsList.firstElementChild) return;
  const { height: cardHeight } =
    refs.artistsList.firstElementChild.getBoundingClientRect(); //перевірка first child

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function shortenText(text) {
  if (text.length <= 140) {
    return text;
  }
  return text.slice(0, 140) + '...';
}

//function showLoader() {}

export function showLoadMoreButton() {
  refs.loadMoreBtn.classList.remove('is-hidden');
}

export function hideLoadMoreButton() {
  refs.loadMoreBtn.classList.add('is-hidden');
}
