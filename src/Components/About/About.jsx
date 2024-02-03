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
    const pdfUrl = "https://orange-cristin-19.tiiny.site/";

    toast.promise(
      new Promise((resolve, reject) => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "Document_from_Ghulam_Muhyo_Din.pdf"; // specify the filename
        link.target = "_blank"; // open in a new tab or window
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
      }
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

  return (
    <div className="About">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">ABOUT ME</div>
          <div className="text-lg">Main informations about me</div>
        </div>
      </div>
      <div className="mainsection">
        <div className="AboutImage">
          <div>
            <Tilt className="Tilt" options={defaultOptions}>
              <div className="ImageSet">
                <div className="ImageShow">
                  <img
                    className=""
                    src="https://i.postimg.cc/fTtMpFwj/1706786499282.jpg"
                    alt=""
                  />
                </div>
              </div>{" "}
            </Tilt>
          </div>
        </div>

        <div className="aboutinfo">
          <Aboutinfo typeEffect={typeEffect} Cursor={Cursor} />
          <Aboutsocial />
          <div className="buttonsection mt-4">
            <button
              onClick={handleDownload}
              className="w-44 px-2 py-3 Aboutdownhirebtn rounded-sm"
            >
              Download cv
            </button>
            <ToastContainer position="top-right" theme="dark" />

            <button
              className="w-44 px-2 py-3 Aboutdownhirebtn rounded-sm"
              onClick={haireme}
            >
              Hire me
            </button>
          </div>
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
