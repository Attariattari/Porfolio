import React, { useEffect, useState } from "react";
import "./Servicepopup.css";
import { IoIosCloseCircleOutline } from "react-icons/io";

function Servicepopup({ info, closePopup }) {
  const [scrollDisabled, setScrollDisabled] = useState(false);

  useEffect(() => {
    if (info) {
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
  }, [info]);
  const truncateText = (text, numWords) => {
    const words = text.split(" ");
    if (words.length > numWords) {
      return words.slice(0, numWords).join(" ") + " ...";
    }
    return text;
  };
  return (
    <div className={`Serviceall ${scrollDisabled ? "scroll-disabled" : ""}`}>
      {info && (
        <div className="Servicepopup">
          <div className="Servicepopupchild">
            <div className="Header text-white">
              <div>{info.title}</div>
              <button className="Close" onClick={closePopup}>
                <IoIosCloseCircleOutline className="text-3xl Closeicon" />
              </button>
            </div>
            <div className="ImagePopup">
              <img src={info.img} alt="" />
            </div>

            <div className="p-3">{truncateText(info.details, 30)}</div>
            <div className="p-3 FullDetails">
              <button className="Fulldetails">Full Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servicepopup;
