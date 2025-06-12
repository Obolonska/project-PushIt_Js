import { LoaderService } from './helpers/loader-service.js';
import { msToMinutesSeconds } from './helpers/minutes-to-seconds.js';
import { truncateString } from './helpers/truncate-string.js';
import { BlockScreenService } from './helpers/block-screen-service.js';

const refs = {
  autorTitle: document.querySelector('.name-artist'),
  biography: document.querySelector('.artist-description__bio p'),
  years: document.querySelector('.album-info__year .album-info__description'),
  sex: document.querySelector('.album-info__sex .album-info__description'),
  members: document.querySelector(
    '.album-info__members .album-info__description'
  ),
  country: document.querySelector(
    '.album-info__country .album-info__description'
  ),
  avatar: document.querySelector('.artist-description__left'),
  albums: document.querySelector('.albums'),
  artistsLearnMore: document.querySelector('.artist-learn-more-btn'),
  backdrop: document.querySelector('.artist-modal-backdrop'),
  modal: document.querySelector('.artist-modal-backdrop .modal'),
  closeBtn: document.querySelector('.modal .btn-close'),
  genres: document.querySelector('.artist-description__genres'),
  modalScrolled: document.querySelector('.modal-scrolled'),
};

refs.closeBtn.addEventListener('click', () => {
  closeModal();
});
refs.backdrop.addEventListener('click', handleBackdropClick);

const API_URL = 'https://sound-wave.b.goit.study/api';

export const fetchAlbums = async id => {
  console.log(id);
  try {
    const res = await fetch(`${API_URL}/artists/${id}/albums`);
    const data = await res.json();
    console.log(data);
    renderGenres(data.genres);
    renderAlbumInfo(data);
    renderAlbums(data.albumsList);
    LoaderService.show();
    openModal();
  } catch (e) {
  } finally {
    LoaderService.hide();
  }
};

function openModal() {
  refs.modalScrolled.scrollTo(0, 0);
  BlockScreenService.block();
  refs.backdrop.classList.remove('hidden');
}
function closeModal() {
  refs.modalScrolled.scrollTo(0, 0);
  refs.backdrop.classList.add('hidden');
  refs.backdrop.removeEventListener('click', handleBackdropClick);
  BlockScreenService.unblock();
}

function genresTemplate(genre) {
  return `
  <li>${genre}</li>
  `;
}
function albumTemplate({ strAlbum, tracks }) {
  return `
<li class="albums__item-wrapper ">
           <div class="albums__item album-item">
            <h3 class="album-item__title">${strAlbum}</h3>
            <table class="album-item__tracklist-table tracklist">
              <thead class="tracklist__header">
              <tr>
                <th class="head-name-track">Track</th>
                <th class="head-name-time">Time</th>
                <th class="head-name-link">Link</th>
              </tr>
              </thead>
              <tbody>
                ${renderTracks(tracks)}
              </tbody>
            </table>
</div>
          </li>
`;
}

function trackTemplate({ intDuration, movie, strTrack }) {
  return `
  <tr class="track">
                <td class="name-track">${truncateString(strTrack, 20)}</td>
                <td class="time">${msToMinutesSeconds(intDuration)}</td>
                <td class="img-icon">
                    ${renderLink(movie)}
                </td>
              </tr>
  `;
}

function renderGenres(genres) {
  refs.genres.innerHTML = genres.map(genre => genresTemplate(genre)).join('');
}

function renderAlbumInfo({
  strArtist,
  intDiedYear,
  intFormedYear,
  intMembers,
  strArtistThumb,
  strBiographyEN,
  strGender,
  strCountry,
}) {
  refs.sex.innerHTML = strGender;
  refs.members.innerHTML = intMembers;
  refs.biography.innerHTML = strBiographyEN;
  refs.years.innerHTML = getYearsString(intFormedYear, intDiedYear);
  refs.country.innerHTML = strCountry;
  refs.autorTitle.innerHTML = strArtist;
  refs.avatar.innerHTML = `<img src="${strArtistThumb}" alt="${strArtistThumb}" loading="lazy"/>`;
}

function renderAlbums(albums) {
  refs.albums.innerHTML = albums.map(album => albumTemplate(album)).join('');
}
function renderTracks(tracks) {
  return tracks.map(track => trackTemplate(track)).join('');
}

function getYearsString(formedYear, diedYear) {
  return `${formedYear}–${diedYear ?? 'present'}`;
}

function renderLink(movie) {
  return movie
    ? `<a href="${movie}" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.5933 7.20301C21.4794 6.78041 21.2568 6.39501 20.9477 6.08518C20.6386 5.77534 20.2537 5.55187 19.8313 5.43701C18.2653 5.00701 12.0003 5.00001 12.0003 5.00001C12.0003 5.00001 5.73633 4.99301 4.16933 5.40401C3.74725 5.52415 3.36315 5.75078 3.0539 6.06214C2.74464 6.3735 2.52062 6.75913 2.40333 7.18201C1.99033 8.74801 1.98633 11.996 1.98633 11.996C1.98633 11.996 1.98233 15.26 2.39233 16.81C2.62233 17.667 3.29733 18.344 4.15533 18.575C5.73733 19.005 11.9853 19.012 11.9853 19.012C11.9853 19.012 18.2503 19.019 19.8163 18.609C20.2388 18.4943 20.6241 18.2714 20.934 17.9622C21.2439 17.653 21.4677 17.2682 21.5833 16.846C21.9973 15.281 22.0003 12.034 22.0003 12.034C22.0003 12.034 22.0203 8.76901 21.5933 7.20301ZM9.99633 15.005L10.0013 9.00501L15.2083 12.01L9.99633 15.005Z" fill="white"/></svg></a>`
    : '';
}

function handleBackdropClick(e) {
  if (e.currentTarget !== e.target) return;
  closeModal();
}
