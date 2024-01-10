import React from "react";
import "./About.css";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import Aboutinfo from "./Aboutinfo";
import Aboutsocial from "./Aboutsocial";
import { Link, Outlet } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AboutAbilities from "./AboutAbilities";
import Aboutmyprogres from "./Aboutmyprogres";


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
  const handleDownload = async () => {
    toast.promise(
      new Promise((resolve, reject) => {
        const link = document.createElement("a");
        link.href = "../../../public/Document from Ghulam Muhyo Din.pdf"; // Replace with the actual path to your CV file
        link.download = "Document from Ghulam Muhyo Din.pdf"; // Specify the desired file name

        document.body.appendChild(link);
        console.log(resolve);
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
  return (
    <div className="About">
      <div className="mainborder">
        <div className="Aboutborder">
          <div className="text-zinc-800 Aboutme">ABOUT ME</div>
          <div className="text-base">Main informations about me</div>
        </div>
      </div>
      <div className="mainsection">
        <div className="AboutImage">
          <div className="ImageSet">
            <div className="ImageShow">
              <img
                className=""
                src="https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?cs=srgb&dl=pexels-bess-hamiti-35537.jpg&fm=jpg"
                alt=""
              />
            </div>
          </div>
        </div>
        <div className="aboutinfo">
          <Aboutinfo typeEffect={typeEffect} Cursor={Cursor} />
          <Aboutsocial />
          <div className="buttonsection mt-4">
            <button
              onClick={handleDownload}
              className="w-44 px-2 py-3 Aboutdownhirebtn rounded-sm shadow-lg shadow-black"
            >
              Download cv
            </button>
            <ToastContainer position="top-right" theme="dark" />
            <Link to="/Contact">
              <button className="w-44 px-2 py-3 Aboutdownhirebtn rounded-sm shadow-lg shadow-black">
                Hire me
              </button>
            </Link>
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
          <Aboutmyprogres /></div>
        </div> 
      </div>
    </div>
  );
}

export default About;
