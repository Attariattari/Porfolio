import React, { useEffect, useRef } from "react";
import "./About.css";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import Aboutinfo from "./Aboutinfo";
import Aboutsocial from "./Aboutsocial";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AboutAbilities from "./AboutAbilities";
import Aboutmyprogres from "./Aboutmyprogres";
import { Tilt } from "react-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
function About() {
  const [typeEffect] = useTypewriter({
    words: ["UI / UX Designer", "Web Developer", "Web Designer", "Freelancer"],
    loop: {},
    typeSpeed: 150,
    deleteSpeed: 70,
  });
  const [typesome] = useTypewriter({
    words: [
      "ome about my abilities,",
      "ome about my skills,",
      "ome about my experiance,",
      "ome about my works,",
    ],
    loop: {},
    typeSpeed: 150,
    deleteSpeed: 70,
  });
  const handleDownload = () => {
    const pdfUrl =
      "https://smallpdf.com/file#s=4f1a0b1b-a8ed-48b9-9d7f-9997eff7760f/My_new_CV_no_image_hwmaah.pdf";

    toast.promise(
      new Promise((resolve, reject) => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "Document_from_Ghulam_Muhyo_Din.pdf";

        document.body.appendChild(link);

        try {
          link.click();
          resolve("Download started successfully!");
        } catch (error) {
          reject("Error starting download. Please try again.");
        } finally {
          document.body.removeChild(link);
        }
      }),
      {
        pending: "Downloading...",
        success: { render: "Download complete!", autoClose: 3000 },
        error: {
          render: "Download failed. Please try again.",
          autoClose: 3000,
        },
      },
    );
  };

  const defaultOptions = {
    reverse: false, // reverse the tilt direction
    max: 35, // max tilt rotation (degrees)
    perspective: 1000, // Transform perspective, the lower the more extreme the tilt gets.
    scale: 1, // 2 = 200%, 1.5 = 150%, etc..
    speed: 1000, // Speed of the enter/exit transition
    transition: true, // Set a transition on enter/exit.
    axis: null, // What axis should be disabled. Can be X or Y.
    reset: true, // If the tilt effect has to be reset on exit.
    easing: "cubic-bezier(.03,.98,.52,.99)", // Easing on enter/exit.
  };

  const haireme = () => {
    const contactSection = document.getElementById("Contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <div className="About" id="About">
      <div className="AboutHeader_Premium" data-aos="fade-up">
        <div className="HeaderBadge">
          <span className="BadgeText">Introduction</span>
        </div>
        <div className="HeaderTitleWrapper">
          <h2 className="PremiumTitle">
            About <span className="PremiumHighlight">Me</span>
          </h2>
          <div className="TitleDecoration">
            <span className="DecorLine"></span>
            <span className="DecorDot"></span>
            <span className="DecorLine Long"></span>
          </div>
        </div>
        <p className="PremiumSubtitle">
          Crafting modern digital experiences with a focus on impact,
          innovation, and user-centric design. Discover my journey and
          expertise.
        </p>
      </div>

      <div className="mainsection">
        <div className="AboutImage">
          <Tilt className="Tilt" options={defaultOptions}>
            <div className="ImageSet">
              <div className="ImageShow">
                <img
                  src="https://res.cloudinary.com/dg5gwixf1/image/upload/fl_preserve_transparency/v1748354790/1743698252144_lcwpsq.jpg?_s=public-apps"
                  alt="Ghulam Muhyo Din"
                />
              </div>
            </div>
          </Tilt>
        </div>

        <div className="aboutinfo">
          <Aboutinfo typeEffect={typeEffect} Cursor={Cursor} />
          <Aboutsocial />

          <div className="buttonsection">
            <button onClick={handleDownload} className="Aboutdownhirebtn">
              Download CV
            </button>
            <button className="Aboutdownhirebtn" onClick={haireme}>
              Hire Me
            </button>
          </div>
          <ToastContainer position="top-right" theme="dark" />
        </div>
      </div>

      <div className="aboutmyAbilities">
        <div className="Aboutsome">
          <AboutAbilities
            typesome={typesome}
            Cursor={Cursor}
            typeEffect={typeEffect}
          />
        </div>
        <div className="aboutcharts">
          <div className="Aboutchartsglassy">
            <Aboutmyprogres />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
