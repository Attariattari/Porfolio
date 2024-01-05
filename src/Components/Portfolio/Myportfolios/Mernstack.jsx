import React, { useState } from "react";
import "./Projects.css";
import ProtfolioPopup from "./ProtfolioPopup";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [image, setimage] = useState(null);
  const [alldata, setalldata] = useState(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [showLess, setShowLess] = useState(false);

  const handleimageClick = (image) => {
    setimage(image);
  };

  const handleallClick = (index) => {
    setCurrentIndex(index);
    setalldata(mernstack[index]);
  };

  const showPreview = () => {
    const newIndex = (currentIndex - 1 + mernstack.length) % mernstack.length;
    setalldata(mernstack[newIndex]);
    setCurrentIndex(newIndex);
  };

  const showNext = () => {
    const newIndex = (currentIndex + 1) % mernstack.length;
    setalldata(mernstack[newIndex]);
    setCurrentIndex(newIndex);
  };

  const close = () => {
    setimage(null);
    setalldata(null);
    setShowAllItems(false);
    setShowLess(false);
  };

  return (
    <div
      className={`Mernstack flex justify-center items-center flex-wrap ${
        showLess ? "showLess" : ""
      }`}
    >
      <div className="Mernimagesection">
        {showAllItems
          ? mernstack.map((Merns, index) => (
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
                      onClick={() => handleallClick(index)}
                      className="detailsicons"
                    >
                      {Merns.iconSecond}
                    </button>
                  </div>
                  <div className="merntext">{Merns.title}</div>
                </div>
              </div>
            ))
          : mernstack.slice(0, 6).map((Merns, index) => (
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
                      onClick={() => handleallClick(index)}
                      className="detailsicons"
                    >
                      {Merns.iconSecond}
                    </button>
                  </div>
                  <div className="merntext">{Merns.title}</div>
                </div>
              </div>
            ))}
        {/* <div className="showallandlees">
          {!showAllItems && mernstack.length > 6 && (
            <button onClick={() => setShowAllItems(true)}>Show All</button>
          )}
          {showAllItems && (
            <button onClick={() => setShowLess(true)}>Show Less</button>
          )}
        </div> */}
      </div>
      <ProtfolioPopup
        image={image}
        close={close}
        alldata={alldata}
        showPreview={showPreview}
        showNext={showNext}
      />
    </div>
  );
}

export default Mernstack;
