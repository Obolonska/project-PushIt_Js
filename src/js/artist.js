// import iziToast from 'izitoast';
// import 'izitoast/dist/css/iziToast.min.css';

import { getCards } from './soundWave-api';
import iconsUrl from '../img/icons.svg?url';
import '../public/choices.css';
// import 'tui-pagination/dist/tui-pagination.css';
import Choices from 'choices.js';
import {fetchAlbums} from "./artist-details-modal.js";

//main
const refs = {
  artistsList: document.querySelector('.artists-cards-list'),
  loadMoreBtn: document.querySelector('.load-more'),
  form: document.querySelector('.artist-form'),
  input: document.querySelector('.form-input-filters'),
  resetBtn: document.querySelector('#resetButton'),
  resetBtnSearch: document.querySelector('#resetButtonSearch'),
  sorting: document.querySelector('#sorting'),
  genre: document.querySelector('#genre'),
  ul: document.querySelector('#artistsList'),
  toggleButton: document.querySelector('.search-and-filters'),
  artistForm: document.querySelector('.artist-form'),
  empty: document.querySelector('.empty-state'),
  loader: document.querySelector('.loader'),
};

let page = 1;
let totalPages = 0;
let sorting = '';
let genre = '';
let name = '';
let genreChoices;

fetchGenres();
firstLoad(name, sorting, genre, page);

refs.loadMoreBtn.addEventListener('click', onLoadMore);
refs.artistsList.addEventListener('click', getArtistId);
refs.sorting.addEventListener('change', handleChangeSorting);
refs.genre.addEventListener('change', handleChangeGenre);
// refs.input.addEventListener('input', handleInput);
refs.form.addEventListener('submit', onFormSubmit);
refs.resetBtn.addEventListener('click', () => {
  sortChoices.setChoiceByValue('');
  genreChoices.setChoiceByValue('');
  refs.input.value = '';
  sorting = '';
  genre = '';
  name = '';
  page = 1;
  refs.artistsList.innerHTML = '';
  firstLoad(name, sorting, genre, page);
});

refs.resetBtnSearch.addEventListener('click', () => {
  sortChoices.setChoiceByValue('');
  genreChoices.setChoiceByValue('');
  refs.input.value = '';
  sorting = '';
  genre = '';
  name = '';
  page = 1;
  refs.artistsList.innerHTML = '';
  firstLoad(name, sorting, genre, page);
});
const sortChoices = new Choices(refs.sorting, {
  searchEnabled: false,
  shouldSort: false,
  classNames: {
    itemSelectable: ['select'],
    placeholder: 'sort_placeholder',
  },
});

async function onFormSubmit(e) {
  e.preventDefault();

  name = refs.input.value.trim();
  page = 1;
  refs.artistsList.innerHTML = ''; // очищаємо попередній список

  firstLoad(name, sorting, genre, page);
  refs.input.value = '';
  refs.genre.value = '';
  refs.sorting.value = '';
}
async function handleChangeSorting(e) {
  sorting = e.target.value.trim();
  page = 1;
  refs.artistsList.innerHTML = '';
  firstLoad(name, sorting, genre, page);
}
async function handleChangeGenre(e) {
  genre = e.target.value.trim();
  page = 1;
  refs.artistsList.innerHTML = '';
  firstLoad(name, sorting, genre, page);
}
// async function handleInput(e) {
//   name = e.target.value.trim();
//   page = 1;
//   firstLoad(name, sorting, genre, page);
//   // await fetchArtists(name, sorting, genre);
// }

// Завантаження жанрів при завантаженні сторінки
function genreTemplate({ genre }) {
  return `<option value="${genre}">${genre}</option>`;
}
function renderGenres(genres) {
  const markup = genres.map(genreTemplate).join('');
  refs.genre.innerHTML = refs.genre.innerHTML + markup;
}

async function fetchGenres() {
  try {
    const response = await fetch('https://sound-wave.b.goit.study/api/genres');

    const genres = await response.json();
    renderGenres(genres);

    genreChoices = new Choices(refs.genre, {
      searchEnabled: false,
      shouldSort: false,
      classNames: {
        itemSelectable: ['select'],
        placeholder: 'sort_placeholder',
      },
    });
  } catch (error) {
    console.error('Помилка запиту жанрів:', error.message);
  }
}

async function getArtistId(event) {
  if (event.target.classList.contains('artist-learn-more-btn')) {
    const artistCard = event.target.closest('.artist-card');
    const artlistId = artistCard.dataset.id;
    console.log('Clicked artist ID: ', artlistId);
    fetchAlbums(artlistId)
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

async function firstLoad(name, sort, genre, page) {
  try {
    showLoader();
    const data = await getCards(name, sort, genre, page);
    refs.empty.classList.add('is-hidden');
    if (data.artists.length === 0) {
      hideLoadMoreButton();
      hideLoader();
      refs.empty.classList.remove('is-hidden');
      console.log('Порожній список!'); //х
      return;
    }

    createList(data.artists);
    hideLoader();
    totalPages = Math.ceil(data.totalArtists / 8);
    if (page >= totalPages) {
      //   iziToast.error({
      //     position: 'topRight',
      //     message: 'Error!', // here
      //     maxWidth: 432,
      //   });
      hideLoadMoreButton();
      hideLoader();
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
    hideLoader();
    return;
  }
}

async function onLoadMore() {
  page += 1;
  showLoader();
  try {
    const data = await getCards(name, sorting, genre, page);
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
    hideLoader();

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

// Лише на мобілках/планшетах — перемикати клас
function toggleArtistForm() {
  const isMobile = window.innerWidth <= 1439;

  // Лише на мобілках/планшетах — перемикати клас
  if (isMobile) {
    refs.artistForm.classList.toggle('is-hidden');
  }
}
refs.toggleButton.addEventListener('click', toggleArtistForm);

function hideFormOnMobile() {
  refs.artistForm.classList.toggle('is-hidden', window.innerWidth <= 1439);
}

hideFormOnMobile();
window.addEventListener('resize', hideFormOnMobile);

function showLoader() {
  document.querySelector('.loader').classList.remove('hide-loader');
  hideLoadMoreButton();
}
function hideLoader() {
  document.querySelector('.loader').classList.add('hide-loader');

  showLoadMoreButton();
}
