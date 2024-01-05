import React, { useEffect, useState } from "react";
import "../../Services/Servicepopup.css";
import './Projects.css'
import { IoIosCloseCircleOutline } from "react-icons/io";

function ProtfolioPopup({ image, close  , alldata}) {
  const [scrollDisabled, setScrollDisabled] = useState(false);

  useEffect(() => {
    if (image) {
      // Disable scrolling when the popup is open
      document.body.style.overflow = "hidden";
      setScrollDisabled(true);
    } else {
      // Enable scrolling when the popup is closed
      document.body.style.overflow = "auto";
      setScrollDisabled(false);
    }

    // Cleanup function to enable scrolling when the component is unmounted
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
              <button className="ProtfolioPopupClose Close " onClick={close}>
                <IoIosCloseCircleOutline className="text-3xl text-white Closeicon" />
              </button>
            </div>
          </div>
        </div>
      )}
      {alldata && (
        <div className="Servicepopup">
          <div className="Servicepopupchild">
            <div className="Header text-white">
              <div>{alldata.title}</div>
              <button className="Close" onClick={close}>
                <IoIosCloseCircleOutline className="text-3xl Closeicon" />
              </button>
            </div>
            <div className="ImagePopup">
              <img src={alldata.img} alt="" />
            </div>

            <div className="p-3">{truncateText(alldata.details, 40)}</div>
            <div className="p-3 FullDetails">
              <button className="Fulldetails">Full Details</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default ProtfolioPopup;
