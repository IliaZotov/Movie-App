import React from 'react';
import { Layout, Tabs } from 'antd';
import { debounce } from 'lodash';
import MovieService from '../../API/API';
import SearchTab from '../SearchTab/SearchTab';
import { GenresProvider } from '../GenresContext/GenresContext';
import './App.css';
import RatedTab from '../RatedTab/RatedTab';

export default class App extends React.Component {
  state = {
    query: '',
    movies: [],
    genresList: [],
    currentPage: null,
    totalPages: null,
    totalResults: null,
    isLoading: false,
    isError: false,
    guestSessionId: '',
    ratedMovies: [],
  };

  movieService = new MovieService();

  movieRatingData = new Map();

  componentDidMount() {
    this.createGuestSession();
    this.getGenres();
    window.addEventListener('beforeunload', this.clearLocalStorage);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.clearLocalStorage);
  }

  clearLocalStorage = () => {
    localStorage.clear();
  };

  createGuestSession() {
    this.movieService
      .createGuestSession()
      .then((guestSession) => {
        localStorage.setItem('guestSessionId', guestSession.guest_session_id);
        this.setState({ guestSessionId: guestSession.guest_session_id });
      })
      .catch((err) => console.log('Ошибка при создании гостевой сессии:', err));
  }

  onPageChange = (query, page) => {
    this.setState((prevState) => {
      const updateState = { ...prevState, isLoading: true };
      return updateState;
    });
    this.movieService
      .getMovie(query, page)
      .then((foundMovie) => {
        this.setState((prevState) => {
          const updateState = {
            ...prevState,
            movies: foundMovie.results,
            totalPages: foundMovie.total_pages,
            currentPage: foundMovie.page,
            isLoading: false,
          };
          return updateState;
        });
      })
      .catch((err) => console.log('Ошибка при загрузке страницы:', err));
  };

  getGenres() {
    this.movieService
      .getGenresList()
      .then((genres) => {
        this.setState({ genresList: genres.genres });
      })
      .catch((err) => console.log('Ошибка при загрузке жанров:', err));
  }

  rateMovie = (movieId, value) => {
    this.movieService
      .getMovieById(movieId)
      .then((movieData) => {
        movieData.rating = value;
        const ratedMovies =
          JSON.parse(localStorage.getItem('ratedMovies')) || {};
        ratedMovies[movieId] = movieData;
        localStorage.setItem('ratedMovies', JSON.stringify(ratedMovies));

        this.setState({ ratedMovies });

        this.movieRatingData.set(movieId, value);
      })
      .catch((error) => {
        console.error('Ошибка при получении данных о фильме:', error);
      });
  };

  render() {
    const {
      movies,
      isLoading,
      isError,
      genresList,
      totalResults,
      totalPages,
      guestSessionId,
      ratedMovies,
      query,
    } = this.state;

    const tabsItems = [
      {
        key: '1',
        label: 'Search',
        children: (
          <SearchTab
            movies={movies}
            isLoading={isLoading}
            isError={isError}
            totalResults={totalResults}
            totalPages={totalPages}
            guestSessionId={guestSessionId}
            query={query}
            onPageChange={this.onPageChange}
            searchMovie={this.searchMovie}
            rateMovie={this.rateMovie}
          />
        ),
      },
      {
        key: '2',
        label: 'Rated',
        children: (
          <RatedTab
            movies={movies}
            isLoading={isLoading}
            isError={isError}
            totalResults={totalResults}
            totalPages={totalPages}
            ratedMovies={ratedMovies}
            movieRatingData={this.movieRatingData}
            rateMovie={this.rateMovie}
            guestSessionId={guestSessionId}
            onPageChange={this.onPageChange}
          />
        ),
      },
    ];

    return (
      <Layout className='app'>
        <GenresProvider value={genresList}>
          <Tabs className='tabs' items={tabsItems} />
        </GenresProvider>
      </Layout>
    );
  }
}
