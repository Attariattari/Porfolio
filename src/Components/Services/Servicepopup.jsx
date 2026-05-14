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
            <div className="ScrollableContent overflow-y-auto max-h-[400px] p-4 rounded-md shadow-lg bg-white dark:bg-zinc-900">
              {/* Icon & Title */}
              

              {/* Description */}
              <div className="mt-4 text-center text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 px-2">
                {info.description}
              </div>

              {/* Technologies Section */}
              <div className="mt-6 px-2">
                <h3
                  className="text-lg font-semibold mb-2 text-center"
                  style={{ color: "#e3872d" }}
                >
                  Technologies We Use
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {info.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm font-medium bg-orange-50 dark:bg-zinc-800 px-3 py-2 rounded-md"
                    >
                      <span className="text-xl" style={{ color: "#e3872d" }}>
                        ✔
                      </span>
                      <span style={{ color: "#e3872d" }}>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6 flex justify-center">
                <button
                  className="px-6 py-2 rounded-md font-semibold shadow transition duration-200"
                  style={{
                    backgroundColor: "#e3872d",
                    color: "white",
                  }}
                  onClick={() => HairFunction(info)}
                >
                  Hire Me
                </button>
              </div>

              <ToastContainer position="top-right" theme="dark" />
            </div>
          </div>
        </div>
      )}

      {selectedNews && (
        <div className="Newspopup font-serif">
          <div className="Newspopupchild">
            <div className="allsliderarea">
              <button
                className="absolute top-2 left-2 flex space-x-2 justify-center items-center"
                onClick={closePopup}
              >
                <FaArrowLeft className="text-1xl " />
                <p className="" style={{ fontSize: "11px" }}>
                  Back
                </p>
              </button>
              <div
                className="text-3xl"
                style={{
                  borderBottom: "3px solid #E3872D",
                }}
              >
                {selectedNews.NewsSection}.
              </div>
              <div className="slidernews">
                <SliderComponent selectedNews={selectedNews} />
              </div>
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Introduction:</div>
              <div className="introtwo text-center">
                {selectedNews.IntroductionTwo}
              </div>
            </div>
            <div className="mainintro text-center">
              <div className="font-serif text-3xl">Chapter 1:</div>
              {selectedNews.ChapterOne.map((chapter, index) => (
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
              <div className="font-serif text-3xl">Chapter 2:</div>
              {selectedNews.ChapterTwo.map((chapter, index) => (
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
              <div className="font-serif text-3xl">Chapter 3:</div>
              {selectedNews.Chapterthree.map((chapter, index) => (
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
