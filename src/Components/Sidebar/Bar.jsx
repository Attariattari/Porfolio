import Nav from "../../Pages/Nav";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import "./Sidebar.css";

export default function Sidebar({ sections }) {
  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };
  const [showNav, setShowNav] = useState(false);

  function resize() {
    if (window.innerWidth >= 1024) {
      setShowNav(false);
    }
  }

  useEffect(() => {
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    setShowNav(false);
  }, [useLocation()]);

  return (
    <div
      className="Sidebar"
      
    >
      <div
        className="xl:hidden flex items-center justify-between p-4 absolute z-10 w-full text-white font-bold "
      >
        <div className="left-0 ">Muhyo Tech</div>

        <button onClick={() => setShowNav(true)} className="right-0">
          <HiMenu className="text-3xl" />
        </button>
      </div>
      <div className="flex">
        <Nav show={showNav} scrollToSection={scrollToSection} sections={sections}>
          <button
            onClick={() => setShowNav(false)}
            className="absolute right-0 top-0 md:hidden"
          >
            Close
          </button>
        </Nav>
       
      </div>
    </div>
  );
}
