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
        <div className="Servicepopup" onClick={closePopup}>
          <div
            className="Servicepopupchild"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-inner-content">
              <button
                className="modal-close-btn"
                onClick={closePopup}
                aria-label="Close"
              >
                <CgCloseR size={24} />
              </button>

              <header className="modal-heading-group">
                <div className="icon-glow-container">{info.icons}</div>
                <h2 className="font-serif">{info.title}</h2>
              </header>

              <div className="modal-body-content">
                <p className="modal-description-text">{info.description}</p>

                {info.technologies && info.technologies.length > 0 && (
                  <div className="tech-cloud">
                    {info.technologies.map((tech, index) => (
                      <span key={index} className="tech-bubble">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  className="aurora-btn"
                  onClick={() => HairFunction(info)}
                >
                  Confirm Interest
                </button>
              </div>
            </div>
          </div>
          <ToastContainer position="top-right" theme="dark" />
        </div>
      )}

      {selectedNews && (
        <div className="Newspopup font-serif">
          <nav className="news-top-nav">
            <button className="neon-back-btn" onClick={closePopup}>
              <FaArrowLeft /> DISMISS
            </button>
            <div className="hidden md:block text-slate-500 font-mono text-xs tracking-[10px]">
              AURORA PROJECT SYSTEM
            </div>
            <div className="w-20"></div>
          </nav>

          <div className="news-main-scroll">
            <div className="news-article-wrap">
              <header className="news-title-hero">
                <span className="news-tagline">{selectedNews.NewsSection}</span>
                <h1>{selectedNews.NewsSection}</h1>

                <div className="news-slider-housing">
                  <SliderComponent selectedNews={selectedNews} />
                </div>

                <p className="section-content italic opacity-60 max-w-3xl mx-auto text-center">
                  {selectedNews.IntroductionTwo}
                </p>
              </header>

              {[
                { label: "01", content: selectedNews.ChapterOne },
                { label: "02", content: selectedNews.ChapterTwo },
                { label: "03", content: selectedNews.Chapterthree },
                { label: "04", content: selectedNews.Chapterfour },
                { label: "05", content: selectedNews.Chapterfive },
                { label: "06", content: selectedNews.Chaptersix },
                { label: "07", content: selectedNews.Chapterseven },
                { label: "08", content: selectedNews.Chaptereight },
                { label: "09", content: selectedNews.Chapternine },
                { label: "10", content: selectedNews.Chapterten },
              ].map(
                (chapter, idx) =>
                  chapter.content &&
                  chapter.content.length > 0 && (
                    <section key={idx} className="section-block">
                      <div className="section-label">
                        SECTION {chapter.label}
                      </div>
                      {chapter.content.map((item, i) => (
                        <div key={i}>
                          <h2 className="section-title">{item.title}</h2>
                          <div className="section-content">{item.details}</div>
                        </div>
                      ))}
                    </section>
                  ),
              )}

              <footer className="article-finisher">
                <h3 className="text-4xl font-black text-white mb-6">
                  Bottom Line
                </h3>
                <p className="section-content mb-12">{selectedNews.end}</p>
                <button className="aurora-btn" onClick={closePopup}>
                  Got It
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
