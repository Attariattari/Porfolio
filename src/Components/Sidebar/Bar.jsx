import Nav from "../../Pages/Nav";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import "./Sidebar.css";
import { CgCloseR } from "react-icons/cg";
export default function Sidebar({ sections }) {
  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
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
    <div className="Sidebar">
      <div className="xl:hidden lg:hidden flex items-center justify-between p-4 absolute z-10 w-full text-white font-bold Nav">
        <div className="left-0 ">Muhyo Tech</div>

        <button onClick={() => setShowNav(true)} className="right-0">
          <HiMenu className="barbtn text-3xl" />
        </button>
      </div>
      <div className="flex">
        <Nav
          show={showNav}
          scrollToSection={scrollToSection}
          sections={sections}
        >
          <button
            className="absolute right-3 top-3 md:hidden navclosebutton"
            onClick={() => setShowNav(false)}
          >
            <CgCloseR className="text-3xl" />
          </button>
        </Nav>
      </div>
    </div>
  );
}
