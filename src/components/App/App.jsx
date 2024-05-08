import React from "react";
import { Layout, Tabs } from "antd";
import { debounce } from "lodash";
import MovieService from "../../API/API";
import SearchTab from "../SearchTab/SearchTab";
import { GenresProvider } from "../GenresContext/GenresContext";
import "./App.css";
import RatedTab from "../RatedTab/RatedTab";

export default class App extends React.Component {
  state = {
    query: "",
    movies: [],
    genresList: [],
    currentPage: null,
    totalPages: null,
    totalResults: null,
    isLoading: false,
    isError: false,
    guestSessionId: "",
    ratedMovies: [],
  };

  movieService = new MovieService();

  movieRatingData = new Map();

  componentDidMount() {
    this.getGenres();
    window.addEventListener("beforeunload", this.clearLocalStorage);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.clearLocalStorage);
  }

  clearLocalStorage = () => {
    localStorage.clear();
  };

  createGuestSession() {
    this.movieService
      .createGuestSession()
      .then((guestSession) => {
        this.setState({ guestSessionId: guestSession.guest_session_id });
      })
      .catch((err) => console.log("Ошибка при создании гостевой сессии:", err));
  }

  searchMovie(query = "") {
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
        console.log("Ошибка при поиске фильма:", err);
        this.setState({ isError: true, isLoading: false });
      });
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
      .catch((err) => console.log("Ошибка при загрузке страницы:", err));
  };

  getGenres() {
    this.movieService
      .getGenresList()
      .then((genres) => {
        this.setState({ genresList: genres.genres });
      })
      .catch((err) => console.log("Ошибка при загрузке жанров:", err));
  }

  inputChange = debounce((event) => {
    const query = event.target.value.trim();
    if (query) {
      this.setState({ isLoading: true, isError: false });
    } else {
      this.setState({ isLoading: false, isError: false });
    }
    this.searchMovie(query);
  }, 500);

  rateMovie = (movieId, value) => {
    this.movieService
      .getMovieById(movieId)
      .then((movieData) => {
        movieData.rating = value;
        const ratedMovies =
          JSON.parse(localStorage.getItem("ratedMovies")) || {};
        ratedMovies[movieId] = movieData;
        localStorage.setItem("ratedMovies", JSON.stringify(ratedMovies));

        this.setState({ ratedMovies });

        this.movieRatingData.set(movieId, value);
      })
      .catch((error) => {
        console.error("Ошибка при получении данных о фильме:", error);
      });
  };

  getRatedMovies = () => {
    const ratedMovies = JSON.parse(localStorage.getItem("ratedMovies")) || {};

    const ratedMoviesArray = Object.keys(ratedMovies).map(
      (movieId) => ratedMovies[movieId],
    );
    this.setState({ ratedMovies: ratedMoviesArray });
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
        key: "1",
        label: "Search",
        children: (
          <SearchTab
            movies={movies}
            isLoading={isLoading}
            isError={isError}
            totalResults={totalResults}
            totalPages={totalPages}
            rateMovie={this.rateMovie}
            guestSessionId={guestSessionId}
            inputChange={this.inputChange}
            onPageChange={this.onPageChange}
            query={query}
          />
        ),
      },
      {
        key: "2",
        label: "Rated",
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
            getRatedMovies={this.getRatedMovies}
            onPageChange={this.onPageChange}
          />
        ),
      },
    ];

    return (
      <Layout className="app">
        <GenresProvider value={genresList}>
          <Tabs className="tabs" items={tabsItems} />
        </GenresProvider>
      </Layout>
    );
  }
}
