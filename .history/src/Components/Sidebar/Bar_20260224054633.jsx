import Nav from "../../Pages/Nav";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import "./Sidebar.css";
import { CgCloseR } from "react-icons/cg";

export default function Sidebar({
  sections,
  openIconStyle,
  closeIconStyle,
  activeSection,
  scrollToSection,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showNav, setShowNav] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  function handleResize() {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    setShowNav(!mobile);
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setShowNav(false);
  }, [location.pathname]);

  return (
    <div className="Sidebar">
      {/* Mobile Header Modernized */}
      {isMobile && (
        <div className="flex items-center justify-between absolute z-20 w-full Nav">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white">
              M
            </div>
            <div className="font-extrabold text-white tracking-tighter text-xl">
              MUHYO<span className="text-indigo-500">TECH</span>
            </div>
          </div>
          <button onClick={() => setShowNav(true)} className="p-2">
            <HiMenu className="barbtn text-3xl" />
          </button>
        </div>
      )}

      <div className="flex">
        <Nav
          show={showNav}
          setShowNav={setShowNav}
          scrollToSection={scrollToSection}
          sections={sections}
          openIconStyle={openIconStyle}
          closeIconStyle={closeIconStyle}
          activeSection={activeSection}
          isMobile={isMobile}
        >
          {isMobile && (
            <button
              className="absolute right-6 top-6 navclosebutton"
              onClick={() => setShowNav(false)}
            >
              <CgCloseR size={24} />
            </button>
          )}
        </Nav>
      </div>
    </div>
  );
}
