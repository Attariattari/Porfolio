import React from "react";
import "./Projects.css";

function Mernstack({ category, filteredata }) {
  return (
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection">
        {filteredata.map((item, index) => (
          <div
            key={index}
            className="flex justify-center items-center Imagecontainer shadow-md shadow-neutral-700"
          >
            <img src={item.img} alt={item.title} />
            <div className="imagehovertext ">
              <a href={item.Link} target="_blank" rel="noopener noreferrer">
                <button className="merntext">{item.title}</button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mernstack;
