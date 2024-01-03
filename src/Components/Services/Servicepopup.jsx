import React, { useEffect, useState } from "react";
import "./Servicepopup.css";

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

  return (
  
      <div className={`Serviceall ${scrollDisabled ? "scroll-disabled" : ""}`}>
        {info && (
          <div className="Servicepopup">
            <div className="Servicepopupchild">
              <div>{info.title}</div>
              <div>{info.details}</div>
              <button className="Close" onClick={closePopup}>
                X
              </button>
            </div>
          </div>
        )}
    
    </div>
  );
}

export default Servicepopup;
