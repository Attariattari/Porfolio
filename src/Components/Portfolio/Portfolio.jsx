import React, { useState } from "react";
import "./Portfolio.css";

function Portfolio() {
  const [activeButton, setActiveButton] = useState("All"); // Initialize with "All" as the default active button

  // Sample data for demonstration
  const portfolioData = [
    { category: "All Show", content: "All Show content" },
    { category: "Mern Stack", content: "Mern Stack content" },
    { category: "UX / UI Designing", content: "UX / UI Designing content" },
    { category: "Backend Projects", content: "Backend Projects content" },
  ];

  // Function to filter data based on the active button
  const filteredData = activeButton === "All" ? portfolioData : portfolioData.filter(item => item.category === activeButton);

  return (
    <div className="Portfolio">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">CREATIVE WORKS</div>
          <div className="text-lg">Check out our latest creative works</div>
        </div>
      </div>
      <div className="ProtfolioSection">
        <div className="ProtfolioButtons">
          {["All Show", "Mern Stack", "UX / UI Designing", "Backend Projects"].map((buttonText) => (
            <button
              key={buttonText}
              className={`Buttonfor ${activeButton === buttonText ? "activeButton" : ""}`}
              onClick={() => setActiveButton(buttonText)}
            >
              {buttonText}
            </button>
          ))}
        </div>
      </div>

      {/* Display filtered data */}
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
