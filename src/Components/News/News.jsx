import React, { useState } from "react";
import "../Services/Services.css";
import {
  whatisreact,
  whatisnodejs,
  whatisuxuidesigner,
  whatisbranding,
  whatisSocialMedia,
  whatisMarketing,
} from "../../DummyData/DummyData";
import Servicepopup from "../Services//Servicepopup";

const whatisreacta = [
  whatisreact,
  whatisnodejs,
  whatisuxuidesigner,
  whatisbranding,
  whatisSocialMedia,
  whatisMarketing,
];

function News() {
  const [selectedNews, setselectedNews] = useState(null);

  const handleButtonClick = (service) => {
    setselectedNews(service);
  };

  const closePopup = () => {
    setselectedNews(null);
  };

  return (
    <div className="News">
      <div className="AboutHeader_modern">
        <div className="HeaderBadge">
          <span className="BadgeLine"></span>
          <span className="BadgeText">NEWS</span>
          <span className="BadgeLine"></span>
        </div>
        <h2 className="HeaderTitle">
          Latest <span className="GradientText">News</span>
        </h2>
        <div className="HeaderDivider">
          <div className="Dot"></div>
          <div className="Line"></div>
          <div className="Dot"></div>
        </div>
      </div>
      <div className="Servicessection">
        {whatisreacta.map((service, index) => (
          <div className="ServiceBox" key={index}>
            <div className="Servicesdetails">
              <div className="Servicesicons shadow-lg ">
                <img src={service.img} alt="" />
              </div>
              <div className="text-center text-md font-bold py-2">
                {service.title}
              </div>
              <div className="text-center Servicesinfo">
                {service.Introduction?.length > 180
                  ? `${service.Introduction.slice(0, 180)}...`
                  : service.Introduction}
              </div>
            </div>
            <button
              onClick={() => handleButtonClick(service)}
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

// {
//
// }
