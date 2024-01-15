import React, { useState } from "react";
import "./Projects.css";
import {
  BankingApp,
  AouponApp,
  fooddeliverwebandmobileapp,
  Wireframeandflowchart,
  weblandingpage,
  multiplescreens,
} from "../../../DummyData/DummyData";

const Uxuidesigner = [
  BankingApp,
  AouponApp,
  fooddeliverwebandmobileapp,
  Wireframeandflowchart,
  weblandingpage,
  multiplescreens,
];

function Designer() {
  return (
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection ">
        {Uxuidesigner.map((Merns, index) => (
          <div
            key={index}
            className="flex justify-center items-center Imagecontainer shadow-md shadow-neutral-700"
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

export default Designer;
