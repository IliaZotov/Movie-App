import React from 'react';
import { Spin, Pagination, Alert, Input } from 'antd';
import { debounce } from 'lodash';
import MovieService from '../../API/API';
import MovieCard from '../MovieCard/MovieCard';
import ErrorComponent from '../ErrorComponent/ErrorComponent';

export default class SearchTab extends React.Component {
  state = {
    query: '',
    movies: [],
    currentPage: null,
    totalPages: null,
    totalResults: null,
    isLoading: false,
    isError: false,
  };

  movieService = new MovieService();

  searchMovie = (query = '') => {
    if (!query.trim()) {
      this.setState({
        movies: [],
        currentPage: null,
        totalPages: null,
        totalResults: null,
        isLoading: false,
        isError: false,
      });
      return;
    }
    this.movieService
      .getMovie(query)
      .then((foundMovie) => {
        this.setState({
          movies: foundMovie.results,
          currentPage: foundMovie.page,
          totalPages: foundMovie.total_pages,
          totalResults: foundMovie.total_results,
          isLoading: false,
          isError: false,
          query: query,
        });
      })
      .catch((err) => {
        console.log('Ошибка при поиске фильма:', err);
        this.setState({ isError: true, isLoading: false });
      });
  };

  inputChange = debounce((event) => {
    const query = event.target.value.trim();
    if (query) {
      this.setState({ isLoading: true, isError: false });
    } else {
      this.setState({ isLoading: false, isError: false });
    }
    this.searchMovie(query);
  }, 500);

  renderMovieCard = () => {
    const { movies } = this.state;
    const { rateMovie } = this.props;
    return movies.map((movie) => (
      <li key={movie.id}>
        <MovieCard
          id={movie.id}
          title={movie.title}
          date={movie.release_date}
          descriptions={movie.overview}
          rate={movie.vote_average}
          posterUrl={movie.poster_path}
          genresIds={movie.genre_ids}
          rateMovie={rateMovie}
        />
      </li>
    ));
  };

  render() {
    const { isLoading, isError, totalResults, totalPages, currentPage, query } =
      this.state;

    const errorMessage = isError ? <ErrorComponent /> : null;

    const notFoundMessage =
      totalPages === 1 && totalResults === 0 ? (
        <>
          <Alert
            type='warning'
            message='Nothing found...'
            banner
            className='notFound'
          />
        </>
      ) : null;

    const spinner = isLoading ? (
      <Spin size='large' className='spinner' />
    ) : null;

    const movieList = <ul className='movie-list'>{this.renderMovieCard()}</ul>;

    const pagination =
      totalResults > 0 ? (
        <Pagination
          className='pagination'
          total={totalResults}
          showSizeChanger={false}
          showQuickJumper={false}
          current={currentPage}
          onChange={(page) => this.searchMovie(query, page)}
        />
      ) : null;

    return (
      <>
        <Input
          className='input'
          placeholder='Type to search...'
          onChange={this.inputChange}
        />
        {spinner}
        {errorMessage}
        {notFoundMessage}
        {movieList}
        {pagination}
      </>
    );
  }
}
