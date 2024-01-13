import React, { useEffect, useState } from "react";
import "./Servicepopup.css";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Contact from "../Contact/Contact";
import { ToastContainer, toast } from "react-toastify";
import { useData } from "../../UseContaxt/Datacontaxt";

function Servicepopup({ info, closePopup }) {
  const { setSubjectAndMessage, subject, message } = useData();
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
  const HairFunction = () => {
    if (subject && message) {
      toast.warning("Data already sent. Please wait for a response.");
      return;
    }
  
    if (info && info.subject && info.message) {
      setSubjectAndMessage(info.subject, info.message);
      closePopup();
      toast.success("Data sent successfully!");
  
      // Scroll to the Contact section
      const contactSection = document.getElementById("Contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      toast.error("Error sending data. Please try again.");
    }
  };
  
  // const HairFunction = () => {
  //   if (subject && message) {
  //     toast.warning("Data already sent. Please wait for a response.");
  //     return;
  //   }

  //   if (info && info.subject && info.message) {
  //     setSubjectAndMessage(info.subject, info.message);
  //     closePopup();
  //     toast.success("Data sent successfully!");
  //   } else {
  //     toast.error("Error sending data. Please try again.");
  //   }
  // };

  return (
    <div className={`Serviceall ${scrollDisabled ? "scroll-disabled" : ""}`}>
      {info && (
        <div className="Servicepopup">
          <div className="Servicepopupchild">
            <div className="Header text-white sticky top-0">
              <div>{info.title}</div>
              <button className="Close" onClick={closePopup}>
                <IoIosCloseCircleOutline className="text-3xl Closeicon" />
              </button>
            </div>
            <div className="ImagePopup">
              <img src={info.img} alt="" />
            </div>

            <div className="p-3">{info.details}</div>
            <div className="p-3">{info.detailstwo}</div>
            <div className="p-3">{info.detailsthree}</div>
            <div className="p-3">{info.detailsfour}</div>
            <div className="mt-3 p-3 font-bold">{info.forhair}</div>
            <div className="p-3 FullDetails">
              <button
                className="Fulldetails"
                onClick={() => HairFunction(info)}
              >
                Hair Me
              </button>
              <ToastContainer position="top-right" theme="dark" />
            </div>
          </div>
        </div>
      )}
      <div>
      </div>
    </div>
  );
}

export default Servicepopup;
