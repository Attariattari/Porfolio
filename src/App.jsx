import React, { useEffect, useRef, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Portfolio from "./Components/Portfolio/Portfolio";
import Services from "./Components/Services/Services";
import Contact from "./Components/Contact/Contact";
import Sidebar from "./Components/Sidebar/Bar";
import About from "./Components/About/About";
import Home from "./Components/Home/Home";
import News from "./Components/News/News";
import GoToTop from "./GoToTop";
import "./App.css";

const sections = [
  { id: "Home", title: "Home", component: <Home /> },
  { id: "About", title: "About", component: <About /> },
  { id: "Services", title: "Services", component: <Services /> },
  { id: "Portfolio", title: "Portfolio", component: <Portfolio /> },
  { id: "News", title: "Strength", component: <News /> },
  { id: "Contact", title: "Contact", component: <Contact /> },
];

const App = () => {
  const currentSectionRef = useRef();
  useEffect(() => {
    const scrollToSection = (sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    };

    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToSection(hash);
    } else {
      scrollToSection("About");
    }
  }, [currentSectionRef]);

  return (
    <Router>
      <div className="app">
        <div className="sidebar">
          <Sidebar sections={sections} />
        </div>
        <div className="content">
          {sections.map((section) => (
            <div
              key={section.id}
              ref={section.id === "Home" ? currentSectionRef : null}
              id={section.id}
              className={section.id}
            >
              {section.component}
            </div>
          ))}
        </div>
        <GoToTop />
      </div>
    </Router>
  );
};

export default App;
