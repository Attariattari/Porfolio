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
  gooddyeyoung,
  kawaiibox,
  porterandyork,
  robertocoin,
  shoprootscience,
  vicfirthzildjian,
  gritz,
} from "../../../DummyData/DummyData";
import ProtfolioPopup from "./ProtfolioPopup";

const OtherCMSData = [
  bulldogtribe,
  amyherzogdesigns,
  bigcommerce,
  korbanstudio,
  theoceancleanup,
  toddshelton,
  doucals,
  frenchtoday,
  gooddyeyoung,
  kawaiibox,
  porterandyork,
  robertocoin,
  shoprootscience,
  vicfirthzildjian,
  gritz,
];

function OtherCMS() {
  const [imageOtherCMS, setimageOtherCMS] = useState(null);
  const [alldataOtherCMS, setalldataOtherCMS] = useState(null);

  const handleimageClick = (image) => {
    setimageOtherCMS(image);
  };
  const handleallClick = (Mern) => {
    setalldataOtherCMS(Mern);
  };
  const close = () => {
    setimageOtherCMS(null);
    setalldataOtherCMS(null);
  };
  console.log(setalldataOtherCMS);

  return (
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection ">
        {OtherCMSData.slice(0, 6).map((Merns, index) => (
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
      <ProtfolioPopup image={imageOtherCMS} close={close} alldataOtherCMS={alldataOtherCMS} />
    </div>
  );
}

export default OtherCMS;
