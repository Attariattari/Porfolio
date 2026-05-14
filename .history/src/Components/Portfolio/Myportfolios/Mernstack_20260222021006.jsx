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

          return (
            <div key={index} className="Imagecontainer">
              <img src={projectImage} alt={item.title} />
              <div className="imagehovertext">
                <h3>{item.title}</h3>
                <p>
                  {item.description ||
                    "A professional creative project showcase."}
                </p>
                <a href={projectLink} target="_blank" rel="noopener noreferrer">
                  <button className="merntext">View Project</button>
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
