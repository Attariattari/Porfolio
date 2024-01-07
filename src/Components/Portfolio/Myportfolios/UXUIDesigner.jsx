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
import ProtfolioPopup from "./ProtfolioPopup";

const Uxuidesignerone = [
  BankingApp,
];
const Uxuidesignertwo = [
  AouponApp,
];
const Uxuidesignerthree = [
  fooddeliverwebandmobileapp,
];
const Uxuidesignerfour = [
  Wireframeandflowchart,
];
const Uxuidesignerfive = [
  weblandingpage,
];
const Uxuidesignersix = [
  multiplescreens,
];

function Designer() {
  const [imageUx, setimageUx] = useState(null);
  const [allUxdata, setallUxdata] = useState(null);

  const handleimageClick = (image) => {
    setimageUx(image);
  };
  const handleallClick = (Mern) => {
    setallUxdata(Mern);
  };
  const close = () => {
    setimageUx(null);
    setallUxdata(null);
  };
  console.log(allUxdata);

  return (
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection ">
        {Uxuidesignerone.map((Merns, index) => (
          <div
            key={index}
            className="flex justify-center items-center Imagecontainer"
          >
            <img src={Merns.img} alt="" />
            <div className="imagehovertext ">
              <div className="iconsweb">
                <button
                  onClick={() => handleimageClick(Merns.img)}
                  className="detailsicons"
                >
                  {Merns.iconfirst}
                </button>
                <button
                  onClick={() => handleallClick(Merns)}
                  className="detailsicons"
                >
                  {Merns.iconSecond}
                </button>
              </div>

              <div className="merntext">{Merns.title}</div>
            </div>
          </div>
        ))}
        {Uxuidesignertwo.map((Merns, index) => (
          <div
            key={index}
            className="flex justify-center items-center Imagecontainer"
          >
            <img src={Merns.img} alt="" />
            <div className="imagehovertext ">
              <div className="iconsweb">
                <button
                  onClick={() => handleimageClick(Merns.img)}
                  className="detailsicons"
                >
                  {Merns.iconfirst}
                </button>
                <button
                  onClick={() => handleallClick(Merns)}
                  className="detailsicons"
                >
                  {Merns.iconSecond}
                </button>
              </div>

              <div className="merntext">{Merns.title}</div>
            </div>
          </div>
        ))}
      </div>
      <ProtfolioPopup image={imageUx} close={close} allUxdata={allUxdata} />
    </div>
  );
}

export default Designer;
