import React, { useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./App.css"; // Import your stylesheet

const GoToTop = () => {
  const scrollToTop = () => {
    const contactSection = document.getElementById("Home");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsClicked(true);
  };

  const [isClicked, setIsClicked] = useState(false);

  return (
    <div
      className={`gototop ${isClicked ? "is-clicked" : ""}`}
      onClick={scrollToTop}
    >
      <FaArrowUp />
    </div>
  );
};

export default GoToTop;
