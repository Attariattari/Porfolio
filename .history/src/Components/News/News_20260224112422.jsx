import React, { useState } from "react";
import "./News.css";
import {
  whatisreact,
  whatisnodejs,
  whatisuxuidesigner,
  whatisbranding,
  whatisSocialMedia,
  whatisMarketing,
} from "../../DummyData/DummyData";
import Servicepopup from "../Services/Servicepopup";

const newsData = [
  whatisreact,
  whatisnodejs,
  whatisuxuidesigner,
  whatisbranding,
  whatisSocialMedia,
  whatisMarketing,
];

function News() {
  const [selectedNews, setSelectedNews] = useState(null);

  const handleButtonClick = (news) => {
    setSelectedNews(news);
  };

  const closePopup = () => {
    setSelectedNews(null);
  };

  return (
    <div className="News">
      {/* Background Decorative Blobs */}
      <div className="aura-blob aura-blob-1"></div>
      <div className="aura-blob aura-blob-2"></div>
      <div className="aura-blob aura-blob-3"></div>

      {/* MUHYO TECH Section Header */}
      <div className="AboutHeader_modern">
        <div className="HeaderBadge">
          <span className="BadgeLine"></span>
          <span className="BadgeText">INSIGHTS & NEWS</span>
          <span className="BadgeLine"></span>
        </div>
        <h2 className="HeaderTitle">
          Latest <span className="GradientText">Articles</span>
        </h2>
        <div className="HeaderDivider">
          <div className="Dot"></div>
          <div className="Line"></div>
          <div className="Dot"></div>
        </div>
      </div>

      <div className="news-grid">
        {newsData.map((item, index) => (
          <div
            className="news-card"
            key={index}
            onClick={() => handleButtonClick(item)}
          >
            <div className="news-image-container">
              <img src={item.img} alt={item.title} />
            </div>

            <div className="news-card-content">
              <span className="news-tag">Tech Insight</span>
              <h3 className="news-card-title">{item.title}</h3>

              <p className="news-card-excerpt">
                {item.Introduction?.length > 140
                  ? `${item.Introduction.slice(0, 140)}...`
                  : item.Introduction}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick(item);
                }}
                className="news-read-more"
              >
                Read Story <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Servicepopup selectedNews={selectedNews} closePopup={closePopup} />
    </div>
  );
}

export default News;
