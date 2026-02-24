import React from "react";
import "./Home.css";
import { useTypewriter, Cursor } from "react-simple-typewriter";

function Home() {
  const [typeEffect] = useTypewriter({
    words: [
      "UI / UX Designer",
      "Full Stack Dev",
      "Digital Architect",
      "Brand Strategist",
    ],
    loop: {},
    typeSpeed: 80,
    deleteSpeed: 50,
  });

  return (
    <div className="Home">
      <div className="child">
        {/* Profile Visual */}
        <div className="glass" data-aos="zoom-in">
          <div className="border">
            <img
              className="avtar"
              src="https://res.cloudinary.com/dg5gwixf1/image/upload/fl_preserve_transparency/v1748354790/1743698252144_lcwpsq.jpg?_s=public-apps"
              alt="Muhyo Tech"
              style={{ objectPosition: "top" }}
            />
          </div>
        </div>

        {/* Branding */}
        <div className="Info" data-aos="fade-up">
          <div>MUHYO</div>
          <span>TECH</span>
        </div>

        {/* Dynamic Roles */}
        <div
          className="typewriter-wrap"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          CREATING{" "}
          <span>
            {typeEffect} <Cursor cursorStyle="|" cursorColor="#6366f1" />
          </span>
        </div>

        {/* Explore Button */}
        <div className="Home-Actions" data-aos="fade-up" data-aos-delay="400">
          <button
            className="ExploreBtn"
            onClick={() =>
              document
                .getElementById("About")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Journey
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
