import React from "react";
import "./Services.css";
import { FaChrome } from "react-icons/fa6";
import { Webdeveloper } from "../../DummyData/DummyData";


function Services({icon, title, details }) {
  return (
    <div className="Services">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">AMAZING SERVICES</div>
          <div className="text-lg">Meet our amazing services</div>
        </div>
      </div>
      <div className="Servicessection">
        <div className="ServiceBox">
          <div className="Servicesdetails">
            <div className="Servicesicons">
              <FaChrome />
            </div>
            <div className="Serviceslabel">Photography</div>
            <div className="Servicesinfo">
              Web design is a similar process of creation, with the intention of
              presenting the content on electronic pages ...
            </div>
          </div>
        </div>
        <div className="ServiceBox">
          <div className="Servicesdetails">
            <div className="Servicesicons">
              <FaChrome />
            </div>
            <div className="Serviceslabel">Photography</div>
            <div className="Servicesinfo">
              Web design is a similar process of creation, with the intention of
              presenting the content on electronic pages ...
            </div>
          </div>
        </div>
        <div className="ServiceBox">
          <div className="Servicesdetails">
            <div className="Servicesicons">
              <FaChrome />
            </div>
            <div className="Serviceslabel">Photography</div>
            <div className="Servicesinfo">
              Web design is a similar process of creation, with the intention of
              presenting the content on electronic pages ...
            </div>
          </div>
        </div>
        <div className="ServiceBox">
          <div className="Servicesdetails">
            <div className="Servicesicons">
              <FaChrome />
            </div>
            <div className="Serviceslabel">Photography</div>
            <div className="Servicesinfo">
              Web design is a similar process of creation, with the intention of
              presenting the content on electronic pages ...
            </div>
          </div>
        </div>
        <div className="ServiceBox">
          <div className="Servicesdetails">
            <div className="Servicesicons">
              <FaChrome />
            </div>
            <div className="Serviceslabel">Photography</div>
            <div className="Servicesinfo">
              Web design is a similar process of creation, with the intention of
              presenting the content on electronic pages ...
            </div>
          </div>
        </div>
        <div className="ServiceBox">
          <div className="Servicesdetails">
            <div className="Servicesicons">
              <FaChrome />
            </div>
            <div className="Serviceslabel">Photography</div>
            <div className="Servicesinfo">
              Web design is a similar process of creation, with the intention of
              presenting the content on electronic pages ...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
