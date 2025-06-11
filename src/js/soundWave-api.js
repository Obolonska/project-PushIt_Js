// import axios from 'axios';
// import { parseAst } from 'vite';

// export async function getCards(page) {
//   try {
//     const response = await axios.get('https://sound-wave.b.goit.study/api/', {
//       params: {
//         limit: 8,
//         page: 8, //на поки
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.log('Помиклка при запиті:', error);
//     throw error;
//   }
// }
// async function fetchArtists(name, sort, genre, page = 1, limit = 8) {
//   try {
//     const baseUrl = 'https://sound-wave.b.goit.study/api/artists';
//     const params = new URLSearchParams();
//     if (name) params.append('name', name);
//     if (sort) params.append('sortName', sort);
//     if (genre) params.append('genre', genre);
//     params.append('page', page);
//     params.append('limit', limit);

//     const response = await axios.get(`${baseUrl}?${params.toString()}`);
//     console.log('Артисти отримані:', response.data);

//     // const artists = response.data;
//     // renderArtists(artists);
//   } catch (error) {
//     console.error('Помилка запиту артистів:', error.message);
//   }
// }
export async function getCards(name, sort, genre, page = 1, limit = 8) {
  try {
    const baseUrl = 'https://sound-wave.b.goit.study/api/artists';
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (sort) params.append('sortName', sort);
    if (genre) params.append('genre', genre);
    params.append('page', page);
    params.append('limit', limit);
    const response = await fetch(`${baseUrl}?${params.toString()}`);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Помилка при запиті:', error);
    throw error;
  }
}
