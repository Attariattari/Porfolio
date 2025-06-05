import Logo from "./Logo";
import "../Components/Sidebar/Bar";
import "./Nav.css";
import { useState } from "react";
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5";

function Nav({
  children,
  sections,
  closeIconStyle,
  openIconStyle,
  scrollToSection,
  setShowNav,
  activeSection,
}) {
  const [navshow, setNavShow] = useState(() => {
    const saved = localStorage.getItem("sidebar_nav_show");
    return saved === null ? true : JSON.parse(saved);
  });

  const openNav = () => {
    setNavShow(true);
    localStorage.setItem("sidebar_nav_show", true);
  };

  const closeNav = () => {
    setNavShow(false);
    localStorage.setItem("sidebar_nav_show", false);
  };

  return (
    <div
      className={
        "top-0 z-10 text-gray-100 fixed lg:static h-screen transition-all flex flex-col" +
        (navshow ? " w-[18em]" : " w-[10em]")
      }
      style={{
        maxWidth: navshow ? "17rem" : "10em",
        backgroundColor: "#041230",
      }}
    >
      {/* Sticky Header */}
      <div
        className="w-full h-44 sticky top-0 flex justify-center items-center z-20"
        style={{ borderBottom: "0.1px solid rgb(157, 154, 154)" }}
      >
        <div className="relative flex justify-center w-full h-full items-center">
          <Logo show={navshow} />
          {children}

          {/* Toggle Buttons (you can replace these with icons) */}
          {!navshow && (
            <button
              onClick={openNav}
              className="absolute right-2 top-2   rounded"
            >
              <IoCloseOutline size={28} />
            </button>
          )}
          {navshow && (
            <button
              onClick={closeNav}
              className="absolute right-2 top-2   rounded"
            >
              <IoMenuOutline size={28} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col gap-2">
          <div
            className={`flex flex-col ${
              navshow ? "gap-7 p-10" : "gap-4 p-4"
            } text-lg font-extralight`}
          >
            <div>
              {sections.map((section) => (
                <div
                  key={`/${section.id}`}
                  onClick={() => {
                    scrollToSection(section.id);
                    setShowNav(false);
                  }}
                  className={`LinkHover ${
                    section.id
                  }Hover flex items-center transition-all duration-300 cursor-pointer ${
                    navshow ? "justify-start gap-2" : "justify-center"
                  } ${
                    activeSection === section.id
                      ? "font-bold"
                      : "text-gray-100 font-normal"
                  }`}
                  style={{
                    color: activeSection === section.id ? "#e3882d" : undefined,
                  }}
                >
                  <div
                    title={section.title}
                    style={!navshow ? closeIconStyle : openIconStyle}
                  >
                    {section.icon}
                  </div>
                  {navshow && <div>{section.title}</div>}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Nav;
