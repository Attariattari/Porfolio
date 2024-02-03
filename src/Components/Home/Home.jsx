import React from "react";
import "./Home.css";
import { useTypewriter, Cursor } from "react-simple-typewriter";
function Home() {
  const [typeEffect] = useTypewriter({
    words: ["UI / UX Designer", "Web Developer", "Web Designer", "Freelancer"],
    loop: {},
    typeSpeed: 150,
    deleteSpeed: 70,
  });
  return (
    <div className="bg-slate-700 text-white Home ">
      <div className="child flex justify-center items-center flex-col">
        <div className="glass flex justify-center items-center rounded-full ">
          <div className="border rounded-full">
            <img
              className="avtar rounded-full"
              src="/public/1706786499282.jpg"
              alt=""
            />
          </div>
        </div>
        <div className="Info">
          <div>Muhyo</div>
          <div
            style={{
              color: "#E3872D",
            }}
          >
            Tech
          </div>
        </div>
        <div className="text-3xl">
          I'm a{" "}
          <span
            className="font-bold"
            style={{
              color: "#E3872D",
            }}
          >
            {typeEffect} <Cursor />
          </span>
        </div>
      </div>
    </div>
  );
}

export default Home;
