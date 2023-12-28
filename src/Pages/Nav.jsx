import React from "react";
import Logo from "./Logo";
import "../Components/Sidebar/Bar";
import "./Nav.css";

function Nav({ show, children, sections, scrollToSection }) {
  return (
    <div
      className={
        (show ? "right-0 " : "-right-full ") +
        "top-0 z-10 text-gray-100 fixed lg:static md:w-52 min-h-screen transition-all "
      }
      style={{ maxWidth: "17rem", width: "21em", backgroundColor: "#041230" }}
    >
      <div
        className="w-full h-44  flex justify-center items-center"
        style={{
          borderBottom: "0.1px solid rgb(157, 154, 154)",
        }}
      >
        <div className="mb-4 mr-4 relative">
          <Logo show={show} />
          {children}
        </div>
      </div>

      <nav className="flex flex-col gap-2 overflow-hidden">
        <div className="flex flex-col gap-7 pt-10 pl-10 text-lg font-extralight">
          <div>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`LinkHover space-y-16 ${section.id}Hover`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
