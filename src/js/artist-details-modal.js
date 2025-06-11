import { getCards } from './soundWave-api';
import iconsUrl from '../img/icons.svg?url';
// import { getArtistId } from './artist.js';

artistsList.addEventListener('click', getArtistId);

function getArtistId(event) {
  if (event.target.classList.contains('artist-learn-more-btn')) {
    const artistCard = event.target.closest('.artist-card');
    const artlistId = artistCard.dataset.id;
    console.log('Clicked artist ID: ', artlistId);
  }
}

const artistsList = document.querySelector('.artists-cards-list');

artistsList.addEventListener('click', getArtistId);
console.log(artistsList);



// Знаходимо елементи
const backdrop = document.querySelector('.backdrop');
const modal = document.querySelector('.modal-artist');
const btnClose = document.querySelector('.btn-close');

// Функція для закриття модалки
function closeModal() {
  backdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

// Подія на кнопку закриття
btnClose.addEventListener('click', closeModal);

// Додатково — закриття при кліку на фон (backdrop)
backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) {
    closeModal();
  }
});

// Закриття по клавіші Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});


function openModal() {
    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
  }
  

//-------------------------------------------------------------------//


    

 async function renderModalContent({
    strArtist,
    strBiographyEN,
    strArtistThumb,
    intFormedYear,
    strGender,
    intMembers,
    strCountry,
  }) {
    const modalContent = `
      <h2 class="name-artist">${strArtist}</h2>
      
      <div class="artist-description">
        <img class="photo-artist" src="${strArtistThumb}" alt="${strArtist}" />
        <ul class="list-bio">
          <li class="bio-item">
            <h3 class="bio-name">Years active</h3>
            <p>${intFormedYear || 'Unknown'} - present</p>
          </li>
          <li class="bio-item">
            <h3 class="bio-name">Sex</h3>
            <p>${strGender || 'Unknown'}</p>
          </li>
          <li class="bio-item">
            <h3 class="bio-name">Members</h3>
            <p>${intMembers || 'Unknown'}</p>
          </li>
          <li class="bio-item">
            <h3 class="bio-name">Country</h3>
            <p>${strCountry || 'Unknown'}</p>
          </li>
        </ul>
      </div>
  
      <div>
        <h3 class="bio-name">Biography</h3>
        <p class="bio-text">
          ${strBiographyEN || 'No biography available.'}
        </p>
      </div>
  
      <div class="albums-section">
        <h2 class="albums-title">Albums</h2>
        <ul class="albums">
          <!-- Тут можна вставити альбоми, якщо є -->
        </ul>
      </div>
  
      <div class="scroll-padding"></div>
    `;
  
    // Вставляємо у контейнер
    const modalScrollContainer = document.querySelector('.modal-scrolled');
    modalScrollContainer.innerHTML = modalContent;
  }
  
renderModalContent(data.artists);