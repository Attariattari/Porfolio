import React, { useState } from "react";
import "./Projects.css";
import {
  Mernstackfirst,
  Mernstacksecond,
  Mernstackthered,
} from "../../../DummyData/DummyData";

const mernstack = [Mernstackfirst, Mernstacksecond, Mernstackthered];

function Mernstack() {
  return (
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection">
        {mernstack.map((Merns, index) => (
          <div
            key={index}
            className="flex justify-center items-center Imagecontainer shadow-md shadow-neutral-700"
          >
            <img src={Merns.img} alt="" />
            <div className="imagehovertext ">
              <a href={Merns.Link} target="_blank" rel="noopener noreferrer">
                <button className="merntext">{Merns.title}</button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mernstack;
