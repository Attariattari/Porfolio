import React, { useState } from "react";
import "../Services/Services.css";
import {
  whatisreact,
  whatisnodejs,
  whatisuxuidesigner,
  whatisbranding,
  whatisSocialMedia,
  whatisMarketing
} from "../../DummyData/DummyData";
import Servicepopup from "../Services//Servicepopup";

const whatisreacta = [
  whatisreact,
  whatisnodejs,
  whatisuxuidesigner,
  whatisbranding,
  whatisSocialMedia,
  whatisMarketing
];

function News() {
  const [selectedNews, setSelectedNews] = useState(null);

  const handleButtonClick = (News) => {
    setSelectedNews(News);
  };

  const closePopup = () => {
    setSelectedNews(null);
  };

  return (
    <div className="News">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">LATEST NEWS</div>
          <div className="text-lg">Check out our latest News</div>
        </div>
      </div>
      <div className="Servicessection">
        {whatisreacta.map((News, index) => (
          <div className="ServiceBox" key={index}>
            <div className="Servicesdetails">
              <div className="Servicesicons shadow-lg ">
                <img src={News.img} alt="" />
              </div>
              <div className="text-md font-bold py-2">{News.title}</div>
              <div className="Servicesinfo">{News.Introduction}</div>
            </div>
            <button
              onClick={() => handleButtonClick(News)}
              className="Button mt-3"
            >
              More info
            </button>
          </div>
        ))}
      </div>
      <Servicepopup selectedNews={selectedNews} closePopup={closePopup} />
    </div>
  );
}

export default News;
