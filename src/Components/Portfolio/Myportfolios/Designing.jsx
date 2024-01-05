import React, { useState } from "react";
import "./Projects.css";
import {
  Mernstackfirst,
  Mernstackfive,
  Mernstackfour,
  Mernstacksecond,
  Mernstacksix,
  Mernstackthered,
} from "../../../DummyData/DummyData";
import ProtfolioPopup from "./ProtfolioPopup";

const mernstack = [
  Mernstackfirst,
  Mernstacksecond,
  Mernstackthered,
  Mernstackfour,
  Mernstackfive,
  Mernstacksix,
];

function Designing() {
  const [image, setimage] = useState(null);
  const [alldata, setalldata] = useState(null);

  const handleimageClick = (image) => {
    setimage(image);
  };
  const handleallClick = (Mern) => {
    setalldata(Mern);
  };
  const close = () => {
    setimage(null);
    setalldata(null);
  };
  console.log(alldata);

  return (
    <div className="Mernstack flex justify-center items-center flex-wrap">
      <div className="Mernimagesection ">
        {mernstack.slice(0, 6).map((Merns, index) => (
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
      <ProtfolioPopup image={image} close={close} alldata={alldata} />
    </div>
  );
}

export default Designing;
