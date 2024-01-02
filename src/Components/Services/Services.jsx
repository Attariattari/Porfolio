import React from "react";
import "./Services.css";
import { FaChrome } from "react-icons/fa6";
import {
  Webdeveloper,
  Uxuidesigner,
  Backenddeveloper,
  Branding,
  SocialMedia,
  Marketing,
} from "../../DummyData/DummyData";

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
              <div className="Servicesicons">{service.icon}</div>
              <div className="Serviceslabel">{service.title}</div>
              <div className="Servicesinfo">
                {truncateText(service.details, 25)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
