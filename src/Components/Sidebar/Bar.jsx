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
    setShowNav(!mobile); // if mobile, hide sidebar; if desktop, show sidebar
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setShowNav(false); // close nav on route change (mobile only)
  }, [location.pathname]);

  return (
    <div className="Sidebar">
      {/* Mobile header only */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 absolute z-10 w-full text-white font-bold Nav">
          <div>Muhyo Tech</div>
          <button onClick={() => setShowNav(true)}>
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
          {/* {isMobile && (
            <button
              className="absolute right-3 top-3 navclosebutton"
              onClick={() => setShowNav(false)}
            >
              <CgCloseR className="text-3xl" />
            </button>
          )} */}
        </Nav>
      </div>
    </div>
  );
}
