import React, { useEffect, useState } from "react";
import "./Services.css";
import { services } from "../../DummyData/DummyData";
import Servicepopup from "./Servicepopup";
import AOS from "aos";
import "aos/dist/aos.css";

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
      <div className="AboutHeader_modern">
        <div className="HeaderBadge">
          <span className="BadgeLine"></span>
          <span className="BadgeText">OUR SERVICES</span>
          <span className="BadgeLine"></span>
        </div>
        <h2 className="HeaderTitle">
          Amazing <span className="GradientText">Services</span>
        </h2>
        <div className="HeaderDivider">
          <div className="Dot"></div>
          <div className="Line"></div>
          <div className="Dot"></div>
        </div>
      </div>
      <div className="Servicessection">
        {services.map((service, index) => (
          <div
            className="ServiceBox"
            key={index}
            data-aos="fade-up"
            data-aos-delay={`${(index % 3) * 150}`}
          >
            <div className="Servicesdetails">
              <div className="IconContainer">
                <div className="icons">{service.icons}</div>
              </div>
              <h3 className="Serviceslabel">{service.title}</h3>
              <p className="Servicesinfo">
                {service.intro?.length > 85
                  ? `${service.intro.slice(0, 85)}...`
                  : service.intro}
              </p>
            </div>
            <button
              onClick={() => handleButtonClick(service)}
              className="ServiceBtn mt-3"
            >
              <span>More info</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-arrow-right"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <Servicepopup info={selectedService} closePopup={closePopup} />
    </div>
  );
}

export default Services;
