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

export async function getCards(page) {
  try {
    const response = await fetch(
      `https://sound-wave.b.goit.study/api/artists?limit=8&page=${page}`
    );

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
