import React, { useState, useEffect } from "react";
import "./Portfolio.css";
import Mernstack from "./Myportfolios/Mernstack";
import Designing from "./Myportfolios/Designing";
import OtherCMS from "./Myportfolios/OtherCMS";
import UXUIDesigner from "./Myportfolios/UXUIDesigner";

function Portfolio() {
  const [activeButton, setActiveButton] = useState(
    localStorage.getItem("activeButton") || "All Show"
  );

  const portfolioData = [
    { category: "Mern Stack", content: <Mernstack /> },
    { category: "UX / UI Designing", content: <UXUIDesigner /> },
    { category: "Others CMS", content: <OtherCMS /> },
    { category: "Designing", content: <Designing /> },
  ];

  const handleButtonClick = (buttonText) => {
    setActiveButton(buttonText);
  };

  // Update localStorage whenever activeButton changes
  useEffect(() => {
    localStorage.setItem("activeButton", activeButton);
  }, [activeButton]);

  const filteredData =
    activeButton === "All Show"
      ? portfolioData
      : portfolioData.filter((item) => item.category === activeButton);

  return (
    <div className="Portfolio">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">CREATIVE WORKS</div>
          <div className="text-lg">Check out our latest creative works</div>
        </div>
      </div>
      <div className="ProtfolioSection">
        <div className="ProtfolioButtons space-x-8">
          <button
            className={`Buttonfor ${
              activeButton === "All Show" ? "activeButton" : ""
            }`}
            onClick={() => handleButtonClick("All Show")}
          >
            All Show
          </button>
          <button
            className={`Buttonfor ${
              activeButton === "Mern Stack" ? "activeButton" : ""
            }`}
            onClick={() => handleButtonClick("Mern Stack")}
          >
            Mern Stack
          </button>
          <button
            className={`Buttonfor ${
              activeButton === "UX / UI Designing" ? "activeButton" : ""
            }`}
            onClick={() => handleButtonClick("UX / UI Designing")}
          >
            UX / UI Designing
          </button>
          <button
            className={`Buttonfor ${
              activeButton === "Others CMS" ? "activeButton" : ""
            }`}
            onClick={() => handleButtonClick("Others CMS")}
          >
            Others CMS
          </button>
          <button
            className={`Buttonfor ${
              activeButton === "Designing" ? "activeButton" : ""
            }`}
            onClick={() => handleButtonClick("Designing")}
          >
            Designing
          </button>
        </div>
      </div>

      <div className="PortfolioContent">
        {filteredData.map((item, index) => (
          <div key={index} className="PortfolioItem">
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Portfolio;
