import React, { useEffect, useState } from "react";
import "./Servicepopup.css";
import { ToastContainer, toast } from "react-toastify";
import { useData } from "../../UseContaxt/Datacontaxt";
import SliderComponent from "./SliderComponent";
import { CgCloseR } from "react-icons/cg";
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
              <div className="ImagePopup">
                <img src={info.img} alt="" className="w-full" />
              </div>
              <button
                className="Closeone absolute top-2 right-2"
                onClick={closePopup}
              >
                <CgCloseR className="text-3xl" />
              </button>
            </div>

            {/* Scrollable Content Section */}
            <div className="ScrollableContent overflow-y-auto max-h-[400px]">
              <div className="flex justify-center items-center py-2 font-serif text-xl">
                <div>{info.title}</div>
              </div>
              <div className="p-3 text-center">{info.details}</div>
              <div className="p-3 text-center">{info.detailstwo}</div>
              <div className="p-3 text-center">{info.detailsthree}</div>
              <div className="p-3 text-center">{info.detailsfour}</div>
              <div className="mt-3 p-3 text-center font-bold">
                {info.forhair}
              </div>
              <div className="p-3 FullDetails">
                <button
                  className="Fulldetails"
                  onClick={() => HairFunction(info)}
                >
                  Hair Me
                </button>
                <ToastContainer position="top-right" theme="dark" />
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedNews && (
        <div className="Newspopup font-serif">
          <div className="Newspopupchild">
            <div className="allsliderarea">
              <button
                className="Closeone absolute top-2 right-2"
                onClick={closePopup}
              >
                <CgCloseR className="text-3xl" />
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
