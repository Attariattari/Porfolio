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
    setSelectedService(null);
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 100,
    });
  }, []);

  return (
    <div className="Services" id="Services">
      {/* Aurora Section Header */}
      <div className="AboutHeader_modern">
        <div className="HeaderBadge">
          <span className="BadgeLine"></span>
          <span className="BadgeText">WHAT I DO</span>
          <span className="BadgeLine"></span>
        </div>
        <h2 className="HeaderTitle">
          Premium <span className="GradientText">Digital Services</span>
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
            data-aos-delay={index * 100}
          >
            <div className="Servicesdetails">
              <div className="icons">{service.icons}</div>
              <h3 className="Serviceslabel">{service.title}</h3>
              <p className="Servicesinfo">
                {service.intro?.length > 95
                  ? `${service.intro.slice(0, 95)}...`
                  : service.intro}
              </p>
            </div>

            <button
              onClick={() => handleButtonClick(service)}
              className="service-cta-btn"
            >
              Learn More <span>→</span>
            </button>
          </div>
        ))}
      </div>

      <Servicepopup info={selectedService} closePopup={closePopup} />
    </div>
  );
}

export default Services;
