import React, { useState, useEffect } from "react";
import "./Portfolio.css";
import "./Myportfolios/Projects.css";
import Mernstack from "./Myportfolios/Mernstack";
import { FaCheckCircle, FaCode, FaUsers, FaAward } from "react-icons/fa";
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
      {/* Background Decorative Blobs */}
      <div className="aura-blob aura-blob-1"></div>
      <div className="aura-blob aura-blob-2"></div>
      <div className="aura-blob aura-blob-3"></div>

      {/* MUHYO TECH Modern Header */}
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
      <div className="StatsSection">
        <div className="StatsGrid">
          {[
            {
              target: 100,
              label: "Projects Completed",
              suffix: "+",
              icon: <FaCheckCircle />,
            },
            {
              target: 80,
              label: "Lines of Code",
              suffix: "K+",
              icon: <FaCode />,
            },
            {
              target: 150,
              label: "Happy Clients",
              suffix: "+",
              icon: <FaUsers />,
            },
            {
              target: 25,
              label: "Global Awards",
              suffix: "+",
              icon: <FaAward />,
            },
          ].map((stat, index) => (
            <div key={index} className="StatCard">
              <div className="StatIcon">{stat.icon}</div>
              <div className="StatValue">
                <Feadback targetValue={stat.target} />
                {stat.suffix}
              </div>
              <div className="StatLabel">{stat.label}</div>
              <div className="StatBar"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
