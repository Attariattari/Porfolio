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
    words: [
      "UI / UX Designer",
      "Web Developer",
      "Digital Architect",
      "Tech Visionary",
    ],
    loop: {},
    typeSpeed: 100,
    deleteSpeed: 60,
  });

  const [typesome] = useTypewriter({
    words: [
      "ome about my abilities,",
      "ome about my skills,",
      "ome about my experiance,",
      "ome about my works,",
    ],
    loop: {},
    typeSpeed: 100,
    deleteSpeed: 60,
  });

  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: false,
    });
  }, []);

  const handleDownload = () => {
    const pdfUrl =
      "https://smallpdf.com/file#s=4f1a0b1b-a8ed-48b9-9d7f-9997eff7760f/My_new_CV_no_image_hwmaah.pdf";

    toast.promise(
      new Promise((resolve, reject) => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "Ghulam_Muhyo_Din_CV.pdf";
        document.body.appendChild(link);
        try {
          link.click();
          resolve("Download initiated!");
        } catch (e) {
          reject("Download failed!");
        } finally {
          document.body.removeChild(link);
        }
      }),
      {
        pending: "Preparing CV...",
        success: "CV Downloaded!",
        error: "Download failed.",
      },
    );
  };

  const defaultOptions = {
    reverse: false,
    max: 25,
    perspective: 1000,
    scale: 1.05,
    speed: 1000,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
  };

  const haireme = () => {
    const contactSection = document.getElementById("Contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="About" id="About">
      {/* Aurora Modern Header */}
      <div className="AboutHeader_modern">
        <div className="HeaderBadge">
          <span className="BadgeLine"></span>
          <span className="BadgeText">MUHYO IDENTITY</span>
          <span className="BadgeLine"></span>
        </div>
        <h2 className="HeaderTitle">
          The Story <span className="GradientText">Behind The Code</span>
        </h2>
        <div className="HeaderDivider">
          <div className="Dot"></div>
          <div className="Line"></div>
          <div className="Dot"></div>
        </div>
      </div>

      <div className="mainsection">
        <div className="AboutImage" data-aos="fade-right">
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

        <div className="aboutinfo" data-aos="fade-left">
          <Aboutinfo typeEffect={typeEffect} Cursor={Cursor} />
          <Aboutsocial />

          <div className="buttonsection">
            <button onClick={handleDownload} className="Aboutdownhirebtn">
              Export CV <span>↓</span>
            </button>
            <button className="Aboutdownhirebtn" onClick={haireme}>
              Hire Me
            </button>
          </div>
          <ToastContainer position="bottom-right" theme="dark" />
        </div>
      </div>

      <div className="aboutmyAbilities">
        <div className="Aboutsome" data-aos="fade-up">
          <AboutAbilities
            typesome={typesome}
            Cursor={Cursor}
            typeEffect={typeEffect}
          />
        </div>
        <div className="aboutcharts" data-aos="fade-up" data-aos-delay="200">
          <Aboutmyprogres />
        </div>
      </div>
    </div>
  );
}

export default About;
