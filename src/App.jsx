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
  const [activeSection, setActiveSection] = useState("About"); // Default active
  const currentSectionRef = useRef();

  useEffect(() => {
    let initialScrollDone = false;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      let current = sections[0].id;

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

    // ❌ pehle call hata do
    // handleScroll();

    const onLoadScroll = () => {
      if (!initialScrollDone) {
        initialScrollDone = true;
        return;
      }
      handleScroll();
    };

    window.addEventListener("scroll", onLoadScroll);

    return () => window.removeEventListener("scroll", onLoadScroll);
  }, [activeSection]);

  // Scroll event listener to update activeSection on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      let current = sections[0].id;

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

    // 🟢 Add scroll listener after short delay to avoid triggering on load
    const timeoutId = setTimeout(() => {
      window.addEventListener("scroll", handleScroll);
    }, 1000); // delay of 1 second

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  // Scroll to section on mount or hash change AND set activeSection accordingly
  useEffect(() => {
    const scrollToSection = (sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setActiveSection(sectionId);
      }
    };

    const hash = window.location.hash.substring(1);
    if (hash && sections.find((sec) => sec.id === hash)) {
      scrollToSection(hash);
    } else {
      setActiveSection("About");
      const section = document.getElementById("About");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const handleClick = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id); // 👈 yahi cheez zaroori hay
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
