import React from "react";
import { Spin, Pagination, Alert, Input } from "antd";
import MovieCard from "../MovieCard/MovieCard";
import ErrorComponent from "../ErrorComponent/ErrorComponent";

export default class SearchTab extends React.Component {
  renderMovieCard = () => {
    const { movies, rateMovie } = this.props;

    const movieCardRes = movies.map((movie) => (
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
    return movieCardRes;
  };

  render() {
    const {
      isLoading,
      isError,
      totalResults,
      totalPages,
      movies,
      inputChange,
      currentPage,
      onPageChange,
      query,
    } = this.props;

    const errorMessage = isError ? <ErrorComponent /> : null;

    const notFoundMessage =
      totalPages === 1 && movies.length === 0 ? (
        <>
          <Alert
            type="warning"
            message="Nothing found..."
            banner
            className="notFound"
          />
        </>
      ) : null;

    const spinner = isLoading ? (
      <Spin size="large" className="spinner" />
    ) : null;

    const movieList = (
      <>
        <ul className="movie-list">{this.renderMovieCard()}</ul>
      </>
    );

    const pagination =
      totalResults > 0 ? (
        <Pagination
          className="pagination"
          total={totalPages}
          showSizeChanger={false}
          showQuickJumper={false}
          current={currentPage}
          onChange={(page) => onPageChange(query, page)}
        />
      ) : null;

    return (
      <>
        <Input
          className="input"
          placeholder="Type to search..."
          onChange={inputChange}
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
