import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import Portfolio from "./Components/Portfolio/Portfolio";
import Services from "./Components/Services/Services";
import Contact from "./Components/Contact/Contact";
import Sidebar from "./Components/Sidebar/Bar";
import About from "./Components/About/About";
import Home from "./Components/Home/Home";
import News from "./Components/News/News";
import GoToTop from "./GoToTop";
import "./App.css";
import {
  IoHome,
  IoInformationCircleOutline,
  IoConstructOutline,
  IoBriefcaseOutline,
  IoNewspaperOutline,
  IoMailOutline,
} from "react-icons/io5";

const sections = [
  { id: "Home", title: "Home", icon: <IoHome />, component: <Home /> },
  {
    id: "About",
    title: "About",
    icon: <IoInformationCircleOutline />,
    component: <About />,
  },
  {
    id: "Services",
    title: "Services",
    icon: <IoConstructOutline />,
    component: <Services />,
  },
  {
    id: "Portfolio",
    title: "Portfolio",
    icon: <IoBriefcaseOutline />,
    component: <Portfolio />,
  },
  {
    id: "News",
    title: "News",
    icon: <IoNewspaperOutline />,
    component: <News />,
  },
  {
    id: "Contact",
    title: "Contact",
    icon: <IoMailOutline />,
    component: <Contact />,
  },
];

const App = () => {
  const openIconStyle = {
    width: "24px",
    height: "24px",
    fontSize: "1.5rem",
  };

  const closeIconStyle = {
    width: "30px",
    height: "30px",
    fontSize: "1.8rem",
  };
  const [activeSection, setActiveSection] = useState("Home");
  const contentRef = useRef(null);

  // Scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const content = contentRef.current;
      const scrollPosition = content.scrollTop + content.offsetHeight / 3;

      let current = activeSection;

      for (const { id } of sections) {
        const section = document.getElementById(id);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            current = id;
            break;
          }
        }
      }

      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeSection]);

  // Scroll to section on mount or hash change
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && sections.find((sec) => sec.id === hash)) {
      const section = document.getElementById(hash);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setActiveSection(hash);
      }
    }
  }, []);

  const handleClick = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    console.log("Active section changed to:", activeSection);
  }, [activeSection]);

  return (
    <Router>
      <div className="app">
        <div className="sidebar">
          <Sidebar
            sections={sections}
            openIconStyle={openIconStyle}
            closeIconStyle={closeIconStyle}
            activeSection={activeSection}
            scrollToSection={handleClick} // ✅ ye line zaroor add karo
          />
        </div>
        <div className="content" ref={contentRef}>
          {sections.map((section) => (
            <div key={section.id} id={section.id} className={section.id}>
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
