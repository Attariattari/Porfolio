import React, { useState } from "react";
import "./Projects.css";
import {
  Mernstackfirst,
  Mernstacksecond,
  Mernstackthered,
} from "../../../DummyData/DummyData";
const mernstack = [Mernstackfirst, Mernstacksecond, Mernstackthered];
function Designing() {
  return (
    <div className="Mernstack">
      <div className="Mernimagesection">
        {mernstack.map((item, index) => {
          const projectImage = item.img || item.image;
          const projectLink = item.Link || item.link;
          const projectCategory = "Development";

          return (
            <div key={index} className="Imagecontainer">
              <span className="project-tag">{projectCategory}</span>
              <img src={projectImage} alt={item.title} />
              <div className="imagehovertext">
                <h3>{item.title}</h3>
                <p>
                  {item.details ||
                    "A professional development project showcase."}
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

export default Designing;
