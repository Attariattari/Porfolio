import React, { useState, useEffect } from "react";
import "./Portfolio.css";
import "./Myportfolios/Projects.css";
import Mernstack from "./Myportfolios/Mernstack";
import Designing from "./Myportfolios/Designing";
import OtherCMS from "./Myportfolios/OtherCMS";
import UXUIDesigner from "./Myportfolios/UXUIDesigner";
import { GiHadesSymbol } from "react-icons/gi";
import Feadback from "./Feadback";

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
      <div className="Muhyotech">
        <div className="Muhyotechclicd">
          <div className="webprojectsinfo">
            <div id="gallery" className="relative w-full" data-carousel="slide">
              <div className="relative h-96 overflow-hidden rounded-lg md:h-96">
                <div
                  className="hidden duration-700 ease-in-out"
                  data-carousel-item
                >
                  <div className="muhyotext">
                    <div className="muhyotextin">
                      <div className="Muhyotechicon">
                        <GiHadesSymbol />
                      </div>
                      <p className="Muhyotechtext">
                        “Awesome to work with Muhyo. Good organized, easy to
                        communicate with, responsive with next iterations.”
                      </p>

                      <div className="Muhyotechauthor">
                        Muhyo Tech Web Developer
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="hidden duration-700 ease-in-out"
                  data-carousel-item="active"
                >
                  <div className="muhyotext">
                    <div className="muhyotextin">
                      <div className="Muhyotechicon">
                        <GiHadesSymbol />
                      </div>
                      <p className="Muhyotechtext">
                        “Muhyo collaboration: Organized, responsive,
                        effective—effortless iterations, ensuring successful
                        outcomes.”
                      </p>

                      <div className="Muhyotechauthor">
                        Muhyo Tech Web Developer
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="hidden duration-700 ease-in-out"
                  data-carousel-item
                >
                  <div className="muhyotext">
                    <div className="muhyotextin">
                      <div className="Muhyotechicon">
                        <GiHadesSymbol />
                      </div>
                      <p className="Muhyotechtext">
                        “Partnering with Muhyo: Efficient, communicative, smooth
                        iterations—ensuring productive, successful
                        collaboration.”
                      </p>

                      <div className="Muhyotechauthor">
                        Muhyo Tech Web Developer
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="hidden duration-700 ease-in-out"
                  data-carousel-item
                >
                  <div className="muhyotext">
                    <div className="muhyotextin">
                      <div className="Muhyotechicon">
                        <GiHadesSymbol />
                      </div>
                      <p className="Muhyotechtext">
                        “Muhyo teamwork: Organized, responsive,
                        communicative—successful outcomes, streamlined
                        iterations, effective collaboration.”
                      </p>

                      <div className="Muhyotechauthor">
                        Muhyo Tech Web Developer
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="hidden duration-700 ease-in-out"
                  data-carousel-item
                >
                  <div className="muhyotext">
                    <div className="muhyotextin">
                      <div className="Muhyotechicon">
                        <GiHadesSymbol />
                      </div>
                      <p className="Muhyotechtext">
                        “Collaborating with Muhyo: Organized, responsive,
                        effective—smooth iterations, ensuring successful
                        collaboration and outcomes.”
                      </p>

                      <div className="Muhyotechauthor">
                        Muhyo Tech Web Developer
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
