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
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection ">
        {mernstack.map((Merns, index) => (
          <div
            key={index}
            className="flex justify-center items-center Imagecontainer"
          >
            <img src={Merns.img} alt="" />
            <div className="imagehovertext ">
              <div className="merntext">{Merns.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Designing;
