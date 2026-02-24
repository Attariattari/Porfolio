import Logo from "./Logo";
import "../Components/Sidebar/Bar";
import "./Nav.css";
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5";
import { useEffect } from "react";

function Nav({
  children,
  sections,
  closeIconStyle,
  openIconStyle,
  scrollToSection,
  setShowNav,
  activeSection,
  show,
  isMobile,
}) {
  const closeNav = () => setShowNav(false);
  const openNav = () => setShowNav(true);
  // ✅ Automatically open nav if isMobile is true
  useEffect(() => {
    if (isMobile) {
      setShowNav(false);
    }
  }, [isMobile]);
  return (
    <div
      className={
        "top-0 z-10 text-gray-100 fixed lg:static h-screen transition-all flex flex-col" +
        (show
          ? isMobile
            ? " w-[10em]" // Mobile open: icons only
            : " w-[18em]" // Desktop open: full
          : isMobile
          ? " w-0 overflow-hidden" // Mobile closed: fully hidden
          : " w-[10em]") // Desktop closed: icons only ✅
      }
      style={{
        maxWidth: show
          ? isMobile
            ? "10em"
            : "17rem"
          : isMobile
          ? "0"
          : "10em", // Desktop closed: 10em sidebar ✅
        backgroundColor: "#041230",
      }}
    >
      {/* Header */}
      <div
        className="w-full h-44 sticky top-0 flex justify-center items-center z-20"
        style={{ borderBottom: "0.1px solid rgb(157, 154, 154)" }}
      >
        <div className="relative flex justify-center w-full h-full items-center">
          <Logo show={show} />
          {children}

          {/* Buttons only on mobile */}

          <>
            {show ? (
              <button
                onClick={closeNav}
                className="absolute right-2 top-2 rounded"
              >
                <IoCloseOutline size={28} />
              </button>
            ) : (
              <button
                onClick={openNav}
                className="absolute right-2 top-2 rounded"
              >
                <IoMenuOutline size={28} />
              </button>
            )}
          </>
        </div>
      </div>
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col gap-2">
          <div
            className={`flex flex-col ${
              show ? "gap-7 p-10" : "gap-4 p-4"
            } text-lg font-extralight`}
          >
            <div>
              {sections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id);
                    if (isMobile) closeNav();
                  }}
                  className={`LinkHover flex items-center min-h-[2rem] transition-all duration-300 cursor-pointer ${
                    show
                      ? isMobile
                        ? "justify-center"
                        : "justify-start gap-2"
                      : "justify-center"
                  } ${
                    activeSection === section.id
                      ? "font-bold text-[#e3882d]"
                      : "text-gray-100 font-normal"
                  }`}
                >
                  <div
                    title={section.title}
                    style={show ? openIconStyle : closeIconStyle}
                  >
                    {section.icon}
                  </div>
                  {!isMobile && show && <div>{section.title}</div>}
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
