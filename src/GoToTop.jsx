// GoToTop.jsx
import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const GoToTop = () => {


  const scrollToTop = () => {
    const contactSection = document.getElementById("Home");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`gototop ${scrollToTop ? 'visible' : ''}`} onClick={scrollToTop}>
      <FaArrowUp />
    </div>
  );
};

export default GoToTop;
