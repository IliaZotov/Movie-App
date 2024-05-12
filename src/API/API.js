export default class MovieService {
  apiBase = 'https://api.themoviedb.org/3/';

  apiKey = '879fcae5e824f1660bab83d224acc1f4';

  options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NzlmY2FlNWU4MjRmMTY2MGJhYjgzZDIyNGFjYzFmNCIsInN1YiI6IjY2MjE1Mjk3N2EzYzUyMDE3ZDRjYTUwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nkHR1bQ_oZHkbLmza0_zhohRFgopf9dUu26frNvxYuM',
    },
  };
  async getResource(url) {
    const res = await fetch(`${this.apiBase}${url}`, this.options);

    if (!res.ok) {
      throw new Error(`Could not fetch ${url}` + `, received ${res.status}`);
    }

    const body = await res.json();
    return body;
  }

  async getMovie(query, page = 1) {
    const url = `search/movie?query=${query}&include_adult=false&language=en-US&page=${page}`;
    const result = await this.getResource(url);
    return result;
  }

  async getGenresList() {
    const url = 'genre/movie/list';
    const res = await this.getResource(url);
    return res;
  }

  getMovieById = async (movieId) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  async createGuestSession() {
    const url = `authentication/guest_session/new?api_key=${this.apiKey}`;
    const res = await this.getResource(url);
    console.log('Гостевая сессия создана', res);
    return res;
  }
}
