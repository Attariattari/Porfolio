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
        <div className="Servicepopup">
          <div className="Servicepopupchild">
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-10 bg-white shadow-md">
              <div className="flex flex-col items-center text-center gap-2 py-4 border-b border-gray-300 dark:border-zinc-700">
                <div className="text-4xl" style={{ color: "#e3872d" }}>
                  {info.icons}
                </div>
                <h2
                  className="text-2xl font-semibold font-serif"
                  style={{ color: "#e3872d" }}
                >
                  {info.title}
                </h2>
              </div>
              <button
                className="Closeone absolute top-2 right-2"
                onClick={closePopup}
              >
                <CgCloseR className="text-3xl" />
              </button>
            </div>

            {/* Scrollable Content Section */}
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
          {/* Top Navbar */}
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

                <p className="section-content italic opacity-60 max-w-3xl mx-auto">
                  {selectedNews.IntroductionTwo}
                </p>
                  <div className="font-serif text-2xl pb-2">
                    {chapter.title}.
                  </div>
                  <div className="introtwo text-center">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Chapter 4:</div>
              {selectedNews.Chapterfour.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl pb-2">
                    {chapter.title}.
                  </div>
                  <div className="introtwo text-center">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Chapter 5:</div>
              {selectedNews.Chapterfive.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl pb-2">
                    {chapter.title}.
                  </div>
                  <div className="introtwo text-center">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Chapter 6:</div>
              {selectedNews.Chaptersix.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl pb-2">
                    {chapter.title}.
                  </div>
                  <div className="introtwo text-center">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Chapter 7:</div>
              {selectedNews.Chapterseven.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl pb-2">
                    {chapter.title}.
                  </div>
                  <div className="introtwo text-center">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Chapter 8:</div>
              {selectedNews.Chaptereight.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl pb-2">
                    {chapter.title}.
                  </div>
                  <div className="introtwo text-center">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Chapter 9:</div>
              {selectedNews.Chapternine.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl pb-2">
                    {chapter.title}.
                  </div>
                  <div className="introtwo text-center">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Chapter 10:</div>
              {selectedNews.Chapterten.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl pb-2">
                    {chapter.title}.
                  </div>
                  <div className="introtwo text-center">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">By The End Of Guide:</div>
              <div className="introtwo text-center">{selectedNews.end}</div>
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Thanks For Read. 👍</div>
            </div>
            <div className="goback">
              <button className="Go-Back" onClick={closePopup}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servicepopup;
