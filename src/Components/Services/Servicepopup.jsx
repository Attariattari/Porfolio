import React, { useEffect, useState } from "react";
import "./Servicepopup.css";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Contact from "../Contact/Contact";
import { ToastContainer, toast } from "react-toastify";
import { useData } from "../../UseContaxt/Datacontaxt";

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
            <div className="Header text-white sticky top-0">
              <div>{info.title}</div>
              <button className="Close" onClick={closePopup}>
                <IoIosCloseCircleOutline className="text-3xl Closeicon" />
              </button>
            </div>
            <div className="ImagePopup">
              <img src={info.img} alt="" />
            </div>

            <div className="p-3">{info.details}</div>
            <div className="p-3">{info.detailstwo}</div>
            <div className="p-3">{info.detailsthree}</div>
            <div className="p-3">{info.detailsfour}</div>
            <div className="mt-3 p-3 font-bold">{info.forhair}</div>
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
      )}
      {selectedNews && (
        <div className="Newspopup font-serif">
          <div className="Newspopupchild">
            <div className="allsliderarea">
              <div className="slidernews">
                <div
                  id="gallery"
                  className="relative w-full"
                  data-carousel="slide"
                >
                  <div className="relative h-96 overflow-hidden rounded-lg md:h-96">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className={`duration-700 ease-in-out transition-opacity ${
                          activeIndex === index ? "opacity-100" : "opacity-0"
                        }`}
                        data-carousel-item={
                          activeIndex === index ? "active" : undefined
                        }
                      >
                        <img
                          src={`https://flowbite.s3.amazonaws.com/docs/gallery/square/image-${index}.jpg`}
                          className="absolute block max-w-full h-auto -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 opacity-100"
                          alt=""
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                    data-carousel-prev
                    onClick={prevSlide}
                  >
                    <span>&lt; Previous</span>
                  </button>
                  <button
                    type="button"
                    className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                    data-carousel-next
                    onClick={nextSlide}
                  >
                    <span>Next &gt;</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Introduction:</div>
              <div className="introtwo">{selectedNews.IntroductionTwo}</div>
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 1:</div>
              {selectedNews.ChapterOne.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 2:</div>
              {selectedNews.ChapterTwo.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 3:</div>
              {selectedNews.Chapterthree.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 4:</div>
              {selectedNews.Chapterfour.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 5:</div>
              {selectedNews.Chapterfive.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 6:</div>
              {selectedNews.Chaptersix.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 7:</div>
              {selectedNews.Chapterseven.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 8:</div>
              {selectedNews.Chaptereight.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 9:</div>
              {selectedNews.Chapternine.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">Chapter 10:</div>
              {selectedNews.Chapterten.map((chapter, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center flex-col"
                >
                  <div className="font-serif text-2xl">{chapter.title}.</div>
                  <div className="introtwo">{chapter.details}</div>
                </div>
              ))}
            </div>
            <div className="mainintro">
              <div className="font-serif text-3xl">By The End Of Guide:</div>
              <div className="introtwo">{selectedNews.end}</div>
            </div>
            <div className="mainintro">
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
{
  /*  */
}
