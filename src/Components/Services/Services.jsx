import React, { useState } from "react";
import "./Services.css";
import {
  Webdeveloper,
  Uxuidesigner,
  Backenddeveloper,
  Branding,
  SocialMedia,
  Marketing,
} from "../../DummyData/DummyData";
import Servicepopup from "./Servicepopup";

const servicesData = [
  Webdeveloper,
  Uxuidesigner,
  Backenddeveloper,
  Branding,
  SocialMedia,
  Marketing,
];

// Helper function to truncate text to a specified number of words
const truncateText = (text, numWords) => {
  const words = text.split(" ");
  if (words.length > numWords) {
    return words.slice(0, numWords).join(" ") + " ...";
  }
  return text;
};

function Services() {
  const [selectedService, setSelectedService] = useState(null);

  const handleButtonClick = (service) => {
    setSelectedService(service);
  };

  const closePopup = () => {
    setSelectedService(null); // Update to set the selectedService to null
  };

  return (
    <div className="Services">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">AMAZING SERVICES</div>
          <div className="text-lg">Meet our amazing services</div>
        </div>
      </div>
      <div className="Servicessection">
        {servicesData.slice(0, 6).map((service, index) => (
          <div className="ServiceBox" key={index}>
            <div className="Servicesdetails">
              <img src={service.img} alt="" />
              <div className="Serviceslabel">{service.title}</div>
              <div className="Servicesinfo">{service.details}</div>
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
      <Servicepopup info={selectedService} closePopup={closePopup} />
    </div>
  );
}

export default Services;
