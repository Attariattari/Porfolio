import React, { useState, useEffect } from "react";
import "./Portfolio.css";
import "./Myportfolios/Projects.css";
import Mernstack from "./Myportfolios/Mernstack";
import Feadback from "./Feadback";
import TextSlider from "./TextSlider";
import { projects } from "../../DummyData/DummyData";

function Portfolio() {
  const [activeButton, setActiveButton] = useState(
    localStorage.getItem("activeButton") || "All Show",
  );

  const [initialLoad, setInitialLoad] = useState(true);
  const categories = [
    "All Show",
    ...new Set(projects.map((item) => item.category)),
  ];

  const handleButtonClick = (buttonText) => {
    setActiveButton(buttonText);
  };

  useEffect(() => {
    localStorage.setItem("activeButton", activeButton);
  }, [activeButton]);

  useEffect(() => {
    if (initialLoad) {
      setActiveButton("All Show");
      setInitialLoad(false);
    }
  }, [initialLoad]);

  const filteredData =
    activeButton === "All Show"
      ? projects
      : projects.filter((item) => item.category === activeButton);

  return (
    <div className="Portfolio">
      {/* Aurora Modern Header */}
      <div className="AboutHeader_modern">
        <div className="HeaderBadge">
          <span className="BadgeLine"></span>
          <span className="BadgeText">PORTFOLIO</span>
          <span className="BadgeLine"></span>
        </div>
        <h2 className="HeaderTitle">
          Creative <span className="GradientText">Showcase</span>
        </h2>
        <div className="HeaderDivider">
          <div className="Dot"></div>
          <div className="Line"></div>
          <div className="Dot"></div>
        </div>
      </div>

      <div className="ProtfolioSection">
        <div className="ProtfolioButtons">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`Buttonfor ${
                activeButton === cat ? "activeButton" : ""
              }`}
              onClick={() => handleButtonClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="PortfolioContent">
          <Mernstack filteredata={filteredData} />
        </div>
      </div>

      <div className="Muhyotech">
        <div className="Muhyotechclicd">
          <div className="webprojectsinfo">
            <div className="TestimonialHeader">
              <span className="SubTitle">TESTIMONIALS</span>
              <h2 className="MainTitle">
                What My <span className="GradientText">Clients Say</span>
              </h2>
            </div>
            <TextSlider />
          </div>
        </div>
      </div>

      {/* Modernized Stats/Feedback Section */}
      <div className="feadbackparent">
        <div className="feadback">
          <div className="feadbakeone">
            <div className="flex justify-center items-center flex-col">
              <div className="text-3xl">
                <Feadback targetValue={100} />+
              </div>
              <div className="text-md">Projects Completed</div>
            </div>
          </div>

          <div className="feadbaketwo">
            <div className="flex justify-center items-center flex-col">
              <div className="text-3xl">
                <Feadback targetValue={80} />
                K+
              </div>
              <div className="text-md">Lines of Code</div>
            </div>
          </div>

          <div className="feadbakethree">
            <div className="flex justify-center items-center flex-col">
              <div className="text-3xl">
                <Feadback targetValue={150} />+
              </div>
              <div className="text-md">Happy Clients</div>
            </div>
          </div>

          <div className="feadbakefour">
            <div className="flex justify-center items-center flex-col">
              <div className="text-3xl">
                <Feadback targetValue={25} />+
              </div>
              <div className="text-md">Global Awards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
