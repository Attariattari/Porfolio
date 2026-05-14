import React, { useEffect, useState } from "react";
import "./Servicepopup.css";
import { ToastContainer, toast } from "react-toastify";
import { useData } from "../../UseContaxt/Datacontaxt";
import SliderComponent from "./SliderComponent";
import { CgClose } from "react-icons/cg";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";

function Servicepopup({ info, closePopup, selectedNews }) {
  const { setSubjectAndMessage, subject, message } = useData();
  const [scrollDisabled, setScrollDisabled] = useState(false);

  useEffect(() => {
    if (info || selectedNews) {
      document.body.style.overflow = "hidden";
      setScrollDisabled(true);
    } else {
      document.body.style.overflow = "auto";
      setScrollDisabled(false);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [info, selectedNews]);

  const HireFunction = () => {
    if (subject && message) {
      toast.warning("Data already sent. Please wait for a response.");
      return;
    }

    if (info && info.subject && info.message) {
      setSubjectAndMessage(info.subject, info.message);
      closePopup();
      toast.success("Data sent successfully!");

      const contactSection = document.getElementById("Contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      toast.error("Error sending data. Please try again.");
    }
  };

  return (
    <div className={`Serviceall ${scrollDisabled ? "scroll-disabled" : ""}`}>
      {info && (
        <div className="Servicepopup" onClick={closePopup}>
          <div
            className="Servicepopupchild"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="PopupHeader">
              <button className="Closeone" onClick={closePopup}>
                <CgClose size={20} />
              </button>
              <div className="IconWrapper">{info.icons}</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {info.title}
              </h2>
              <div className="w-12 h-1 bg-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="ScrollableContent">
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed text-lg mb-8">
                {info.description}
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
                  Technologies I Use
                </h3>
                <div className="TechGrid">
                  {info.technologies.map((tech, index) => (
                    <div key={index} className="TechItem">
                      <FaCheckCircle className="text-orange-500" />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="HireBtn" onClick={() => HireFunction(info)}>
                Hire Me for this Project
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedNews && (
        <div className="Newspopup">
          <div className="Newspopupchild">
            <button className="BackButton" onClick={closePopup}>
              <FaArrowLeft />
              <span>Back to Articles</span>
            </button>

            <div className="NewsContent">
              <div className="NewsSectionHeader">
                <span className="text-orange-500 font-semibold tracking-wider uppercase text-sm">
                  Insights & Guides
                </span>
                <h1 className="font-serif">{selectedNews.NewsSection}</h1>
                <div className="w-20 h-1.5 bg-orange-500 mx-auto mt-4 rounded-full"></div>
              </div>

              <div className="SliderContainer">
                <SliderComponent selectedNews={selectedNews} />
              </div>

              <div className="ChapterBlock">
                <h2 className="ChapterTitle">Introduction</h2>
                <div className="ChapterDetails">
                  {selectedNews.IntroductionTwo}
                </div>
              </div>

              {[
                { key: "ChapterOne", label: "Chapter 1" },
                { key: "ChapterTwo", label: "Chapter 2" },
                { key: "Chapterthree", label: "Chapter 3" },
                { key: "Chapterfour", label: "Chapter 4" },
                { key: "Chapterfive", label: "Chapter 5" },
                { key: "Chaptersix", label: "Chapter 6" },
                { key: "Chapterseven", label: "Chapter 7" },
                { key: "Chaptereight", label: "Chapter 8" },
                { key: "Chapternine", label: "Chapter 9" },
                { key: "Chapterten", label: "Chapter 10" },
              ].map(
                (chapterInfo) =>
                  selectedNews[chapterInfo.key] &&
                  selectedNews[chapterInfo.key].length > 0 && (
                    <div key={chapterInfo.key} className="ChapterBlock">
                      <h2 className="ChapterTitle">{chapterInfo.label}</h2>
                      {selectedNews[chapterInfo.key].map((item, idx) => (
                        <div key={idx} className="mb-6">
                          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                            {item.title}
                          </h3>
                          <div className="ChapterDetails">{item.details}</div>
                        </div>
                      ))}
                    </div>
                  ),
              )}

              <div className="ChapterBlock border-orange-500 bg-orange-50 dark:bg-zinc-800/50 p-6 rounded-2xl">
                <h2 className="ChapterTitle">Conclusion</h2>
                <div className="ChapterDetails font-medium">
                  {selectedNews.end}
                </div>
              </div>

              <div className="text-center mt-12 mb-8">
                <p className="text-2xl font-serif text-gray-400 dark:text-gray-600">
                  Thanks for reading. 👍
                </p>
                <button
                  className="HireBtn mt-8 max-w-xs mx-auto"
                  onClick={closePopup}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
}

export default Servicepopup;
