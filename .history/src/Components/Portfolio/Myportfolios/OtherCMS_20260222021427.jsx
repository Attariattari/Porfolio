import React, { useState } from "react";
import "./Projects.css";
import {
  bulldogtribe,
  amyherzogdesigns,
  bigcommerce,
} from "../../../DummyData/DummyData";

const OtherCMSData = [bulldogtribe, amyherzogdesigns, bigcommerce];

function OtherCMS() {
  return (
    <div className="Mernstack">
      <div className="Mernimagesection">
        {OtherCMSData.map((item, index) => {
          const projectImage = item.img || item.image;
          const projectLink = item.Link || item.link;
          const projectCategory = "CMS Portfolio";

          return (
            <div key={index} className="Imagecontainer">
              <span className="project-tag">{projectCategory}</span>
              <img src={projectImage} alt={item.title} />
              <div className="imagehovertext">
                <h3>{item.title}</h3>
                <p>
                  {item.details ||
                    "Professional CMS and eCommerce platform development."}
                </p>
                <a href={projectLink} target="_blank" rel="noopener noreferrer">
                  <button className="merntext">
                    View Project <span>→</span>
                  </button>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OtherCMS;
