import Swiper from 'swiper';
import 'swiper/css/bundle';
async function fetchPhotos() {
  const imageLeft = document.querySelector('.images-1');
  const imageRight = document.querySelector('.images-2');
  try {
    const resLeft = await fetch(
      'https://sound-wave.b.goit.study/api/artists?limit=4&page=1'
    );
    const dataLeft = await resLeft.json();
    const resRight = await fetch(
      'https://sound-wave.b.goit.study/api/artists?limit=4&page=3'
    );
    const dataRight = await resRight.json();
    const imagesLeft = dataLeft.artists.map(image => image.strArtistThumb);
    const imagesRight = dataRight.artists.map(image => image.strArtistThumb);
    imageLeft.innerHTML = renderPhotos(imagesLeft);
    imageRight.innerHTML = renderPhotos(imagesRight);
  } catch (error) {
    console.error(error.message);
  }
}

function renderPhotos(arr) {
  return arr.map(image => `<img src="${image}" alt="artist"/>`).join('');
}

fetchPhotos();
