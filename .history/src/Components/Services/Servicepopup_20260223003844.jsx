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
            {/* Visual Panel (Left) */}
            <div className="modal-visual-side">
              <div className="modal-icon-container">{info.icons}</div>
              <h2 className="font-serif">{info.title}</h2>
              <div className="mt-4 opacity-60 text-sm">PREMIUM SERVICE</div>
            </div>

            {/* Content Panel (Right) */}
            <div className="modal-content-side">
              <button
                className="modal-close-btn"
                onClick={closePopup}
                aria-label="Close"
              >
                <CgCloseR size={24} />
              </button>

              <div className="modal-scroll-area">
                <p className="modal-description">{info.description}</p>

                {info.technologies && info.technologies.length > 0 && (
                  <div className="tech-section">
                    <h4 className="text-xs font-bold tracking-widest text-orange-500 mb-4 uppercase">
                      Core Stack
                    </h4>
                    <div className="tech-tag-container">
                      {info.technologies.map((tech, index) => (
                        <span key={index} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="modal-cta-btn"
                  onClick={() => HairFunction(info)}
                >
                  Start a Project
                </button>
              </div>
            </div>
          </div>
          <ToastContainer position="top-right" theme="dark" />
        </div>
      )}

      {selectedNews && (
        <div className="Newspopup font-serif">
          {/* Navigation Bar */}
          <nav className="news-nav-bar">
            <button className="news-back-btn" onClick={closePopup}>
              <FaArrowLeft /> Back to Works
            </button>
            <div className="text-orange-500 font-black tracking-tighter text-xl">
              DETAIL VIEW
            </div>
            <div className="w-10"></div>
          </nav>

          {/* Article Body */}
          <div className="news-content-body">
            <article className="article-container">
              <div className="article-hero">
                <div className="text-orange-500 font-bold mb-4 uppercase tracking-widest text-sm">
                  {selectedNews.NewsSection}
                </div>
                <h1>{selectedNews.NewsSection}</h1>
                <div className="article-banner">
                  <SliderComponent selectedNews={selectedNews} />
                </div>
                <p className="chapter-text italic text-center mx-auto opacity-70">
                  {selectedNews.IntroductionTwo}
                </p>
              </div>

              {/* Dynamic Chapters Rendering */}
              {[
                { label: "Chapter 1", content: selectedNews.ChapterOne },
                { label: "Chapter 2", content: selectedNews.ChapterTwo },
                { label: "Chapter 3", content: selectedNews.Chapterthree },
                { label: "Chapter 4", content: selectedNews.Chapterfour },
                { label: "Chapter 5", content: selectedNews.Chapterfive },
                { label: "Chapter 6", content: selectedNews.Chaptersix },
                { label: "Chapter 7", content: selectedNews.Chapterseven },
                { label: "Chapter 8", content: selectedNews.Chaptereight },
                { label: "Chapter 9", content: selectedNews.Chapternine },
                { label: "Chapter 10", content: selectedNews.Chapterten },
              ].map(
                (chapter, idx) =>
                  chapter.content &&
                  chapter.content.length > 0 && (
                    <section key={idx} className="chapter-section">
                      <div className="chapter-number">0{idx + 1}</div>
                      {chapter.content.map((item, i) => (
                        <div key={i}>
                          <h2 className="chapter-title">{item.title}</h2>
                          <div className="chapter-text">{item.details}</div>
                        </div>
                      ))}
                    </section>
                  ),
              )}

              <footer className="article-footer">
                <div className="max-w-xl mx-auto mb-10">
                  <h2 className="text-3xl font-black mb-4">In Conclusion</h2>
                  <p className="chapter-text text-center mx-auto">
                    {selectedNews.end}
                  </p>
                </div>
                <button className="footer-btn" onClick={closePopup}>
                  Close Article
                </button>
              </footer>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servicepopup;
