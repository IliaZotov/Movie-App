import React from "react";
import "./MovieCard.css";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { Tag, Typography, Rate, Progress } from "antd";
import { FrownOutlined } from "@ant-design/icons";
import { GenresConsumer } from "../GenresContext/GenresContext";

const { Title, Text } = Typography;

export default class MovieCard extends React.Component {
  rateColor(value) {
    let color = "";

    if (value < 3) {
      color = "#E90000";
    } else if (value >= 3 && value < 5) {
      color = "#E97E00";
    } else if (value >= 5 && value <= 7) {
      color = "#E9D100";
    } else if (value > 7) {
      color = "#66E900";
    }
    return color;
  }

  genresMatching(genres, ids) {
    const matchedGenres = genres.filter((genre) =>
      ids.some((id) => id === genre.id),
    );
    return matchedGenres.map((genre) => (
      <Tag key={genre.id} className="card-tags">
        {genre.name}
      </Tag>
    ));
  }

  render() {
    const {
      title,
      date,
      genresIds,
      descriptions,
      rate,
      posterUrl,
      id,
      rateMovie,
      userMovieRating,
    } = this.props;

    const img = !posterUrl ? (
      <FrownOutlined className="notFoundIcon" />
    ) : (
      <img
        src={`https://image.tmdb.org/t/p/original${posterUrl}`}
        alt="Movie Title Img"
      />
    );

    const descriptionText =
      descriptions.length > 130
        ? `${descriptions.substring(0, 130)}...`
        : descriptions;

    return (
      <div className="movie-card">
        <div className="card-poster">{img}</div>
        <div className="card-title">
          <Title level={5}>{title}</Title>
          <Progress
            className="progress"
            type="circle"
            size={40}
            steps={1}
            trailColor={this.rateColor(rate)}
            format={(percent) => `${percent}`}
            percent={rate.toFixed(1)}
          ></Progress>
        </div>
        <div className="card-info">
          <div className="card-date">
            {date
              ? format(new Date(date), "MMMM dd, yyyy", { locale: enGB })
              : "Date unknown"}
          </div>
          <GenresConsumer>
            {(value) => this.genresMatching(value, genresIds)}
          </GenresConsumer>
        </div>
        <div className="card-description">
          <Text className="card-text">{descriptionText}</Text>
          <Rate
            className="card-rate"
            count={10}
            allowHalf
            onChange={(value) => rateMovie(id, value)}
            defaultValue={userMovieRating}
          ></Rate>
        </div>
      </div>
    );
  }
}
