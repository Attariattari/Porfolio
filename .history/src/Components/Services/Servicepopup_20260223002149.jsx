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
    if (info) {
      // Disable scrolling when the popup is open
      document.body.style.overflow = "hidden";
      setScrollDisabled(true);
    } else {
      // Enable scrolling when the popup is closed
      document.body.style.overflow = "auto";
      setScrollDisabled(false);
    }

    // Cleanup function to enable scrolling when the component is unmounted
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [info]);

  const HairFunction = () => {
    if (subject && message) {
      toast.warning("Data already sent. Please wait for a response.");
      return;
    }

    if (info && info.subject && info.message) {
      setSubjectAndMessage(info.subject, info.message);
      closePopup();
      toast.success("Data sent successfully!");

      // Scroll to the Contact section
      const contactSection = document.getElementById("Contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      toast.error("Error sending data. Please try again.");
    }
  };

  const [activeIndex, setActiveIndex] = useState(1);

  // Function to go to the next slide
  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex % 5) + 1);
  };

  // Function to go to the previous slide
  const prevSlide = () => {
    setActiveIndex((prevIndex) => ((prevIndex - 2 + 5) % 5) + 1);
  };

  // Effect to automatically advance the slider every 5 seconds
  useEffect(() => {
    const sliderInterval = setInterval(() => {
      nextSlide();
    }, 5000);

    // Clear the interval on component unmount
    return () => clearInterval(sliderInterval);
  }, [activeIndex]);
  return (
    <div className={`Serviceall ${scrollDisabled ? "scroll-disabled" : ""}`}>
      {info && (
        <div className="Servicepopup" onClick={closePopup}>
          <div
            className="Servicepopupchild"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="Closeone"
              onClick={closePopup}
              aria-label="Close"
            >
              <CgCloseR size={24} />
            </button>

            <div className="popup-header">
              <div className="popup-icon-container">{info.icons}</div>
              <h2 className="popup-title font-serif">{info.title}</h2>
            </div>

            <div className="ScrollableContent">
              <div className="popup-description">{info.description}</div>

              {info.technologies && info.technologies.length > 0 && (
                <div className="tech-section">
                  <h3 className="tech-section-title">Technologies We Use</h3>
                  <div className="tech-grid">
                    {info.technologies.map((tech, index) => (
                      <div key={index} className="tech-item">
                        <span className="tech-check">✔</span>
                        <span>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="cta-container">
                <button
                  className="hire-button"
                  onClick={() => HairFunction(info)}
                >
                  Hire Me Now
                </button>
              </div>
            </div>
          </div>
          <ToastContainer position="top-right" theme="dark" />
        </div>
      )}

      {selectedNews && (
        <div className="Newspopup font-serif">
          <header className="news-header">
            <button className="back-button" onClick={closePopup}>
              <FaArrowLeft />
              <span>Back to Portfolio</span>
            </button>
            <div className="news-section-label">{selectedNews.NewsSection}</div>
            <div style={{ width: "100px" }}></div> {/* Spacer for symmetry */}
          </header>

          <div className="Newspopupchild">
            <div className="news-main-content">
              {/* Intro & Slider */}
              <div className="news-intro-section">
                <h1 className="intro-text-large">
                  {selectedNews.NewsSection} Overview
                </h1>
                <div className="slider-container-news">
                  <SliderComponent selectedNews={selectedNews} />
                </div>
                <div className="chapter-details text-center italic opacity-80 mb-10">
                  {selectedNews.IntroductionTwo}
                </div>
              </div>

              {/* Chapters Flow */}
              <div className="chapters-flow">
                {[
                  { id: 1, data: selectedNews.ChapterOne },
                  { id: 2, data: selectedNews.ChapterTwo },
                  { id: 3, data: selectedNews.Chapterthree },
                  { id: 4, data: selectedNews.Chapterfour },
                  { id: 5, data: selectedNews.Chapterfive },
                  { id: 6, data: selectedNews.Chaptersix },
                  { id: 7, data: selectedNews.Chapterseven },
                  { id: 8, data: selectedNews.Chaptereight },
                  { id: 9, data: selectedNews.Chapternine },
                  { id: 10, data: selectedNews.Chapterten },
                ].map(
                  (chapterSet) =>
                    chapterSet.data &&
                    chapterSet.data.length > 0 && (
                      <div key={chapterSet.id} className="chapter-container">
                        <span className="chapter-badge">
                          Chapter {chapterSet.id}
                        </span>
                        {chapterSet.data.map((chapter, index) => (
                          <div key={index} className="mb-8">
                            <h2 className="chapter-title">{chapter.title}</h2>
                            <div className="chapter-details">
                              {chapter.details}
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                )}
              </div>

              {/* End Section */}
              <footer className="news-footer">
                <div className="chapter-container text-center">
                  <h2 className="chapter-title">Conclusion</h2>
                  <div className="chapter-details mb-10">
                    {selectedNews.end}
                  </div>
                </div>
                <h3 className="footer-thanks">Thanks For Reading! 👍</h3>
                <button className="bottom-back-btn" onClick={closePopup}>
                  Return to Work
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servicepopup;
