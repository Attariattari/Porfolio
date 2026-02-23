import React from "react";
import "./Projects.css";

function Mernstack({ filteredata }) {
  return (
    <div className="Mernstack">
      <div className="Mernimagesection">
        {filteredata.map((item, index) => {
          // Robust mapping for different data formats
          const projectImage = item.image || item.img;
          const projectLink = item.link || item.Link;
          const projectCategory = item.category || "Project";

          return (
            <div key={index} className="Imagecontainer">
              <span className="project-tag">{projectCategory}</span>
              <img src={projectImage} alt={item.title} />
              <div className="imagehovertext">
                <h3>{item.title}</h3>
                <p>
                  {item.description ||
                    "A professional creative project showcase."}
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

export default Mernstack;
