import React, { useState } from "react";
import "./Projects.css";
import {
  Mernstackfirst,
  Mernstackfive,
  Mernstackfour,
  Mernstacksecond,
  Mernstacksix,
  Mernstackthered,
  Mernstackseven,
  Mernstackeight,
  Mernstacknine,
  Mernstackten,
  Mernstackeleven,
  Mernstacktwelve,
} from "../../../DummyData/DummyData";

const mernstack = [
  Mernstackfirst,
  Mernstacksecond,
  Mernstackthered,
  Mernstackfour,
  Mernstackfive,
  Mernstacksix,
  Mernstackseven,
  Mernstackeight,
  Mernstacknine,
  Mernstackten,
  Mernstackeleven,
  Mernstacktwelve,
];

function Mernstack() {
  return (
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection">
        {mernstack.map((Merns, index) => (
          <div
            key={index}
            className="flex justify-center items-center Imagecontainer shadow-xl shadow-neutral-700"
          >
            <img src={Merns.img} alt="" />
            <div className="imagehovertext ">
              <a
                href={mernstack.Link}
                target="_blank"
                rel="noopener noreferrer"
              >
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
