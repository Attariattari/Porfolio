import React, { useState } from "react";
import "./Projects.css";
import {
  bulldogtribe,
  amyherzogdesigns,
  bigcommerce,
  korbanstudio,
  theoceancleanup,
  toddshelton,
  doucals,
  frenchtoday,
} from "../../../DummyData/DummyData";

const OtherCMSData = [
  bulldogtribe,
  amyherzogdesigns,
  bigcommerce,
  korbanstudio,
  theoceancleanup,
  toddshelton,
  doucals,
  frenchtoday,
];

function OtherCMS() {
  return (
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection ">
        {OtherCMSData.map((Merns, index) => (
          <div
            key={index}
            className="flex justify-center items-center Imagecontainer shadow-xl shadow-neutral-700"
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

export default OtherCMS;
