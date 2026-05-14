import React, { useEffect, useState } from "react";
import "./Services.css";
import { services } from "../../DummyData/DummyData";
import Servicepopup from "./Servicepopup";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaArrowRight } from "react-icons/fa6";

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
      once: true,
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
            data-aos-delay={index * 100}
            onClick={() => handleButtonClick(service)}
          >
            <div className="CardNumber">
              {index + 1 < 10 ? `0${index + 1}` : index + 1}
            </div>
            <div className="Servicesdetails">
              <div className="icons">{service.icons}</div>
              <div className="Serviceslabel">{service.title}</div>
              <div className="Servicesinfo">
                {service.intro?.length > 100
                  ? `${service.intro.slice(0, 100)}...`
                  : service.intro}
              </div>
            </div>
            <button className="mt-3">
              More info <FaArrowRight />
            </button>
          </div>
        ))}
      </div>
      <Servicepopup info={selectedService} closePopup={closePopup} />
    </div>
  );
}

export default Services;
