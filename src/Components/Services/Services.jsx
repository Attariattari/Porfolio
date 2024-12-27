import React, { useEffect, useState } from "react";
import "./Services.css";
import {
  Webdeveloper,
  Uxuidesigner,
  Backenddeveloper,
  Branding,
  SocialMedia,
  SEO,
} from "../../DummyData/DummyData";
import Servicepopup from "./Servicepopup";
import AOS from "aos";
import "aos/dist/aos.css";
const servicesData = [
  Webdeveloper,
  Uxuidesigner,
  Backenddeveloper,
  Branding,
  SocialMedia,
  SEO,
];

function Services() {
  const [selectedService, setSelectedService] = useState(null);

  const handleButtonClick = (service) => {
    setSelectedService(service);
  };

  const closePopup = () => {
    setSelectedService(null); // Update to set the selectedService to null
  };
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      offset: 200, // Offset (in pixels) from the top of the screen
      // other configuration options...
    });
  }, []);
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
              className=" mt-3"
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
