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
            className="ServiceBox_modern"
            key={index}
            data-aos="fade-up"
            data-aos-delay={`${index * 100}`}
          >
            <div className="ServiceIcon_modern">{service.icons}</div>
            <div className="ServiceContent_modern">
              <h3 className="ServiceTitle_modern">{service.title}</h3>
              <p className="ServiceDesc_modern">
                {service.intro?.length > 90
                  ? `${service.intro.slice(0, 90)}...`
                  : service.intro}
              </p>
            </div>
            <button
              onClick={() => handleButtonClick(service)}
              className="ServiceBtn_modern"
            >
              <span>Explore More</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="arrow-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
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
