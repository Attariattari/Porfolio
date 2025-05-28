import React from "react";
import Logo from "./Logo";
import "../Components/Sidebar/Bar";
import "./Nav.css";
import { Link } from "react-router-dom";

function Nav({ show, children, sections, scrollToSection, setShowNav }) {
  return (
    <div
      className={
        (show ? "right-0 " : "-right-full ") +
        "top-0 z-10 text-gray-100 fixed lg:static md:w-52 h-screen transition-all flex flex-col"
      }
      style={{ maxWidth: "17rem", width: "21em", backgroundColor: "#041230" }}
    >
      {/* Sticky Header */}
      <div
        className="w-full h-44 sticky top-0 flex justify-center items-center z-20"
        style={{ borderBottom: "0.1px solid rgb(157, 154, 154)" }}
      >
        <div className="relative flex justify-center w-full h-full items-center">
          <Logo show={show} />
          {children}
        </div>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col gap-2">
          <div className="flex flex-col gap-7 p-10 text-lg font-extralight">
            <div>
              {sections.map((section) => (
                <div
                  key={`/${section.id}`}
                  onClick={() => {
                    scrollToSection(section.id);
                    setShowNav(false);
                  }}
                  className={`LinkHover ${section.id}Hover`}
                >
                  {section.title}
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
