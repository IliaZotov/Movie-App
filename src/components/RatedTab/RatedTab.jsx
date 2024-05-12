import React from 'react';
import { Spin, Pagination, Alert } from 'antd';
import MovieCard from '../MovieCard/MovieCard';
import ErrorComponent from '../ErrorComponent/ErrorComponent';

export default class RatedTab extends React.Component {
  getRatedMovies = () => {
    const ratedMovies = JSON.parse(localStorage.getItem('ratedMovies')) || {};

    const ratedMoviesArray = Object.keys(ratedMovies).map(
      (movieId) => ratedMovies[movieId],
    );
    this.setState({ ratedMovies: ratedMoviesArray });
  };

  componentDidMount() {
    this.getRatedMovies();
    const ratedMoviesString = localStorage.getItem('ratedMovies');
    const ratedMovies = JSON.parse(ratedMoviesString);
  }

  renderMovieCard = () => {
    const { movieRatingData, ratedMovies, rateMovie } = this.props;
    const movieCards = Object.keys(ratedMovies).map((movieId) => {
      const movie = ratedMovies[movieId];
      return (
        <li key={movie.id}>
          <MovieCard
            id={movie.id}
            title={movie.title}
            date={movie.release_date}
            descriptions={movie.overview}
            rate={movie.vote_average}
            posterUrl={movie.poster_path}
            genresIds={movie.genres}
            rateMovie={rateMovie}
            userMovieRating={
              movieRatingData.get(movie.id) ? movieRatingData.get(movie.id) : 0
            }
          />
        </li>
      );
    });
    return movieCards;
  };

  render() {
    const { isLoading, isError, movieRatingData, currentPage, onPageChange } =
      this.props;
    const movieList = (
      <>
        <ul className='movie-list'>{this.renderMovieCard()}</ul>
      </>
    );

    const spinner = isLoading ? (
      <Spin size='large' className='spinner' />
    ) : null;

    const pagination =
      movieRatingData.size !== 0 ? (
        <Pagination
          className='pagination'
          total={1}
          showSizeChanger={false}
          showQuickJumper={false}
          current={currentPage}
          onChange={(page) => onPageChange(page)}
        />
      ) : null;

    const notFoundMessage =
      movieRatingData.size === 0 ? (
        <>
          <Alert
            type='warning'
            message='Nothing found...'
            banner
            className='notFound'
          />
        </>
      ) : null;

    const errorMessage = isError ? <ErrorComponent /> : null;

    return (
      <>
        {spinner}
        {errorMessage}
        {notFoundMessage}
        {movieList}
        {pagination}
      </>
    );
  }
}
