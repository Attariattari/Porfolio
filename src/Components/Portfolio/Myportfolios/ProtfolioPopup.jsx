import React, { useEffect, useState } from "react";
import { IoIosCloseCircleOutline, IoMdArrowRoundForward } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import "../../Services/Servicepopup.css";
import "./Projects.css";
import "./Protfoliopopup.css";
import { IoMdArrowRoundBack } from "react-icons/io";

function ProtfolioPopup({ image, close, alldata, showPreview, showNext }) {
  const [scrollDisabled, setScrollDisabled] = useState(false);

  useEffect(() => {
    if (image) {
      document.body.style.overflow = "hidden";
      setScrollDisabled(true);
    } else {
      document.body.style.overflow = "auto";
      setScrollDisabled(false);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [image]);

  const truncateText = (text, numWords) => {
    const words = text.split(" ");
    if (words.length > numWords) {
      return words.slice(0, numWords).join(" ") + " ...";
    }
    return text;
  };

  return (
    <div className={`Serviceall ${scrollDisabled ? "scroll-disabled" : ""}`}>
      {image && !alldata && (
        <div className="Servicepopup">
          <div className="Servicepopupchild">
            <div className="ProtfolioPopupPopup">
              <img src={image} alt="" />
              <button className="ProtfolioPopupClose Close" onClick={close}>
                <IoIosCloseCircleOutline className="text-3xl text-white Closeicon" />
              </button>
            </div>
          </div>
        </div>
      )}
      {alldata && (
        <div className="Protfoliopopup">
          <div className="Protfoliopopupchild">
            <div className="Header text-white">
              <div>{alldata.title}</div>
              <button className="Close" onClick={close}>
                <IoIosCloseCircleOutline className="text-3xl Closeicon" />
              </button>
            </div>
            <div className="ImagePopup">
              <img src={alldata.img} alt="" />
            </div>
            <div className="px-3 py-3">{truncateText(alldata.details, 40)}</div>
            <div className="px-3 flex justify-between items-center">
              <div>{truncateText(alldata.thanks, 40)}</div>
              <div className="createit">{alldata.createit}</div>
            </div>
            <div className="p-3">
              <div className="p- font-bold">Website Details</div>
              <div className="p- flex justify-start space-x-2 items-center">
                <GoDotFill /> <div>{truncateText(alldata.plateform, 40)}</div>
              </div>
            </div>
            <div className="p-3 FullProtfolioDetails flex justify-between items-center">
              <div className="font-bold">Visit Website :</div>
              <a href={alldata.Link} target="_blank" rel="noopener noreferrer">
                <button className="Fulldetails">Visit {alldata.Visit}</button>
              </a>
            </div>
            <div>
              <div className="py-4 px-4 parentprenext flex justify-between items-center">
                <button className="prenext" onClick={showPreview}><IoMdArrowRoundBack /></button>
                <button className="prenext" onClick={showNext}><IoMdArrowRoundForward /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProtfolioPopup;
