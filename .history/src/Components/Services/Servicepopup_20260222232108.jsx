import React, { useEffect, useState } from "react";
import "./Servicepopup.css";
import { ToastContainer, toast } from "react-toastify";
import { useData } from "../../UseContaxt/Datacontaxt";
import SliderComponent from "./SliderComponent";
import { CgCloseR } from "react-icons/cg";
import { FaArrowLeft } from "react-icons/fa6";
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

  const HairFunction = () => {
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
        <div className="Servicepopup-overlay" onClick={closePopup}>
          <div className="Servicepopup-content shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header Section */}
            <div className="Servicepopup-header">
              <div className="icon-wrapper">
                <div className="main-icon text-5xl">
                  {info.icons}
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mt-4">
                {info.title}
              </h2>
              <button
                className="close-btn"
                onClick={closePopup}
                aria-label="Close popup"
              >
                <CgCloseR />
              </button>
            </div>

            {/* Scrollable Body Section */}
            <div className="Servicepopup-body custom-scrollbar">
              {/* Description */}
              <div className="description-section">
                {info.description}
              </div>

              {/* Technologies Section */}
              <div className="tech-section">
                <h3 className="tech-title">
                  Technologies I Use
                </h3>
                <div className="tech-grid">
                  {info.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="tech-item"
                    >
                      <span className="dot"></span>
                      <span className="tech-name">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Section */}
              <div className="action-section">
                <button
                  className="hire-me-btn"
                  onClick={() => HairFunction(info)}
                >
                  <span className="btn-text">Interested? Hire Me Now</span>
                  <div className="btn-glow"></div>
                </button>
              </div>

              <ToastContainer position="top-right" theme="dark" />
            </div>
          </div>
        </div>
      )}

      {selectedNews && (
        <div className="Newspopup-overlay font-serif" onClick={closePopup}>
          <div className="Newspopup-content shadow-2xl custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="news-nav sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-20 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
               <button
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
                onClick={closePopup}
              >
                <FaArrowLeft />
                <span className="text-sm font-medium">Back to Portfolio</span>
              </button>
              <div className="text-xl font-bold border-b-2 border-orange-500">
                {selectedNews.NewsSection}
              </div>
            </div>

            <div className="news-body p-6">
              <div className="slider-container mb-12">
                <SliderComponent selectedNews={selectedNews} />
              </div>

              <div className="news-text-content">
                <section className="story-section mb-12">
                  <h2 className="text-4xl font-serif mb-6 text-center">Introduction</h2>
                  <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 text-center max-w-3xl mx-auto">
                    {selectedNews.IntroductionTwo}
                  </div>
                </section>

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((chapterNum) => {
                  const key = `Chapter${chapterNum === 1 ? 'One' : 
                                chapterNum === 2 ? 'Two' : 
                                chapterNum === 3 ? 'three' : 
                                chapterNum === 4 ? 'four' : 
                                chapterNum === 5 ? 'five' : 
                                chapterNum === 6 ? 'six' : 
                                chapterNum === 7 ? 'seven' : 
                                chapterNum === 8 ? 'eight' : 
                                chapterNum === 9 ? 'nine' : 'ten'}`;
                  const chapters = selectedNews[key];
                  if (!chapters) return null;
                  
                  return (
                    <section key={key} className="story-section mb-12">
                      <h2 className="text-4xl font-serif mb-6 text-center">Chapter {chapterNum}</h2>
                      {chapters.map((chapter, index) => (
                        <div key={index} className="chapter-box mb-8 text-center max-w-3xl mx-auto">
                          <h3 className="text-2xl font-serif mb-3 text-orange-500 italic">{chapter.title}</h3>
                          <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{chapter.details}</div>
                        </div>
                      ))}
                    </section>
                  );
                })}

                <section className="story-conclusion mt-16 text-center">
                  <h2 className="text-3xl font-serif mb-6 italic text-orange-600">The Takeaway</h2>
                  <div className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 mb-12 max-w-3xl mx-auto font-serif">
                    {selectedNews.end}
                  </div>
                  <div className="text-5xl mb-12">✨ 🏆 ✨</div>
                </section>
              </div>

              <div className="flex justify-center mt-8 pb-12">
                <button className="back-btn-large" onClick={closePopup}>
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servicepopup;
    </div>
  );
}

export default Servicepopup;
