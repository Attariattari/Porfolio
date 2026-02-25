import React, { useState, useEffect } from "react";
import "./Portfolio.css";
import "./Myportfolios/Projects.css";
import Mernstack from "./Myportfolios/Mernstack";
import Feadback from "./Feadback";
import TextSlider from "./TextSlider";
import { projects } from "../../DummyData/DummyData";

function Portfolio() {
  const [activeButton, setActiveButton] = useState(
    localStorage.getItem("activeButton") || "All Show"
  );

  // State to track initial load
  const [initialLoad, setInitialLoad] = useState(true);
  const categories = [
    "All Show",
    ...new Set(projects.map((item) => item.category)),
  ];

  const handleButtonClick = (buttonText) => {
    setActiveButton(buttonText);
    console.log(`Button clicked: ${buttonText}`);
  };

  // Update localStorage whenever activeButton changes
  useEffect(() => {
    localStorage.setItem("activeButton", activeButton);
  }, [activeButton]);

  // Set "All Show" as active on initial load
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
  const portfolioData = [
    {
      category: activeButton,
      content: <Mernstack filteredata={filteredData} />,
    },
  ];

  console.log("Filtered Data:", filteredData);

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
      </div>

      <div className="PortfolioContent">
        {portfolioData.map((item, index) => (
          <div key={index} className="PortfolioItem">
            <p>{item.content}</p>
          </div>
        ))}
      </div>
      <div className="Muhyotech">
        <div className="Muhyotechclicd">
          <div className="webprojectsinfo">
            <TextSlider />
          </div>
        </div>
      </div>
      <div className="feadbackparent">
        <div className="feadback">
          <div className="flex justify-center items-center feadbakeone">
            <div className="flex justify-center items-center flex-col">
              <div className="text-3xl font-semibold flex">
                <Feadback targetValue={100} />+
              </div>
              <div className="text-md">Projects Compelte</div>
            </div>
          </div>
          <div className="flex justify-center items-center feadbaketwo">
            <div className="flex justify-center items-center flex-col">
              <div className="text-3xl font-semibold flex">
                <Feadback targetValue={30} />
                K+
              </div>
              <div className="text-md">Codes of Lines</div>
            </div>
          </div>
          <div className="flex justify-center items-center feadbakethree">
            <div className="flex justify-center items-center flex-col">
              <div className="text-3xl font-semibold flex ">
                <Feadback targetValue={100} />+
              </div>
              <div className="text-md">Happy Clients</div>
            </div>
          </div>
          <div className="flex justify-center items-center feadbakefour">
            <div className="flex justify-center items-center flex-col">
              <div className="text-3xl font-semibold flex">
                <Feadback targetValue={50} />+
              </div>
              <div className="text-md">My Awards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
{
  /*  */
}
